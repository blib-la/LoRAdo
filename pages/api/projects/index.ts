import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import type { NextApiRequest, NextApiResponse } from "next";
export async function getDirectories(
	parentDirectory: string
): Promise<{ fullPath: string; id: string }[]> {
	try {
		const filesAndDirs = await readdir(parentDirectory);
		const dirs: { fullPath: string; id: string }[] = [];

		for (const item of filesAndDirs) {
			const fullPath = path.join(parentDirectory, item);
			// eslint-disable-next-line no-await-in-loop
			if ((await stat(fullPath)).isDirectory()) {
				dirs.push({ fullPath, id: path.basename(fullPath) });
			}
		}

		return dirs;
	} catch (err) {
		console.error("Error reading directory:", err);
		return [];
	}
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
	switch (request.method) {
		case "GET":
			try {
				const directories = await getDirectories(path.join(process.cwd(), "training"));
				response.status(200).send({ directories });
			} catch (error) {
				if (error instanceof Error) {
					response.status(500).send({ message: error.message });
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
