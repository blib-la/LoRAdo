import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import fs from "node:fs/promises";
import path from "path";
import { kohyaConfig } from "@/data/kohyaConfig";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<unknown>,
) {
  switch (request.method) {
    case "POST":
      const form = new IncomingForm();

      form.parse(request, async (err, fields, files) => {
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

        // Prepare directory for files
        const baseDir = path.join(
          process.cwd(),
          "training",
          Date.now().toString(),
        );
        const datasetDir = path.join(baseDir, "dataset");

        try {
          // Ensure directories exist
          await fs.mkdir(datasetDir, { recursive: true });

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
            sample_prompts: `# 1
photo of ${subject} ${className}, solo, best quality, 4k, 8k, aperture f/2.8 --w 832 --h 1216 --l 8 --s 35 --n worst quality

# 2
pixar style 3d render of ${subject} ${className} as pixar character, solo, looking at the viewer, sitting on a bench, in a park, best quality, CG, CGSociety, octane render, 3d --w 768 --h 1344 --l 8 --s 35 --n worst quality, photo, realistic, photorealistic

# 3
disney style cartoon illustration of ${subject} ${className}, solo, wearing hero costume, in a dark alley, at night, best quality, cartoon drawing, toon --w 1344 --h 768 --l 8 --s 35 --n worst quality,  photo, realistic, photorealistic

# 4
sketch watercolor painting of ${subject} ${className}, solo, looking to the side, in kitchen while cooking, best quality, drawing, lineart, outlines, unfinished background, white background --w 1024 --h 1024 --l 8 --s 35 --n worst quality, photo, realistic, photorealistic
 `,
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

          let counter = 0;
          const filePromises = [];

          for (const [, fileArray] of Object.entries(files)) {
            // If fileArray is actually an array and has at least one item
            if (Array.isArray(fileArray) && fileArray.length > 0) {
              for (const file of fileArray) {
                if (file.filepath) {
                  const oldPath = file.filepath;
                  const newPath = path.join(
                    datasetDir,
                    `${parsedFields.subject} (${++counter}).jpg`,
                  );
                  const captionPath = path.join(
                    datasetDir,
                    `${parsedFields.subject} (${counter}).txt`,
                  );
                  const caption = fields[`caption_${counter - 1}`];
                  if (caption) {
                    filePromises.push(
                      fs.writeFile(captionPath, caption.toString()),
                    );
                  }
                  filePromises.push(fs.rename(oldPath, newPath));
                } else {
                  console.error(
                    "Unexpected file object without filepath:",
                    file,
                  );
                }
              }
            } else {
              console.error("Unexpected file structure detected:", fileArray);
            }
          }

          await Promise.all(filePromises);

          console.log("Files written to:", datasetDir);

          response.status(201).json({ message: "Success" });
        } catch (fileError) {
          console.error("Error handling files:", fileError);
          response.status(500).json({ message: "Server error." });
        }
      });
      break;
    default:
      response.status(405).json({ message: "Method not allowed" });
      break;
  }
}
