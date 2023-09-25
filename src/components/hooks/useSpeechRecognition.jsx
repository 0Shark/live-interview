import { useState, useEffect } from "react";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export const useSpeechRecognition = (speechLanguage, tts_voice, speechText, setSpeechText, setListening) => {
	let speechConfig = sdk.SpeechConfig.fromSubscription(import.meta.env.VITE_AZURE_SPEECH_KEY, import.meta.env.VITE_AZURE_SPEECH_REGION);

	speechConfig.speechSynthesisVoiceName = tts_voice;
	speechConfig.speechRecognitionLanguage = speechLanguage;

	let speechAudioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
	let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, speechAudioConfig);

	const updateSpeechConfig = (newSpeechLanguage, newTtsVoice) => {
		speechConfig.speechSynthesisVoiceName = newTtsVoice;
		speechConfig.speechRecognitionLanguage = newSpeechLanguage;
		speechRecognizer.close();
		speechRecognizer = new sdk.SpeechRecognizer(speechConfig, speechAudioConfig);
	};

	const startListening = () => {
		setListening(true);
		speechRecognizer = new sdk.SpeechRecognizer(speechConfig, speechAudioConfig);

		speechRecognizer.recognizeOnceAsync((result) => {
			speechRecognizer.recognizing = (_, event) => {
				setSpeechText(event.result.text);
			};

			if (result.reason === ResultReason.RecognizedSpeech) {
				setSpeechText(result.text);
				setListening(false);
			}
		});
	};

	const stopListening = () => {
		speechRecognizer.recognizing = null;
		speechRecognizer.close();
		setListening(false);
	};

	return {
		startListening,
		stopListening,
		updateSpeechConfig
	};
};
