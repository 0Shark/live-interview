import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import Chatbot from "./chatEngine.js";
import process from "process";

dotenv.config();

// Express
const app = express();

app.use(express.static("dist"));

// Socket.io
const server = createServer(app);
let io = null;
// Development
if (process.env.NODE_ENV === "production") {
	io = new Server(server);
} else {
	io = new Server(server, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
		},
	});
}
// Chatbot
// If in production, save audio files to dist folder
const chatbot = new Chatbot(process.env.NODE_ENV === "production" ? "dist" : "public");

io.on("connection", (socket) => {
	console.log(`CONNECTED ${socket.id}`);

	socket.on("disconnect", (reason) => {
		global.localStorage.clear();
		console.log(`DISCONNECTED ${socket.id}: ${reason}`);
	});

	// Initialize the chatbot
	socket.on("init", (settings) => {
		settings = JSON.parse(JSON.stringify(settings));
		try {
			chatbot.initialize(settings, socket.id);
			socket.emit("responseInit", true);
			console.log(`INITIALIZED ${socket.id}`);
		} catch (err) {
			console.log(err);
			socket.emit("responseInit", false);
			console.log(`INIT FAILED ${socket.id}`);
		}
	});

	socket.on("message", (data) => {
		data = JSON.parse(JSON.stringify(data));
		console.log(`QUESTION (${socket.id}): ${data.question}`);
		async function chat() {
			try {
				const response = await chatbot.chat(data.question);
				const speechData = await chatbot.textToSpeech(response);
				console.log(`RESPONSE (${socket.id}): ${response}`);
				console.log(`AUDIO (${socket.id}): ${speechData.audioFilePath}`);
				socket.emit("responseMessage", {
					response: response,
					speechData: speechData,
				});
			} catch (err) {
				console.log(`ERROR (${socket.id}): ${err}`);
				socket.emit("responseMessage", {
					response: "Sorry, I don't understand that.",
					speechData: null,
				});
			}
		}
		chat();
	});
});

io.on("disconnect", (socket) => {
	console.log(`DISCONNECTED ${socket.id}`);
	async function closeChatbot() {
		await chatbot.close();
	}
	closeChatbot();
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
	console.log("server started at port " + port);
});
