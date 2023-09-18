// Import the class
import Chatbot from "./chatEngine.js";

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
// Get a response
const response = await chatbot.chat("Hello Mr Zaganjori, how are you doing today?");
console.log(response);
const audio = await chatbot.textToSpeech(response);
console.log(audio);
// Play the audio
const player = new Audio(audio);
player.play();
