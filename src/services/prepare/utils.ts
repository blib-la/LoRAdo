import { readFile } from "fs/promises";
import fs from "node:fs/promises";

import sizeOf from "image-size";

/**
 * Ensures a directory exists; if not, creates it.
 * @param {string} dirPath - The path to the directory.
 */
export async function ensureDirExists(dirPath: string) {
	try {
		await fs.access(dirPath);
	} catch (err) {
		await fs.mkdir(dirPath, { recursive: true });
	}
}

/**
 *
 * @param height
 * @param width
 * @param sizes
 * @returns {[number,number]}
 */
export function getClosestSize(
	{ height, width }: { height: number; width: number },
	sizes: [number, number][]
) {
	let closestSize = null;
	let smallestDifference = Infinity;

	// Calculate the aspect ratio of the provided dimensions
	const aspectRatio = width / height;

	for (const [width, height] of sizes) {
		const currentRatio = width / height;
		const difference = Math.abs(currentRatio - aspectRatio);

		if (difference < smallestDifference) {
			smallestDifference = difference;
			closestSize = [width, height];
		}
	}

	return closestSize;
}

/**
 *
 * @param filePath
 * @returns {Promise<{width: number, height: number}>}
 */
export async function getImageDimensions(filePath: string) {
	try {
		const imageBuffer = await readFile(filePath);
		const dimensions = sizeOf(imageBuffer);
		return {
			width: dimensions.width,
			height: dimensions.height,
		};
	} catch (error) {
		console.error("Error reading the image:", error);
		throw error;
	}
}
