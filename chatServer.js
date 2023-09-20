import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import Chatbot from "./chatEngine.js";

dotenv.config();

// Express
const app = express();

// Socket.io
const server = createServer(app);
const io = new Server(server);

// Chatbot
const chatbot = new Chatbot();

app.use(express.static("public"));

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
			chatbot.initialize(settings);
			socket.emit("response", true);
		} catch (err) {
			console.log(err);
			socket.emit("response", false);
		}
	});

	socket.on("question", (data) => {
		data = JSON.parse(JSON.stringify(data));
		console.log(`QUESTION (${socket.id}): ${data.question}`);
		async function chat() {
			const response = await chatbot.chat(data.question);
			const speechData = await chatbot.textToSpeech(response);
			console.log(`RESPONSE (${socket.id}): ${response}`);
			console.log(`AUDIO (${socket.id}): ${speechData}`);
			socket.emit("response", speechData);
		}
		chat();
	});
});

io.on("disconnect", (socket) => {
	console.log(`DISCONNECTED ${socket.id}`);
	chatbot.close();
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
	console.log("server started at port " + port);
});
