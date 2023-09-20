import { useState, useEffect } from "react";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export const useSpeechRecognition = (speechLanguage, tts_voice) => {
	const [speechText, setSpeechText] = useState("");

	let speechConfig = sdk.SpeechConfig.fromSubscription(import.meta.env.VITE_AZURE_SPEECH_KEY, import.meta.env.VITE_AZURE_SPEECH_REGION);

	speechConfig.speechSynthesisVoiceName = tts_voice;
	speechConfig.speechRecognitionLanguage = speechLanguage;

	let speechAudioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
	let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, speechAudioConfig);

	const updateSpeechConfig = (newSpeechLanguage, newTtsVoice) => {
		speechConfig.speechSynthesisVoiceName = newTtsVoice;
		speechConfig.speechRecognitionLanguage = newSpeechLanguage;
		speechRecognizer = new sdk.SpeechRecognizer(speechConfig, speechAudioConfig);
	};

	const startListening = () => {
		setIsListening(true);

		speechRecognizer.recognizing = (_, event) => {
			setSpeechText(event.result.text);
		};

		speechRecognizer.recognized = (_, event) => {
			setSpeechText(event.result.text);
		};

		speechRecognizer.startContinuousRecognitionAsync();
	};

	const stopListening = () => {
		setIsListening(false);
		speechRecognizer.stopContinuousRecognitionAsync();
	};

	return {
		startListening,
		stopListening,
		speechText,
		updateSpeechConfig,
	};
};
