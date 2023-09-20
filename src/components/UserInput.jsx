import React, { useState, useEffect } from "react";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { useChatbot } from "./hooks/useChatbot";
import debounce from "lodash.debounce";

const UserInput = ({ setResponse }) => {
	const [settings, setSettings] = useState({
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
	});

	const { isChatbotReady, initChatbot, sendMessage, error } = useChatbot(setResponse, settings);

	useEffect(() => {
		initChatbot();
		updateSpeechConfig(settings.speechLanguage, settings.tts_voice);
	}, [settings]);

	const debouncedSendMessage = debounce((message) => {
		sendMessage(message);
	}, 1000);

	const { startListening, stopListening, speechText, updateSpeechConfig } = useSpeechRecognition(settings.speechLanguage, settings.tts_voice);

	const [listening, setListening] = useState(false);

	const toggleListening = () => {
		if (listening) {
			stopListening();
		} else {
			startListening();
		}
		setListening(!listening);
	};

	return (
		<section className="chatbotInputContainer">
			<div className="chatbotInput" data-listening={listening}>
				{isChatbotReady ? (
					<form onSubmit={(e) => e.preventDefault()}>
						<input value={speechText} readOnly />

						<button onClick={toggleListening}>
							<i className="fa fa-microphone" />
						</button>

						<button type="submit" onClick={() => debouncedSendMessage(speechText)}>
							<i className="fa fa-paper-plane" />
						</button>
					</form>
				) : (
					// <ErrorDisplay error={error} />
					<div className="errorDisplay">
						<h1>Oops!</h1>
						<p>Something went wrong. Please refresh the page.</p>
					</div>
				)}
			</div>
			<div className="chatbotSettings">
				{/* <SettingsDisplay settings={settings} setSettings={setSettings} /> */}
				Settings go here
			</div>
		</section>
	);
};

export default UserInput;
