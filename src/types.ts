export interface ImageData {
	id: string;
	caption: string;
	data: string;
	name: string;
	size: number;
	width: number;
	height: number;
	hasFace?: boolean;
	uploaded?: boolean;
}

export interface FormDataModel {
	projectName: string;
	sdxl: boolean;
	checkpoint: string;
	subject: string;
	className: string;
	epochs: number;
	crop: boolean;
	sample: boolean;
	lowVRAM: boolean;
	regularisation: boolean;
	files: File[];
	filename: string;
}

export interface ImageUpload {
	modified?: boolean;
	height: number;
	width: number;
	alt: string;
	src: string;
	captionPath: string;
	outputPath: string;
}
