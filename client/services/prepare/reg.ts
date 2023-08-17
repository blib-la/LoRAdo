import fs from "node:fs/promises";
import path from "node:path";

import axios from "axios";
import { createApi } from "unsplash-js";
import type { ApiResponse } from "unsplash-js/dist/helpers/response";
import type { Random } from "unsplash-js/dist/methods/photos/types";

import { cropImageToFace, loadModels } from "./crop";
import { sizes } from "./sizes";
import { ensureDirExists, getClosestSize } from "./utils";

interface User {
	name: string;
	username: string;
	profile_image: string;
	profile_url: string;
}

interface ImageData {
	imageName: string; // Adjust type as needed
	id: string | number; // Adjust type as needed
	description: string | null;
	alt_description: string | null;
	user: User;
	link: string;
}

if (!process.env.UNSPLASH_ACCESS_KEY) {
	throw new Error("Missing UNSPLASH_ACCESS_KEY");
}

const unsplash = createApi({
	accessKey: process.env.UNSPLASH_ACCESS_KEY,
});

export async function getRegularisationImages({
	className,
	totalImagesToFetch,
	crop = false,
	outDir: outDir_,
}: {
	className: string;
	totalImagesToFetch: number;
	crop?: boolean;
	outDir: string;
}) {
	const outDir = path.join(outDir_, `1_${className}`);

	await ensureDirExists(outDir);
	await loadModels();

	let totalImagesFetched = 0;
	let imageCounter = 0;
	const fetchedImageIds = new Set();
	const imageAttributions: ImageData[] = [];

	async function fetchCropAndSave(imageInfo: Random, zoomLevel = 0) {
		if (fetchedImageIds.has(imageInfo.id)) {
			console.warn(`Skipping duplicate image with ID ${imageInfo.id}`);
			return;
		}

		const imageResponse = await axios.get(imageInfo.urls.full, {
			responseType: "arraybuffer",
		});
		// We either crop to all sizes or just use the closest resolution
		const requestedSizes = crop
			? sizes
			: [
					getClosestSize({ height: imageInfo.height, width: imageInfo.width }, sizes) ?? [
						1024, 1024,
					],
			  ];

		for (const [width, height] of requestedSizes) {
			const imageName = `${className} (${imageCounter + 1})`;
			const imagePath = path.join(outDir, `${imageName}.jpg`);
			const captionPath = path.join(outDir, `${imageName}.txt`);
			// eslint-disable-next-line no-await-in-loop
			const croppedResult = await cropImageToFace(
				imageResponse.data,
				{ width, height },
				zoomLevel
			);
			// Store the relevant attribution information
			imageAttributions.push({
				imageName,
				id: imageInfo.id,
				description: imageInfo.description,
				// eslint-disable-next-line camelcase
				alt_description: imageInfo.alt_description,
				user: {
					name: imageInfo.user.name,
					username: imageInfo.user.username,
					// eslint-disable-next-line camelcase
					profile_image: imageInfo.user.profile_image.small,
					// eslint-disable-next-line camelcase
					profile_url: `https://unsplash.com/@${imageInfo.user.username}`,
				},
				link: imageInfo.links.html,
			});
			// Write before each try
			// eslint-disable-next-line no-await-in-loop
			await fs.writeFile(
				path.join(outDir, "attributions.json"),
				JSON.stringify(imageAttributions, null, 2)
			);
			// eslint-disable-next-line no-await-in-loop
			await fs.writeFile(imagePath, croppedResult);
			// eslint-disable-next-line no-await-in-loop
			await fs.writeFile(captionPath, imageInfo.alt_description ?? "");
			console.log(`Saved image: ${imagePath} and caption: ${captionPath}`);
			imageCounter++;
		}

		totalImagesFetched++;

		// Add the imageId to the set after successfully processing
		fetchedImageIds.add(imageInfo.id);
	}

	while (totalImagesFetched < totalImagesToFetch) {
		const remainingImages = totalImagesToFetch - totalImagesFetched;
		const count = Math.min(10, remainingImages);

		// eslint-disable-next-line no-await-in-loop
		const result = (await unsplash.photos.getRandom({
			query: className,
			count,
		})) as ApiResponse<Random[]>;

		if (result?.response?.length) {
			for (const imageInfo of result.response) {
				try {
					if (totalImagesFetched < totalImagesToFetch) {
						// eslint-disable-next-line no-await-in-loop
						await fetchCropAndSave(imageInfo, 0);
					} else {
						break;
					}
				} catch (error) {
					console.error(
						`Error processing image from ${imageInfo.urls.full}:`,
						(error as Error).message
					);
				}
			}
		} else {
			console.log("No photos found or an error occurred.");
		}
	}

	if (totalImagesFetched < totalImagesToFetch) {
		console.warn(
			`Only fetched ${totalImagesFetched} images out of the desired ${totalImagesToFetch}.`
		);
	} else {
		console.log(`Total images fetched: ${totalImagesFetched}`);
	}
}

/*
Await getRegularisationImages({
  outDir: `./out/${Date.now()}`,
  className: "woman",
  totalImagesToFetch: 10,
  crop: true,
});
*/
