export interface ImageData {
  id: string;
  caption: string;
  data: string;
  name: string;
  size: number;
  width: number;
  height: number;
  hasFace?: boolean;
}

export interface FormDataModel {
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
