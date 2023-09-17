import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { useControls } from "leva";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const animationFiles = {
	"Type To Sit": "/animations/Type To Sit.fbx",
	"Typing": "/animations/Typing.fbx",
	"Victory": "/animations/Victory.fbx",
	"Wave Hip Hop Dance": "/animations/Wave Hip Hop Dance.fbx",
	"Waving": "/animations/Waving.fbx",
	"Asking Question": "/animations/Asking Question.fbx",
	"Having A Meeting": "/animations/Having A Meeting.fbx",
	"Hip Hop Dancing": "/animations/Hip Hop Dancing.fbx",
	"Idle": "/animations/Idle.fbx",
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

// Preload animations
Object.values(animationFiles).forEach((url) => {
	useFBX.preload(url);
});

const corresponding = {
	A: "viseme_PP",
	B: "viseme_kk",
	C: "viseme_I",
	D: "viseme_AA",
	E: "viseme_O",
	F: "viseme_U",
	G: "viseme_FF",
	H: "viseme_TH",
	X: "viseme_PP",
};

export function Avatar(props) {
	const { playAudio, script, headFollow, smoothMorphTarget, morphTargetSmoothing, animationName, seated } = useControls({
		playAudio: false,
    seated: false,
		headFollow: true,
		smoothMorphTarget: true,
		morphTargetSmoothing: 0.5,
		script: {
			value: "welcome",
			options: ["welcome", "pizzas"],
		},
		animationName: {
			value: "Sitting Idle",
			options: Object.keys(animationFiles),
		},
	});

	const audio = useMemo(() => new Audio(`/audios/${script}.mp3`), [script]);
	const jsonFile = useLoader(THREE.FileLoader, `audios/${script}.json`);
	const lipsync = JSON.parse(jsonFile);

	useFrame(() => {
		const currentAudioTime = audio.currentTime;
		if (audio.paused || audio.ended) {
			setAnimation("Sitting Idle");
			return;
		}

		Object.values(corresponding).forEach((value) => {
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

		for (let i = 0; i < lipsync.mouthCues.length; i++) {
			const mouthCue = lipsync.mouthCues[i];
			if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
				if (!smoothMorphTarget) {
					nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[corresponding[mouthCue.value]]] = 1;
					nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[corresponding[mouthCue.value]]] = 1;
				} else {
					nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[corresponding[mouthCue.value]]] = THREE.MathUtils.lerp(
						nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[corresponding[mouthCue.value]]],
						1,
						morphTargetSmoothing
					);
					nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[corresponding[mouthCue.value]]] = THREE.MathUtils.lerp(
						nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[corresponding[mouthCue.value]]],
						1,
						morphTargetSmoothing
					);
				}

				break;
			}
		}
	});

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
      setAnimation(animationName);
    } else {
      setAnimation("Sitting Idle");
      audio.pause(); 
    }
	}, [playAudio, script, animationName]);

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
