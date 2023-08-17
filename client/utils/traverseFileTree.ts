import { nanoid } from "nanoid";

import type { ImageData } from "@/types";

/**
 * Resize an image to fit within a specified width and height.
 * @param img - the source image
 * @param maxWidth - the maximum width for the output image
 * @param maxHeight - the maximum height for the output image
 * @return a promise that resolves with the data URL for the resized image
 */
export function resizeImage(
	img: HTMLImageElement,
	maxWidth: number,
	maxHeight: number
): Promise<string> {
	return new Promise(resolve => {
		const canvas = document.createElement("canvas");
		let { width, height } = img;

		// Calculate new dimensions, maintaining aspect ratio
		if (width > height) {
			if (width > maxWidth) {
				height *= maxWidth / width;
				width = maxWidth;
			}
		} else if (height > maxHeight) {
			width *= maxHeight / height;
			height = maxHeight;
		}

		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext("2d");
		ctx!.drawImage(img, 0, 0, width, height);
		const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
		canvas.remove();
		resolve(dataUrl); // Output as jpeg with 70% quality
	});
}

export async function traverseFileTree(
	item: any,
	onLoad: (imageData: ImageData) => void,
	path = ""
) {
	if (item.isFile) {
		item.file((file: File) => {
			const reader = new FileReader();
			reader.onload = event => {
				const image = new Image();
				image.src = event.target!.result as string;
				image.onload = async () => {
					const maxWidth = 300;
					const resizedDataUrl = await resizeImage(
						image,
						maxWidth,
						maxWidth * (1535 / 640) // SDXL max
					);
					onLoad({
						id: nanoid(),
						data: image.src,
						src: resizedDataUrl,
						name: file.name,
						width: image.width,
						height: image.height,
						caption: "",
					});
				};
			};

			reader.readAsDataURL(file);
		});
	} else if (item.isDirectory) {
		const dirReader = item.createReader();
		dirReader.readEntries(async (entries: any) => {
			for (let i = 0; i < entries.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				await traverseFileTree(entries[i], onLoad, path + item.name + "/");
			}
		});
	}
}
