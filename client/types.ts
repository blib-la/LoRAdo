export interface ImageData {
	id: string;
	caption: string;
	data?: string;
	src: string;
	name: string;
	width: number;
	height: number;
	uploaded?: boolean;
	faceBox?: FaceBox;
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

export interface FaceBox {
	xPercentage: number;
	yPercentage: number;
	widthPercentage: number;
	heightPercentage: number;
}
