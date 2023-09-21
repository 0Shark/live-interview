import React, { useState, useEffect, useRef } from "react";

const SettingsDisplay = ({ settings, setSettings, visible, setVisible }) => {
	const formRef = useRef(null);
  const [newSettings, setNewSettings] = useState(settings);

	const updateSettings = (e) => {
		e.preventDefault();
		const formData = new FormData(formRef.current);
		const newSettings = Object.fromEntries(formData.entries());

		if (validateSettings(e)) {
			setSettings(newSettings);
		} else {
      console.log("Invalid settings");
    }
	};

	const validateSettings = (e) => {
		const { name, value } = e.target;
		let valid = true;
		if (name === "link_to_resume") {
			if (!value.startsWith("http")) {
				e.target.setCustomValidity("Please enter a valid URL.");
			} else {
				e.target.setCustomValidity("");
			}
		}

		if (name === "my_name" || name === "my_surname") {
			if (!value) {
				e.target.setCustomValidity("Please enter your name.");
			} else {
				e.target.setCustomValidity("");
			}
		}

		if (name === "interviewer_name" || name === "interviewer_surname") {
			if (!value) {
				e.target.setCustomValidity("Please enter the interviewer's name.");
			} else {
				e.target.setCustomValidity("");
			}
		}

		if (name === "company_name" || name === "job_title") {
			if (!value) {
				e.target.setCustomValidity("Please enter the company name.");
			} else {
				e.target.setCustomValidity("");
			}
		}

		if (name === "language" || name === "tts_voice" || name === "speechLanguage") {
			if (!value) {
				e.target.setCustomValidity("Please select a language.");
			} else {
				e.target.setCustomValidity("");
			}
		}

		if (e.target.checkValidity()) {
			e.target.classList.remove("invalid");
		} else {
			e.target.classList.add("invalid");
			valid = false;
		}

		return valid;
	};

	// Render the settings
	return (
		<div className="settingsContainer">
			<div className="closeButton" onClick={() => setVisible(false)}>
				<i className="fas fa-times"></i>
			</div>
			<h2>Settings</h2>
      <p>Updating the settings will restart the chatbot.</p>
			<form className="settings" onSubmit={updateSettings} ref={formRef}>
				<div className="setting">
					<label htmlFor="job_title">Job Title</label>
					<input type="text" name="job_title" id="job_title" value={newSettings.job_title} onChange={(e) => setNewSettings({ ...newSettings, job_title: e.target.value })} />
				</div>
				<div className="setting">
					<label htmlFor="company_name">Company Name</label>
					<input type="text" name="company_name" id="company_name" value={newSettings.company_name} onChange={(e) => setNewSettings({ ...newSettings, company_name: e.target.value })} />
				</div>
				<div className="setting">
					<label htmlFor="interviewer_name">Interviewer Name</label>
					<input type="text" name="interviewer_name" id="interviewer_name" value={newSettings.interviewer_name} onChange={(e) => setNewSettings({ ...newSettings, interviewer_name: e.target.value })} />
				</div>
				<div className="setting">
					<label htmlFor="interviewer_surname">Interviewer Surname</label>
					<input type="text" name="interviewer_surname" id="interviewer_surname" value={newSettings.interviewer_surname} onChange={(e) => setNewSettings({ ...newSettings, interviewer_surname: e.target.value })} />
				</div>
				<div className="setting">
					<label htmlFor="my_name">My Name</label>
					<input type="text" name="my_name" id="my_name" value={newSettings.my_name} onChange={(e) => setNewSettings({ ...newSettings, my_name: e.target.value })} />
				</div>
				<div className="setting">
					<label htmlFor="my_surname">My Surname</label>
					<input type="text" name="my_surname" id="my_surname" value={newSettings.my_surname} onChange={(e) => setNewSettings({ ...newSettings, my_surname: e.target.value })} />
				</div>
				<div className="setting">
					<label htmlFor="language">Language</label>
					<select name="language" id="language" value={newSettings.language} onChange={(e) => setNewSettings({ ...newSettings, language: e.target.value })}>
						<option value="English">English</option>
						<option value="German">German</option>
					</select>
				</div>
				<div className="setting">
					<label htmlFor="tts_voice">Text-to-Speech Voice</label>
					<select name="tts_voice" id="tts_voice" value={newSettings.tts_voice} onChange={(e) => setNewSettings({ ...newSettings, tts_voice: e.target.value })}>
						<option value="en-US-RogerNeural">en-US-RogerNeural</option>
						<option value="en-US-AriaNeural">en-US-AriaNeural</option>
						<option value="en-US-GuyNeural">en-US-GuyNeural</option>
						<option value="en-US-JennyNeural">en-US-JennyNeural</option>
						<option value="de-DE-ConradNeural">de-DE-ConradNeural</option>
						<option value="de-DE-KatjaNeural">de-DE-KatjaNeural</option>
						<option value="de-DE-MarkNeural">de-DE-MarkNeural</option>
						<option value="de-DE-PetraNeural">de-DE-PetraNeural</option>
					</select>
				</div>
				<div className="setting">
					<label htmlFor="speechLanguage">Speech Language</label>
					<select name="speechLanguage" id="speechLanguage" value={newSettings.speechLanguage} onChange={(e) => setNewSettings({ ...newSettings, speechLanguage: e.target.value })}>
						<option value="en-US">en-US</option>
						<option value="de-DE">de-DE</option>
					</select>
				</div>
				<div className="setting">
					<label htmlFor="link_to_resume">Link to Resume</label>
					<input type="text" name="link_to_resume" id="link_to_resume" value={newSettings.link_to_resume} onChange={(e) => setNewSettings({ ...newSettings, link_to_resume: e.target.value })} />
				</div>

				<div className="setting__button">
					<button className="btn_outline" type="submit" onClick={() => setVisible(false)}>
						Save Settings
					</button>
				</div>
			</form>
		</div>
	);
};

export default SettingsDisplay;
