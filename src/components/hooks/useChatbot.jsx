import { useState } from "react";
import { chatbotService } from "./chatbotService";

export const useChatbot = (setResponse, settings) => {
	const [isChatbotReady, setIsChatbotReady] = useState(false);

	const initChatbot = async () => {
		try {
			await chatbotService.init(settings);
			setIsChatbotReady(true);
		} catch (error) {
			setError(error);
		}
	};

	const sendMessage = async (message) => {
		const response = await chatbotService.sendMessage(message);
		setResponse(response);
	};

	const [error, setError] = useState(null);

	return {
		isChatbotReady,
		initChatbot,
		sendMessage,
    error
	};
};
