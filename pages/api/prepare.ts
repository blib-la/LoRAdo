import fs from "node:fs/promises";
import path from "path";

import type { NextApiRequest, NextApiResponse } from "next";

import { kohyaConfig } from "@/data/kohyaConfig";
import { ensureDirExists } from "@/services/prepare/utils";
import { createSamplePrompt } from "@/utils/samples";

export default async function prepareDataHandler(
	request: NextApiRequest,
	response: NextApiResponse<unknown>
) {
	switch (request.method) {
		case "POST":
			try {
				const baseDir = path.join(process.cwd(), "training", request.body.projectName);
				await ensureDirExists(baseDir);

				const {
					subject,
					className,
					epochs,
					lowVRAM,
					sample,
					filename,
					checkpoint,
					regularisation,
				} = request.body;

				/* eslint-disable camelcase */
				const configContent = {
					...kohyaConfig,
					epoch: epochs,
					output_name: filename,
					network_dim: lowVRAM ? 32 : 256,
					sample_prompts: sample ? createSamplePrompt(subject, className) : "",
					logging_dir: path.join(baseDir, "log"),
					reg_data_dir: regularisation ? path.join(baseDir, "reg") : "",
					output_dir: path.join(baseDir, "model"),
					train_data_dir: path.join(baseDir, "img"),
					sample_every_n_steps: sample ? 40 : 0,
					pretrained_model_name_or_path: checkpoint,
					mixed_precision: lowVRAM ? "fp16" : "bf16",
					save_precision: lowVRAM ? "fp16" : "bf16",
					optimizer: lowVRAM ? "AdamW" : "Adafactor",
					optimizer_args: lowVRAM
						? ""
						: "scale_parameter=False relative_step=False warmup_init=False",
				};
				/* eslint-enable camelcase */

				await fs.writeFile(
					path.join(baseDir, "config.json"),
					JSON.stringify(configContent, null, 2)
				);

				response.status(201).json({ message: "Success", baseDir });
			} catch (error) {
				console.log(error);
				// TODO handle error correctly
				response.status(500).json({ message: "Server error" });
			}

			break;
		default:
			response.status(405).json({ message: "Method not allowed" });
			break;
	}
}
