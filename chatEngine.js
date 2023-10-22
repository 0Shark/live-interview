import OpenAI from "openai";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import dotenv from "dotenv";
import { LocalStorage } from "node-localstorage";
// Allow use of require function
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();

const fs = require("fs");
const request = require("request");

export default class Chatbot {
	constructor(public_path) {
		dotenv.config();
		this.socket_id = null;
		this.openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});

		global.localStorage = new LocalStorage(`/${public_path}/temp`);
		global.localStorage.clear();

		this.openaiHistory = [];
		this.messages = [];

		this.speechConfig = sdk.SpeechConfig.fromSubscription(process.env.AZURE_SPEECH_KEY, process.env.AZURE_SPEECH_REGION);

		// Get the localstorage path
		this.publicDir = path.join(process.cwd(), public_path);

		// Create temp folder
		if (!fs.existsSync(this.publicDir + "/temp")) {
			fs.mkdirSync(this.publicDir + "/temp");
		}

		// Create audio folder
		if (!fs.existsSync(this.publicDir + "/temp/audio")) {
			fs.mkdirSync(this.publicDir + "/temp/audio");
		}

		// Create chats folder
		if (!fs.existsSync(this.publicDir + "/temp/chats")) {
			fs.mkdirSync(this.publicDir + "/temp/chats");
		}
	}

	async initialize(settings, socket_id) {
		this.settings = settings;
		this.socket_id = socket_id;

		this.speechConfig.speechSynthesisVoiceName = settings.tts_voice;
		this.speechConfig.speechRecognitionLanguage = settings.speechLanguage;
		this.audioFilePaths = [];

		this.speechAudioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
		this.speechRecognizer = new sdk.SpeechRecognizer(this.speechConfig, this.speechAudioConfig);

		const resumeText = await this.downloadResume();

		// Clear history
		this.openaiHistory = [];
		this.messages = [];

		this.messages.push({
			role: "system",
			content: `You're an interview clone taking part in a job interview: Rules: 1) Never mention you're an AI 2) Always give logical answer only based on the resume and the Identity information, never invent fake information 3) Always answer in the language you're asked to 4) Always answer in a human way, never use technical terms 5) Always answer in a way that is coherent with the previous answers but NEVER repeat yourself 6) NEVER repeat yourself. Identity: you're name is ${this.settings.my_name} ${this.settings.my_surname} and you're applying for a ${this.settings.job_title} position at ${this.settings.company_name}. The interviewer's name is ${this.settings.interviewer_name} ${this.settings.interviewer_surname}. From now on answer in ${this.settings.language} NEVER MENTION THAT YOU'RE AN AI. Here's the resume text in order to help you answer the questions: ${resumeText}`,
		});

		for (const [input_text, completion_text] of this.openaiHistory) {
			this.messages.push({
				role: "user",
				content: input_text,
			});
			this.messages.push({
				role: "assistant",
				content: completion_text,
			});
		}
	}

	async downloadResume() {
		return new Promise((resolve, reject) => {
			let resume_text = "";
			request(this.settings.link_to_resume, { encoding: null }, (err, res, body) => {
				if (err) throw err;
				let resume_text = "";
				fs.writeFileSync(this.publicDir + "/temp/resume.pdf", body);
				const buffer = fs.readFileSync(this.publicDir + "/temp/resume.pdf");
				const options = {};
				pdfExtract.extractBuffer(buffer, options, (err, data) => {
					if (err) return console.log(err);
					let content_array = data.pages[0].content;
					for (let i = 0; i < content_array.length; i++) {
						resume_text += content_array[i].str + " ";
					}
					resolve(resume_text);
				});
			});
		});
	}

	async chat(userInput) {
		this.messages.push({
			role: "user",
			content: userInput,
		});

		try {
			const completion = await this.openai.chat.completions.create({
				model: "gpt-3.5-turbo",
				messages: this.messages,
			});

			this.messages.push({
				role: "assistant",
				content: completion.choices[0].message.content,
			});

			//console.log(`ANSWER: ${completion.choices[0].message.content}`);
			await this.exportChat();

			return completion.choices[0].message.content;
		} catch (error) {
			console.log(error); // Print error

			return {
				error: error,
			};
		}
	}

	async exportChat() {
		console.log("Exporting chat...");
		const chat = [];
		for (let i = 0; i < this.messages.length; i++) {
			if (this.messages[i].role == "user" || this.messages[i].role == "assistant") {
				chat.push({
					role: this.messages[i].role,
					content: this.messages[i].content,
					audio: this.audioFilePaths[i],
				});
			}
		}
		const chat_path = path.join(this.publicDir, "temp/chats", `${this.socket_id}.json`);
		console.log(`Chat path: ${chat_path}`);
		// Save chat to file
		let data = JSON.stringify(chat);

		// Write to file
		console.log(`Writing to file: ${chat_path}`);
		await fs.writeFile(chat_path, data, (err) => {
			if (err) throw err;
			console.log("Chat saved to file.");
		});

		return chat_path;
	}

	async textToSpeech(text) {
		let visemes = [];

		const fileName = `${Math.random().toString(36).substring(7)}.wav`;
		const audioFilePath = path.join(this.publicDir, "temp/audio", fileName);

		const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFilePath);

		const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, audioConfig);

		synthesizer.visemeReceived = (s, e) => {
			visemes.push({ visemeId: e.visemeId, audioOffset: e.audioOffset / 10000 });
		};

		const ssml = `<speak version="1.0" xmlns="https://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${this.speechConfig.speechSynthesisVoiceName}">${text}</voice></speak>`;

		await new Promise((resolve, reject) => {
			synthesizer.speakSsmlAsync(ssml, (result) => {
				if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
					resolve();
				} else {
					reject(result);
				}
			});
		});

		// Close synthesizer
		synthesizer.close();

		// Return audio file path and visemes
		return { audioFilePath: audioFilePath, visemes: visemes };
	}

	async speechToText() {
		return new Promise((resolve, reject) => {
			try {
				console.log("[SYSTEM]: Speak into your microphone.");

				let text = "";
				this.speechRecognizer.recognized = (s, e) => {
					try {
						const res = e.result;
						console.log(`recognized: ${res.text}`);
					} catch (error) {
						console.log(error);
					}
				};

				this.speechRecognizer.sessionStarted = (s, e) => {
					console.log(`SESSION STARTED: ${e.sessionId}`);
				};

				console.log("Starting recognition...");
				try {
					this.speechRecognizer.recognizeOnceAsync(
						(result) => {
							console.log(`RECOGNIZED: Text=${result.text}`);
							text = result.text;
							resolve(text);
						},
						(error) => {
							console.log(error);
						}
					);
				} catch (err) {
					console.log(err);
				}

				process.stdin.on("keypress", (str, key) => {
					if (key.name === "space") {
						stopRecognition();
					}
				});

				const stopRecognition = async () => {
					try {
						console.log("Stopping recognition...");
						this.speechRecognizer.stopContinuousRecognitionAsync();
						resolve(text);
					} catch (error) {
						console.log(error);
					}
				};
			} catch (error) {
				console.log(error);
				reject(error);
			}
		});
	}

	async close() {
		console.log("Closing chatbot...");
		this.speechRecognizer.close();

		for (let i = 0; i < this.audioFilePaths.length; i++) {
			fs.unlinkSync(this.audioFilePaths[i]);
		}
	}
}
