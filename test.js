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
	link_to_resume: "https://juledz.com/resume.pdf",
};

// Initialize the chatbot
const chatbot = new Chatbot(settings);
await chatbot.initialize();
// Start CLI chat
while (true) {
	// Get user input
	const userInput = await readLineAsync("You: ");
	const response = await chatbot.chat(userInput);
	const audio = await chatbot.textToSpeech(response);
	console.log("Chatbot: " + response);
	// Play audio
	await playAudioFile(audio);
}
