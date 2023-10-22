import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { useControls } from "leva";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const animationFiles = {
	"Type To Sit": "/animations/Type To Sit.fbx",
	Typing: "/animations/Typing.fbx",
	Victory: "/animations/Victory.fbx",
	"Wave Hip Hop Dance": "/animations/Wave Hip Hop Dance.fbx",
	Waving: "/animations/Waving.fbx",
	"Asking Question": "/animations/Asking Question.fbx",
	"Having A Meeting": "/animations/Having A Meeting.fbx",
	"Hip Hop Dancing": "/animations/Hip Hop Dancing.fbx",
	Idle: "/animations/Idle.fbx",
	"Seated Idle": "/animations/Seated Idle.fbx",
	"Sit To Stand": "/animations/Sit To Stand.fbx",
	"Sit To Type": "/animations/Sit To Type.fbx",
	"Sitting Clap": "/animations/Sitting Clap.fbx",
	"Sitting Disapproval": "/animations/Sitting Disapproval.fbx",
	"Sitting Idle": "/animations/Sitting Idle.fbx",
	"Sitting Talking": "/animations/Sitting Talking.fbx",
	"Sitting Thumbs Up": "/animations/Sitting Thumbs Up.fbx",
	"Sitting Victory": "/animations/Sitting Victory.fbx",
	"Stand To Sit": "/animations/Stand To Sit.fbx",
	"Standing Greeting": "/animations/Standing Greeting.fbx",
};

const sittingTalkingAnimations = ["Sitting Talking", "Sitting Idle", "Having A Meeting"];

// Preload animations
Object.values(animationFiles).forEach((url) => {
	useFBX.preload(url);
});

// ReadyPlayerMe visemes map
const azureToOculusVisemes = {
	0: "viseme_sil",
	1: "viseme_PP",
	2: "viseme_aa",
	3: "viseme_aa",
	4: "viseme_E",
	5: "viseme_RR",
	6: "viseme_I",
	7: "viseme_U",
	8: "viseme_O",
	9: "viseme_aa",
	10: "viseme_O",
	11: "viseme_I",
	12: "viseme_sil",
	13: "viseme_RR",
	14: "viseme_nn",
	15: "viseme_SS",
	16: "viseme_CH",
	17: "viseme_TH",
	18: "viseme_FF",
	19: "viseme_DD",
	20: "viseme_kk",
	21: "viseme_PP",
};

export function Avatar(props) {
	// Development
	// const { playAudio, headFollow, smoothMorphTarget, morphTargetSmoothing, animationName } = useControls({
	// 	playAudio: true,
	// 	headFollow: true,
	// 	smoothMorphTarget: true,
	// 	morphTargetSmoothing: 0.5,
	// 	animationName: {
	// 		value: "Having A Meeting",
	// 		options: Object.keys(animationFiles),
	// 	},
	// });
	// Production
	const { playAudio, headFollow, smoothMorphTarget, morphTargetSmoothing, animationName } = {
		playAudio: true,
		headFollow: true,
		smoothMorphTarget: true,
		morphTargetSmoothing: 0.5,
		animationName: {
			value: "Having A Meeting",
			options: Object.keys(animationFiles),
		},
	};

	let audio = useMemo(() => {
		let audioPath = props.response.speechData.audioFilePath;
		if (!audioPath) {
			audioPath = "";
		}
		// turn to path to URL which is inside the public/temp/audio folder
		audioPath = audioPath.replace(/\\/g, "/");
		// Get audio file name
		audioPath = audioPath.split("/").pop();
		// Add URL to audio file
		audioPath = `/temp/audio/${audioPath}`;

		console.log("Received response: ", props.response.response);

		return new Audio(audioPath);
	}, [props.response]);

	let lipsync = useMemo(() => {
		let lipsync = props.response.speechData.visemes;
		if (lipsync) {
			return lipsync;
		} else {
			return [];
		}
	}, [props.response]);

	useFrame(() => {
		let currentAudioTime = audio.currentTime;
		if (audio.paused || audio.ended) {
			setAnimation("Sitting Idle");
			return;
		}

		Object.values(azureToOculusVisemes).forEach((value) => {
			if (!smoothMorphTarget) {
				nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[value]] = 0;
				nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[value]] = 0;
			} else {
				nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[value]] = THREE.MathUtils.lerp(
					nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[value]],
					0,
					morphTargetSmoothing
				);

				nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[value]] = THREE.MathUtils.lerp(
					nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[value]],
					0,
					morphTargetSmoothing
				);
			}
		});

		for (let i = 0; i < lipsync.length; i++) {
			let visemeId = lipsync[i].visemeId;
			// lipsync[i].audioOffset is in milliseconds, so divide by 1000 to get seconds
			let visemeOffsetTime = lipsync[i].audioOffset / 1000;
			let nextVisemeOffsetTime = lipsync[i + 1] ? lipsync[i + 1].audioOffset / 1000 : 0;

			if (currentAudioTime >= visemeOffsetTime && currentAudioTime < nextVisemeOffsetTime) {
				if (!smoothMorphTarget) {
					nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[azureToOculusVisemes[visemeId]]] = 1;
					nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[azureToOculusVisemes[visemeId]]] = 1;
				} else {
					nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[azureToOculusVisemes[visemeId]]] = THREE.MathUtils.lerp(
						nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[azureToOculusVisemes[visemeId]]],
						1,
						morphTargetSmoothing
					);
					nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[azureToOculusVisemes[visemeId]]] = THREE.MathUtils.lerp(
						nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[azureToOculusVisemes[visemeId]]],
						1,
						morphTargetSmoothing
					);
				}

				// Blink sometimes
				if (Math.random() < 0.1) {
					nodes.EyeLeft.morphTargetInfluences[nodes.EyeLeft.morphTargetDictionary["blink"]] = 1;
					nodes.EyeRight.morphTargetInfluences[nodes.EyeRight.morphTargetDictionary["blink"]] = 1;
				}
				break;
			}
		}
	}, [audio]);

	const { nodes, materials } = useGLTF("/models/6505ad3b7a4b5e00b4da04e8.glb");
	const { animations: idleAnimation } = useFBX("/animations/Sitting Idle.fbx");

	const [animation, setAnimation] = useState("Sitting Idle");
	idleAnimation[0].name = "Sitting Idle";

	const group = useRef();

	// Load all custom animations
	let animationFilesArray = Object.values(animationFiles);
	let customAnimations = [];
	for (let i = 0; i < animationFilesArray.length; i++) {
		let { animations } = useFBX(animationFilesArray[i]);
		animations[0].name = Object.keys(animationFiles)[i];
		customAnimations.push(animations[0]);
	}
	const { actions } = useAnimations([idleAnimation[0], ...customAnimations], group);

	useEffect(() => {
		nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary["viseme_I"]] = 1;
		nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary["viseme_I"]] = 1;
		if (playAudio) {
			audio.play();
			// Choose one of the animations in the array sittingTalkingAnimations randomly
			setAnimation(sittingTalkingAnimations[Math.floor(Math.random() * sittingTalkingAnimations.length)]);
		} else {
			setAnimation("Sitting Idle");
			audio.pause();
		}
	}, [props.response, audio, playAudio]);

	useEffect(() => {
		if (actions[animation]) {
			actions[animation].reset().fadeIn(0.5).play();

			return () => actions[animation].fadeOut(0.5);
		} else {
			console.error(`Animation "${animation}" not found.`);
		}
	}, [animation]);

	useFrame((state) => {
		if (headFollow) {
			group.current.getObjectByName("Head").lookAt(state.camera.position);
		}
	});

	return (
		<group {...props} dispose={null} ref={group}>
			<primitive object={nodes.Hips} />
			<skinnedMesh geometry={nodes.Wolf3D_Body.geometry} material={materials.Wolf3D_Body} skeleton={nodes.Wolf3D_Body.skeleton} />
			<skinnedMesh geometry={nodes.Wolf3D_Outfit_Bottom.geometry} material={materials.Wolf3D_Outfit_Bottom} skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton} />
			<skinnedMesh
				geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
				material={materials.Wolf3D_Outfit_Footwear}
				skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
			/>
			<skinnedMesh geometry={nodes.Wolf3D_Outfit_Top.geometry} material={materials.Wolf3D_Outfit_Top} skeleton={nodes.Wolf3D_Outfit_Top.skeleton} />
			<skinnedMesh geometry={nodes.Wolf3D_Hair.geometry} material={materials.Wolf3D_Hair} skeleton={nodes.Wolf3D_Hair.skeleton} />
			<skinnedMesh
				name="EyeLeft"
				geometry={nodes.EyeLeft.geometry}
				material={materials.Wolf3D_Eye}
				skeleton={nodes.EyeLeft.skeleton}
				morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
				morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
			/>
			<skinnedMesh
				name="EyeRight"
				geometry={nodes.EyeRight.geometry}
				material={materials.Wolf3D_Eye}
				skeleton={nodes.EyeRight.skeleton}
				morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
				morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
			/>
			<skinnedMesh
				name="Wolf3D_Head"
				geometry={nodes.Wolf3D_Head.geometry}
				material={materials.Wolf3D_Skin}
				skeleton={nodes.Wolf3D_Head.skeleton}
				morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
				morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
			/>
			<skinnedMesh
				name="Wolf3D_Teeth"
				geometry={nodes.Wolf3D_Teeth.geometry}
				material={materials.Wolf3D_Teeth}
				skeleton={nodes.Wolf3D_Teeth.skeleton}
				morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
				morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
			/>
		</group>
	);
}

useGLTF.preload("/models/6505ad3b7a4b5e00b4da04e8.glb");
