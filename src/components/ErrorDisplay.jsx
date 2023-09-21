import React from "react";

const ErrorDisplay = ({ error }) => {
	if (!error) return null;

	return (
		<div className="errorDisplay">
			<h3>Ooops!</h3>
      <p>Something went wrong. Please try again later or contact me at <a href="mailto:zaganjorijuled@gmail.com">zaganjorijuled [at] gmail.com</a> with the error below.</p>
			<p><b>Error:</b> {error.message}</p>
		</div>
	);
};

export default ErrorDisplay;