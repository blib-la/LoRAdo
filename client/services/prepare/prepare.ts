import fs from "node:fs/promises";
import path from "node:path";

import { cropImageToFace, loadModels } from "./crop";
import { ensureDirExists, getClosestSize, getImageDimensions } from "./utils";

import { ImageUpload } from "@/types";

export async function prepareImage({
	crop = false,
	image,
	repeats = 1,
	zoomLevels = [0],
	className,
	subject,
	outDir,
	counter,
	sizes,
}: {
	crop?: boolean;
	counter: number;
	image: string;
	repeats: number;
	zoomLevels?: number[];
	className: string;
	subject: string;
	outDir: string;
	sizes: [number, number][];
}) {
	await loadModels();
	const urls: ImageUpload[] = [];

	const outFolderName = path.join(outDir, "img", `${repeats}_${subject} ${className}`);

	await ensureDirExists(outFolderName);

	const imageInfo = await getImageDimensions(image);
	let caption: string;
	try {
		caption = await fs.readFile(image.replace(/\.jpe?g$/, ".txt"), "utf-8");
	} catch {
		caption = `${subject} ${className}`;
	}

	const requestedSizes = crop
		? sizes
		: [
				getClosestSize({ height: imageInfo.height!, width: imageInfo.width! }, sizes) ?? [
					1024, 1024,
				],
		  ];
	const failed: string[] = [];
	let localCounter = 0;
	for (const [width, height] of requestedSizes) {
		for (const zoomLevel of zoomLevels) {
			if (!failed.includes(image)) {
				try {
					// eslint-disable-next-line no-await-in-loop
					const result = await cropImageToFace(image, { width, height }, zoomLevel);
					++localCounter;
					const imageId = `${counter.toString().padStart(4, "0")}.${localCounter
						.toString()
						.padStart(2, "0")}`;
					const filename = `${subject}--${imageId}`;
					const outputPath = path.join(outFolderName, `${filename}.png`);
					const captionPath = path.join(outFolderName, `${filename}.txt`);
					urls.push({
						height,
						width,
						alt: caption,
						captionPath,
						outputPath,
						src: `/api/uploads/${outFolderName.split("training")[1]}/${filename}.png`
							.replaceAll("\\", "/")
							.replace(/\/+/g, "/"),
					});

					// eslint-disable-next-line no-await-in-loop
					await fs.writeFile(outputPath, result);
					// eslint-disable-next-line no-await-in-loop
					await fs.writeFile(captionPath, caption);
				} catch (error) {
					failed.push(image);
					console.log(`Failed on image:`, image);
				}
			}
		}
	}

	return urls;
}
/*
Let counter = 0;
const images = Array.from(
  { length: 30 },
  (_, index) => `./images/anamnesis33 (${index + 1}).jpg`,
);

const zoomLevels = [0];
const repeats = Math.max(5, Math.ceil(150 / images.length));
const className = "woman";
const subject = "ohwx";

await Promise.all(
  images.map((image) => {
    return prepareImage({
      image,
      counter: ++counter,
      sizes,
      zoomLevels,
      repeats,
      className,
      subject,
      outDir: `./outImg/${Date.now()}`,
    });
  }),
);
*/
