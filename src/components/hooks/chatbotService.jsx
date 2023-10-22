import { io } from "socket.io-client";

class ChatbotService {
	constructor() {
		// Production
		this.socket = io();

		// Development
		//this.socket = io("localhost:5000");
	}

	async init(settings) {
		this.socket.emit("init", settings);

		let response = await new Promise((resolve, reject) => {
			this.socket.on("responseInit", (response) => {
				if (response) {
					resolve(response);
				} else {
					reject(response);
				}
			});
		});

		return response;
	}

	async sendMessage(message) {
		this.socket.emit("message", { question: message });

		let response = await new Promise((resolve, reject) => {
			this.socket.on("responseMessage", (response) => {
				if (response) {
					resolve(response);
				} else {
					reject(response);
				}
			});
		});

		return response;
	}
}

export const chatbotService = new ChatbotService();
