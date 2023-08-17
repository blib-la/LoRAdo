export interface PromptConfig {
	header: string;
	content: string[];
	flags: string;
	exclude: string[];
}

export function generatePrompt({ header, content, flags, exclude }: PromptConfig): string {
	return `# ${header}
${content.join(" ")} ${flags} --n ${exclude.join(", ")}
`;
}

export function createSamplePrompt(
	subject: string,
	className: string,
	{
		real,
		pixar,
		watercolor,
		sdxl,
	}: { real?: boolean; pixar?: boolean; watercolor?: boolean; sdxl?: boolean } = {
		real: true,
	}
): string {
	const commonContent = [subject, className, "solo, best quality, highres, 4k"];

	const prompts: { [key: string]: PromptConfig } = {
		real: {
			header: "Photorealistic",
			content: ["portrait photo of", ...commonContent, "hasselblad, fujifilm"],
			flags: `--h ${sdxl ? 1216 : 768} --w ${sdxl ? 832 : 512} --l 8 --s 35`,
			exclude: ["worst quality", "3d", "blurry"],
		},
		pixar: {
			header: "Pixar style",
			content: [
				"pixar style 3d render of",
				...commonContent,
				"cg, octane render, unreal engine",
			],
			flags: `--h ${sdxl ? 1024 : 512} --w ${sdxl ? 1024 : 512} --l 8 --s 35`,
			exclude: ["worst quality", "photo", "photorealistic"],
		},
		watercolor: {
			header: "Watercolor",
			content: [
				"watercolor painting of",
				...commonContent,
				"sketch, illustration, ink outlines, unfinished background",
			],
			flags: `--h ${sdxl ? 1024 : 512} --w ${sdxl ? 1024 : 512} --l 8 --s 35`,
			exclude: ["worst quality", "photo", "photorealistic"],
		},
	};

	let result = "";
	if (real) {
		result += generatePrompt(prompts.real);
	}

	if (pixar) {
		result += generatePrompt(prompts.pixar);
	}

	if (watercolor) {
		result += generatePrompt(prompts.watercolor);
	}

	return result.trim() + "\n";
}
