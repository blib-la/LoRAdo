import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import fs from "node:fs/promises";
import path from "path";
import { ensureDirExists } from "@/services/prepare/utils";
import { prepareImage } from "@/services/prepare/prepare";
import { sizes } from "@/services/prepare/sizes";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function uploadImageHandler(
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

        const [baseDir] = fields.baseDir;
        const [filename] = fields.filename;
        const [className] = fields.className;
        const [subject] = fields.subject;
        const [caption] = fields.caption;
        const crop = fields.crop[0] === "true";
        const counter = Number.parseInt(fields.counter[0], 10);
        const repeats = Number.parseInt(fields.repeats[0], 10);
        const datasetDir = path.join(baseDir, "dataset");
        // Ensure directories exist
        await ensureDirExists(datasetDir);

        const filePromises = [];

        for (const [, fileArray] of Object.entries(files)) {
          if (Array.isArray(fileArray) && fileArray.length > 0) {
            for (const file of fileArray) {
              if (file.filepath) {
                const oldPath = file.filepath;
                const newPath = path.join(datasetDir, `${filename}.jpg`);
                const captionPath = path.join(datasetDir, `${filename}.txt`);
                const prepare = async () => {
                  await fs.writeFile(captionPath, caption);
                  await fs.rename(oldPath, newPath);
                  return prepareImage({
                    image: newPath,
                    counter,
                    sizes,
                    crop,
                    zoomLevels: [0],
                    repeats,
                    className,
                    subject,
                    outDir: baseDir,
                  });
                };
                filePromises.push(prepare());
              } else {
                console.error("Unexpected file object without filepath:", file);
              }
            }
          } else {
            console.error("Unexpected file structure detected:", fileArray);
          }
        }

        await Promise.all(filePromises);

        console.log("Done:", datasetDir);

        response.status(201).json({ message: "Success" });
      });
      break;
    default:
      response.status(405).json({ message: "Method not allowed" });
      break;
  }
}
