import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";

function App() {
	return (
		<div className="Canvas">
			<Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }}>
				<color attach="background" args={["#ececec"]} />
				<Experience />
			</Canvas>
      <div className="user-inputs">
      
      </div>
		</div>
	);
}

export default App;
