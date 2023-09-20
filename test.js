// Import the class
import Chatbot from "./chatEngine.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// Import the player
import { playAudioFile } from "audic";

import { createInterface } from "readline"; // Import readline
const readline = createInterface({
	input: process.stdin,
	output: process.stdout,
});
const readLineAsync = (msg) => {
	return new Promise((resolve) => {
		readline.question(msg, (userRes) => {
			resolve(userRes);
		});
	});
};

// Create settings
const settings = {
	job_title: "Software Engineer",
	company_name: "Google",
	interviewer_name: "John",
	interviewer_surname: "Doe",
	my_name: "Juled",
	my_surname: "Zaganjori",
	language: "English",
	tts_voice: "en-US-RogerNeural",
	speechLanguage: "en-US",
	link_to_resume: "https://juledz.com/resume.pdf",
};

// Initialize the chatbot
const chatbot = new Chatbot();
await chatbot.initialize(settings);
// Start CLI chat
while (true) {
	// Get user input through CLI
	// const userInput = await readLineAsync("You: ");
	// Get user input through speech
	const userInput = await chatbot.speechToText();
	// Get chatbot response
	const response = await chatbot.chat(userInput);
	// Convert text to speech
	const speechData = await chatbot.textToSpeech(response);
	// Play audio
	await playAudioFile(speechData[0]);
}
