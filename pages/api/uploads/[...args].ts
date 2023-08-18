import { createReadStream } from "fs";
import path from "node:path";

import * as fileType from "file-type";
import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

async function streamOptimizedImage(filePath: string, response: NextApiResponse) {
	const readStream = createReadStream(filePath);

	// Optimize the image on the fly
	const transformer = sharp().resize(1080).jpeg({ quality: 80 });

	readStream.pipe(transformer).pipe(response);

	// Deduce the MIME type and set the header
	const bufferChunk = readStream.read(4100) || Buffer.alloc(0);
	const type = await fileType.fileTypeFromBuffer(bufferChunk);
	response.setHeader("Content-Type", type?.mime || "application/octet-stream");
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
	switch (request.method) {
		case "GET":
			try {
				const args = request.query.args as string[];
				const filePath = path.join(process.cwd(), "training", ...args);

				// Stream and optimize the image directly
				await streamOptimizedImage(filePath, response);
			} catch (error) {
				response.status(500).send({ message: "An unexpected error occurred." });
			}

			break;

		default:
			response.setHeader("Allow", ["GET"]);
			response.status(405).send({ message: "Method Not Allowed." });
	}
}
