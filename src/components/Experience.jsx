import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Avatar } from "./Avatar";
import { Desk } from "./Desk";
import { useEffect, useRef, useState } from "react";

export const Experience = ({response}) => {
	const controls = useRef();

	// useEffect(() => {
	// 	const handleMouseMove = (event) => {
  //     controls.current.setAzimuthalAngle((event.clientX / window.innerWidth) * Math.PI - Math.PI / 2);
  //     controls.current.setPolarAngle((event.clientY / window.innerHeight) * Math.PI - Math.PI / 2);
	// 	};

	// 	window.addEventListener("mousemove", handleMouseMove);
	// 	return () => {
	// 		window.removeEventListener("mousemove", handleMouseMove);
	// 	};
	// }, []);
  
	const texture = useTexture("textures/youtubeBackground.jpg");
	const viewport = useThree((state) => state.viewport);

	// Change the width and height of the plane to match the viewport
	const newWidth = viewport.width * 3.5;
	const newHeight = viewport.height * 3;

	return (
		<>
			<OrbitControls
				enableZoom={false} // Disable zoom to prevent camera from moving out
				minPolarAngle={Math.PI / 2} // Set minimum polar angle (elevation)
				maxPolarAngle={Math.PI / 1.9} // Set maximum polar angle (elevation)
				// Set maximum left/right rotation
				minAzimuthAngle={-Math.PI / 8}
				maxAzimuthAngle={Math.PI / 8}
				// Set center of rotation to be the center of the avatar
				target={[0, -0.9, 9]}
        ref={controls}
			/>
			<Avatar position={[0, -3, 5]} scale={2} response={response} />
			<Desk position={[-0.25, -3.05, 5]} scale={0.05} />
			<Environment preset="sunset" />
			<mesh>
				<planeGeometry args={[newWidth, newHeight]} />
				<meshBasicMaterial map={texture} />
			</mesh>
		</>
	);
};
