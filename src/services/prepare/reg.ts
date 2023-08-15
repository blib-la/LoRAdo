import path from "node:path";
import fs from "node:fs/promises";
import { createApi } from "unsplash-js";
import axios from "axios";
import { ensureDirExists, getClosestSize } from "./utils";
import { cropImageToFace, loadModels } from "./crop";
import { sizes } from "./sizes";
import { ApiResponse } from "unsplash-js/dist/helpers/response";
import { Random } from "unsplash-js/dist/methods/photos/types";

interface User {
  name: string;
  username: string;
  profile_image: string;
  profile_url: string;
}

interface ImageInfo {
  id: string; // Adjust type as needed
  description: string | null; // Assuming it can be null based on the properties like alt_description
  alt_description: string | null;
  user: User;
  links: {
    html: string; // Adjust type as needed
  };
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
          getClosestSize(
            { height: imageInfo.height, width: imageInfo.width },
            sizes,
          ) ?? [1024, 1024],
        ];

    for (const [width, height] of requestedSizes) {
      const imageName = `${className} (${imageCounter + 1})`;
      const imagePath = path.join(outDir, `${imageName}.jpg`);
      const captionPath = path.join(outDir, `${imageName}.txt`);
      const croppedResult = await cropImageToFace(
        imageResponse.data,
        { width, height },
        zoomLevel,
      );
      // Store the relevant attribution information
      imageAttributions.push({
        imageName,
        id: imageInfo.id,
        description: imageInfo.description,
        alt_description: imageInfo.alt_description,
        user: {
          name: imageInfo.user.name,
          username: imageInfo.user.username,
          profile_image: imageInfo.user.profile_image.small,
          profile_url: `https://unsplash.com/@${imageInfo.user.username}`,
        },
        link: imageInfo.links.html,
      });
      // write before each try
      await fs.writeFile(
        path.join(outDir, "attributions.json"),
        JSON.stringify(imageAttributions, null, 2),
      );
      await fs.writeFile(imagePath, croppedResult);
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

    try {
      const result = (await unsplash.photos.getRandom({
        query: className,
        count,
      })) as ApiResponse<Random[]>;

      if (result?.response?.length) {
        for (const imageInfo of result.response) {
          try {
            if (totalImagesFetched < totalImagesToFetch) {
              await fetchCropAndSave(imageInfo, 0);
            } else {
              break;
            }
          } catch (error) {
            console.error(
              `Error processing image from ${imageInfo.urls.full}:`,
              (error as Error).message,
            );
          }
        }
      } else {
        console.log("No photos found or an error occurred.");
      }
    } catch (error) {
      throw error;
    }
  }

  if (totalImagesFetched < totalImagesToFetch) {
    console.warn(
      `Only fetched ${totalImagesFetched} images out of the desired ${totalImagesToFetch}.`,
    );
  } else {
    console.log(`Total images fetched: ${totalImagesFetched}`);
  }
}

/*
await getRegularisationImages({
  outDir: `./out/${Date.now()}`,
  className: "woman",
  totalImagesToFetch: 10,
  crop: true,
});
*/
