import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import UserInput from "./components/UserInput";
import { useState } from "react";

function App() {
	const [response, setResponse] = useState();

	return (
		<div className="canvas-wrapper">
			<Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }} className="canvas">
				<color attach="background" args={["#ececec"]} />
				<Experience response={response} />
			</Canvas>
			<UserInput setResponse={setResponse} />
		</div>
	);
}

export default App;
