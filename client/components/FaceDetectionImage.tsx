import { Box } from "@mui/joy";
import * as faceapi from "@vladmandic/face-api/dist/face-api.esm-nobundle.js";
import type { ImageProps } from "next/image";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { FaceBox } from "@/types";

export default function FaceDetectionImage({
	alt,
	onFace,
	noDetection,
	faceBox,
	...props
}: ImageProps & { onFace?(hasFace: FaceBox): void; noDetection?: boolean; faceBox?: FaceBox }) {
	const [box, setBox] = useState<FaceBox | undefined>(faceBox);
	const [modelsLoaded, setModelsLoaded] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);
	const imgRef = useRef<HTMLImageElement>(null);

	useEffect(() => {
		if (!noDetection) {
			const loadModels = async () => {
				const MODEL_URL = "/face-api/models";
				await faceapi.nets.tinyFaceDetector.load(MODEL_URL);
				await faceapi.nets.faceLandmark68Net.load(MODEL_URL);
				await faceapi.nets.faceRecognitionNet.load(MODEL_URL);
			};

			loadModels().then(() => {
				setModelsLoaded(true);
			});
		}
	}, [noDetection]);

	useEffect(() => {
		const detectFace = async () => {
			if (imgRef.current && modelsLoaded && imageLoaded) {
				const detections = await faceapi.detectAllFaces(
					imgRef.current,
					new faceapi.TinyFaceDetectorOptions()
				);
				if (detections.length > 0) {
					const detectionBox = detections[0].box;

					// Use naturalWidth and naturalHeight to get original image dimensions
					const xPercentage = (detectionBox.x / imgRef.current.naturalWidth) * 100;
					const yPercentage = (detectionBox.y / imgRef.current.naturalHeight) * 100;
					const widthPercentage =
						(detectionBox.width / imgRef.current.naturalWidth) * 100;
					const heightPercentage =
						(detectionBox.height / imgRef.current.naturalHeight) * 100;

					setBox({
						xPercentage,
						yPercentage,
						widthPercentage,
						heightPercentage,
					});
					if (onFace) {
						onFace({
							xPercentage,
							yPercentage,
							widthPercentage,
							heightPercentage,
						});
					}
				} else if (onFace) {
					setBox({
						xPercentage: 10,
						yPercentage: 10,
						widthPercentage: 80,
						heightPercentage: 80,
					});
					onFace({
						xPercentage: 10,
						yPercentage: 10,
						widthPercentage: 80,
						heightPercentage: 80,
					});
				}
			}
		};

		if (!noDetection) {
			detectFace();
		}
	}, [modelsLoaded, imageLoaded, noDetection]);

	return (
		<Box
			sx={{
				position: "relative",
				overflow: "hidden",
				display: "inline-block",
				width: props.style?.width || "auto",
				height: props.style?.height || "auto",
			}}
		>
			<Image
				ref={imgRef}
				src={props.src}
				height={props.height}
				width={props.width}
				style={props.style}
				alt={alt}
				onLoad={() => setImageLoaded(true)}
			/>
			{box && (
				<div
					style={{
						position: "absolute",
						boxShadow:
							"0 0 0 2px rgba(255 255 255 / 0.5), 0 0 0 100vmax rgba(0 0 0 / 0.6)",
						borderRadius: 4,
						top: `${box.yPercentage}%`,
						left: `${box.xPercentage}%`,
						width: `${box.widthPercentage}%`,
						height: `${box.heightPercentage}%`,
					}}
				></div>
			)}
		</Box>
	);
}
