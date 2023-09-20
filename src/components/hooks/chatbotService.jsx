import { io } from "socket.io-client";

class ChatbotService {
	constructor() {
		this.host = window.location.hostname;
		this.socket = io("ws://" + this.host + ":80");
	}

	async init(settings) {
		this.socket.emit("init", settings);

		let response = await new Promise((resolve, reject) => {
			socket.on("responseInit", (response) => {
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
		this.socket.emit("message", message);

		let response = await new Promise((resolve, reject) => {
			socket.on("responseMessage", (response) => {
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
