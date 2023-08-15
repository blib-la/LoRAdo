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
	{ real, pixar, watercolor }: { real?: boolean; pixar?: boolean; watercolor?: boolean } = {
		real: true,
	}
): string {
	const commonContent = [subject, className, "solo, best quality, highres, 4k"];

	const prompts: { [key: string]: PromptConfig } = {
		real: {
			header: "Photorealistic",
			content: ["portrait photo of", ...commonContent, "hasselblad, fujifilm"],
			flags: "--h 1216 --w 832 --l 8 --s 35",
			exclude: ["worst quality", "3d", "blurry"],
		},
		pixar: {
			header: "Pixar style",
			content: [
				"pixar style 3d render of",
				...commonContent,
				"cg, octane render, unreal engine",
			],
			flags: "--h 1024 --w 1024 --l 8 --s 35",
			exclude: ["worst quality", "photo", "photorealistic"],
		},
		watercolor: {
			header: "Watercolor",
			content: [
				"watercolor painting of",
				...commonContent,
				"sketch, illustration, ink outlines, unfinished background",
			],
			flags: "--h 1024 --w 1024 --l 8 --s 35",
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
