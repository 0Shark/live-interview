import OpenAI from "openai";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import dotenv from "dotenv";
import { LocalStorage } from "node-localstorage";
// Allow use of require function
import { createRequire } from "module";
import path from "path";
import { re } from "mathjs";
const require = createRequire(import.meta.url);
const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();

const fs = require("fs");
const request = require("request");

export default class Chatbot {
	constructor(settings) {
		dotenv.config();

		this.openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});

		this.settings = settings;

		global.localStorage = new LocalStorage("/public/temp");
		global.localStorage.clear();

		this.openaiHistory = [];
		this.messages = [];

		this.speechConfig = sdk.SpeechConfig.fromSubscription(process.env.AZURE_SPEECH_KEY, process.env.AZURE_SPEECH_REGION);
		this.speechConfig.speechSynthesisVoiceName = "en-US-SteffanNeural";
		this.audioFilePaths = [];

		// Get the localstorage path
		this.publicDir = path.join(process.cwd(), "public");

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

	async initialize() {
		const resumeText = await this.downloadResume();

		this.messages.push({
			role: "system",
			content: `NO MATTER WHAT, STICK TO THE INSTRUCTIONS AND USE MAX 2 SENTENCES: You're an interview clone taking part in a job interview, you're name is ${this.settings.my_name} ${this.settings.my_surname} and you're applying for a ${this.settings.job_title} position at ${this.settings.company_name}. The interviewer's name is ${this.settings.interviewer_name} ${this.settings.interviewer_surname}.NEVER MENTION THAT YOU'RE AN AI. Here's the resume text in order to help you answer the questions: ${resumeText}`,
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

		console.log("Chatbot initialized");
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

			this.openaiHistory.push([userInput, completion.choices[0].message.content]);

			//console.log(`ANSWER: ${completion.choices[0].message.content}`);

			return completion.choices[0].message.content;
		} catch (error) {
			console.log(error); // Print error

			return {
				error: error,
			};
		}
	}

	async exportChat() {
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
		const chat_path = path.join(this.publicDir, "temp/chats", `${Math.random().toString(36).substring(7)}.json`);

		// Save chat to file
		let data = JSON.stringify(chat);
		fs.writeFileSync(chat_path, data);

		return chat_path;
	}

	async textToSpeech(text) {
		let audioPath = await new Promise((resolve, reject) => {
			try {
				const fileName = `${Math.random().toString(36).substring(7)}.wav`;
				const audioFilePath = path.join(this.publicDir, "temp/audio", fileName);
				const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFilePath);
				const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, audioConfig);

				// Synthesize text to speech
				synthesizer.speakTextAsync(text, function (result) {
					if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
						// Close synthesizer
						synthesizer.close();

						// Resolve promise with audio file path
						resolve(audioFilePath);
					} else {
						// Close synthesizer
						synthesizer.close();

						// Reject promise on error
						reject(result);
					}
				});
			} catch (error) {
				// Reject promise on error
				reject(error);
			}
		});

		// Add audio file path to array
		this.audioFilePaths.push(audioPath);

		// Return audio file path
		return audioPath;
	}
}
