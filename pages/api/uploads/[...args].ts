import { readFile } from "fs/promises";
import path from "node:path";
import process from "node:process";

import * as fileType from "file-type";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
	switch (request.method) {
		case "GET":
			try {
				const args = request.query.args as string[];
				const filePath = path.join(process.cwd(), "training", ...args);
				const fileBuffer = await readFile(filePath);

				if (!fileBuffer) {
					response.status(404).send({ message: "File not found." });
					return;
				}

				const type = await fileType.fileTypeFromBuffer(fileBuffer);

				if (!type) {
					response.status(403).send({ message: "File type could not be determined." });
					return;
				}

				switch (type.mime) {
					case "image/jpeg":
					case "image/png":
						response.setHeader("Content-Type", type.mime);
						response.status(200).send(fileBuffer);
						break;
					default:
						response.status(403).send({ message: "File type not allowed." });
				}
			} catch (error) {
				if (error instanceof Error) {
					if ("code" in error && error.code === "ENOENT") {
						response.status(404).send({ message: "File not found." });
					} else {
						response.status(500).send({ message: error.message });
					}
				} else {
					response.status(500).send({ message: "An unexpected error occurred." });
				}
			}

			break;
		default:
			response.setHeader("Allow", ["GET"]);
			response.status(405).send({ message: "Method Not Allowed." });
	}
}
