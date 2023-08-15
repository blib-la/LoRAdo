import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import fs from "node:fs/promises";
import path from "path";
import { kohyaConfig } from "@/data/kohyaConfig";
import { ensureDirExists } from "@/services/prepare/utils";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function prepareDataHandler(
  request: NextApiRequest,
  response: NextApiResponse<unknown>,
) {
  switch (request.method) {
    case "POST":
      const form = new IncomingForm();

      form.parse(request, async (err, fields, _) => {
        if (err) {
          response.status(400).json({ message: "Error processing form data." });
          return;
        }

        const parsedFields: Record<string, any> = {};
        for (const key in fields) {
          const value = fields[key];
          parsedFields[key] = Array.isArray(value) ? value[0] : value;

          // Parse boolean and number values
          if (parsedFields[key] === "true" || parsedFields[key] === "false") {
            parsedFields[key] = parsedFields[key] === "true";
          } else if (!isNaN(Number(parsedFields[key]))) {
            parsedFields[key] = Number(parsedFields[key]);
          }
        }

        const baseDir = path.join(
          process.cwd(),
          "training",
          Date.now().toString(),
        );
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
        } = parsedFields;

        const configContent = {
          ...kohyaConfig,
          epoch: epochs,
          output_name: filename,
          network_dim: lowVRAM ? 32 : 256,
          sample_prompts: "",
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

        await fs.writeFile(
          path.join(baseDir, "config.json"),
          JSON.stringify(configContent, null, 2),
        );

        response.status(201).json({ message: "Success", baseDir });
      });
      break;
    default:
      response.status(405).json({ message: "Method not allowed" });
      break;
  }
}
