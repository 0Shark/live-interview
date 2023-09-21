import React, { useState, useEffect } from "react";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { useChatbot } from "./hooks/useChatbot";
import debounce from "lodash.debounce";
import ErrorDisplay from "./ErrorDisplay";
import SettingsDisplay from "./SettingsDisplay";

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

	const [visible, setVisible] = useState(false);

	const [isChatbotReady, setIsChatbotReady] = useState(false);

	const { initChatbot, sendMessage, error } = useChatbot(setResponse, settings, setIsChatbotReady);

	useEffect(() => {
		initChatbot().then((ready) => {
			setIsChatbotReady(ready);
		});

		updateSpeechConfig(settings.speechLanguage, settings.tts_voice);
	}, [settings]);

	const [speechText, setSpeechText] = useState("");
	const [listening, setListening] = useState(false);

	const { startListening, stopListening, updateSpeechConfig } = useSpeechRecognition(
		settings.speechLanguage,
		settings.tts_voice,
		speechText,
		setSpeechText,
		setListening
	);

	const debouncedSendMessage = debounce((message) => {
		if (!message) return;
		if (listening) {
			stopListening();
		}
		sendMessage(message);
	}, 500);

	const toggleListening = () => {
		if (listening) {
			console.log("stop listening");
			stopListening();
		} else {
			console.log("start listening");
			startListening();
		}
	};

	return (
		<div className="chatbotInputWrap">
			{isChatbotReady ? (
				<section className="chatbotInputContainer">
					<div className="chatbotInput" data-listening={listening}>
						<div className="chatbotInput_container">
							<form onSubmit={(e) => e.preventDefault()}>
								<input value={speechText} onChange={(e) => setSpeechText(e.target.value)} placeholder="Type a message..." />

								<button className="mircrophone" onClick={toggleListening}>
									<i className="fa fa-microphone" />
								</button>

								<button type="submit" onClick={() => debouncedSendMessage(speechText)}>
									<i className="fa fa-paper-plane" />
								</button>
							</form>
							<div className="settingsButton" onClick={() => setVisible(true)}>
								<i className="fas fa-cog"></i>
							</div>
						</div>
					</div>
					<div className="chatbotSettings" data-visible={visible}>
						<SettingsDisplay settings={settings} setSettings={setSettings} visible={visible} setVisible={setVisible} />
					</div>
				</section>
			) : (
				<ErrorDisplay error={error} />
			)}
		</div>
	);
};

export default UserInput;
