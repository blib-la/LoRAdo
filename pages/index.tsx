import path from "node:path";

import {
	Alert,
	Box,
	Button,
	Chip,
	FormControl,
	FormHelperText,
	FormLabel,
	Grid,
	Input,
	Stack,
	Switch,
	Typography,
} from "@mui/joy";
import type { AxiosError } from "axios";
import axios from "axios";
import { useRouter } from "next/router";
import type { DragEvent } from "react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { getDirectories } from "./api/projects";

import FileUpload from "@/components/FileUpload";
import ImageItem from "@/components/ImageItem";
import Layout from "@/components/Layout";
import Masonry from "@/components/Masonry";
import SlideshowModal from "@/components/SlideshowModal";
import SyncedSliderInput from "@/components/SynchedSliderInput";
import { exampleImages } from "@/data/exampleImages";
import type { FaceBox, FormDataModel, ImageData, ImageUpload } from "@/types";
import { traverseFileTree } from "@/utils/traverseFileTree";

export default function Home({ directories }: { directories: { fullPath: string; id: string }[] }) {
	const {
		formState: { errors },
		register,
		handleSubmit,
		control,
		setValue,
	} = useForm<FormDataModel>({
		defaultValues: {
			projectName: "",
			sdxl: true,
			filename: "",
			checkpoint: "",
			subject: "",
			className: "",
			epochs: 5,
			crop: false,
			sample: false,
			lowVRAM: false,
			regularisation: false,
			files: [],
		},
	});
	const { push } = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [images, setImages] = useState<ImageData[]>([]);
	const [isModalOpen, setModalOpen] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

	const openModal = (index: number) => {
		setCurrentImageIndex(index);
		setModalOpen(true);
	};

	const closeModal = () => {
		setCurrentImageIndex(null);
		setModalOpen(false);
	};

	const nextImage = () => {
		setCurrentImageIndex(prevIndex => {
			if (prevIndex === null) {
				return 0; // Initialize to the first image if currently null
			}

			// If we're at the last index, go back to the first one (0).
			return prevIndex >= images.length - 1 ? 0 : prevIndex + 1;
		});
	};

	const prevImage = () => {
		setCurrentImageIndex(prevIndex => {
			if (prevIndex === null) {
				return images.length - 1; // Initialize to the last image if currently null
			}

			// If we're at the first index, go to the last one.
			return prevIndex === 0 ? images.length - 1 : prevIndex - 1;
		});
	};

	const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
		event.preventDefault();

		const { items } = event.dataTransfer;

		for (let i = 0; i < items.length; i++) {
			const item = items[i].webkitGetAsEntry();

			if (item) {
				// eslint-disable-next-line no-await-in-loop
				await traverseFileTree(item, imageData => {
					setImages(prev => [...prev, imageData]);
				});
			}
		}
	};

	const handleRemove = (imageIndex: number) => {
		setImages(prevImages => prevImages.filter((_, index) => index !== imageIndex));
		if (imageIndex === currentImageIndex) {
			prevImage();
		}
	};

	const handleCaptionChange = (imageIndex: number, value: string) => {
		setImages(prevImages =>
			prevImages.map((image, index) =>
				index === imageIndex ? { ...image, caption: value } : image
			)
		);
	};

	const handleFace = (faceBox: FaceBox, imageIndex: number) => {
		setImages(prevImages =>
			prevImages.map((image, index) => (index === imageIndex ? { ...image, faceBox } : image))
		);
	};

	const onSubmit = async (data: Omit<FormDataModel, "files">) => {
		setLoading(true);
		setError(null);

		try {
			const response = await axios.post<{ baseDir: string }>("/api/prepare", data);

			const repeats = Math.min(
				Math.max(Math.ceil(150 / (images.length * (data.crop ? 9 : 1))), 5),
				50
			);

			const imagePromises = images.map(async (image, index) => {
				const counter = index + 1;
				const imageData = new FormData();
				const byteCharacters = atob(image.data!.split(",")[1]);
				const byteArrays = [];

				for (let offset = 0; offset < byteCharacters.length; offset += 512) {
					const slice = byteCharacters.slice(offset, offset + 512);

					const byteNumbers = new Array(slice.length);
					for (let i = 0; i < slice.length; i++) {
						byteNumbers[i] = slice.charCodeAt(i);
					}

					const byteArray = new Uint8Array(byteNumbers);
					byteArrays.push(byteArray);
				}

				const blob = new Blob(byteArrays, { type: "image/jpeg" });
				imageData.append("projectName", data.projectName);
				imageData.append("sdxl", data.sdxl.toString());
				imageData.append("file", blob, image.name);
				imageData.append("caption", image.caption ?? `${data.subject} ${data.className}`);
				imageData.append(
					"filename",
					`${data.subject}--${counter.toString().padStart(4, "0")}`
				);
				imageData.append("baseDir", response.data.baseDir);
				imageData.append("subject", data.subject);
				imageData.append("className", data.className);
				imageData.append("crop", data.crop.toString());
				imageData.append("counter", counter.toString());
				imageData.append("repeats", repeats.toString());

				// Now sending each image separately to a different endpoint
				const imageResponse = await axios.post<{ croppedFiles: ImageUpload[] }>(
					"/api/image/upload",
					imageData
				);
				setImages(prevState =>
					prevState.map(prevImage =>
						prevImage.id === image.id ? { ...prevImage, uploaded: true } : prevImage
					)
				);
				return imageResponse;
			});

			// Waiting for all image uploads to finish
			try {
				await Promise.all(imagePromises);

				push(`/projects/${data.projectName}`);
			} catch (error) {
				console.error(error);
			}
		} catch (error) {
			console.error("Error sending data: ", error);
			setError(error as Error | AxiosError);
		} finally {
			setLoading(false);
		}
	};

	const preferredLength = 8;
	const secondaryLength = 5;

	return (
		<Layout directories={directories}>
			<SlideshowModal
				images={images}
				currentIndex={currentImageIndex === null ? 0 : currentImageIndex}
				isOpen={isModalOpen}
				onClose={closeModal}
				onNext={nextImage}
				onPrev={prevImage}
				onDelete={handleRemove}
				onCaptionChange={handleCaptionChange}
			/>
			<Box component="form" sx={{ my: 2 }} onSubmit={handleSubmit(onSubmit)}>
				<Grid container spacing={2} columns={{ xs: 1, md: 2 }}>
					<Grid xs={1}>
						<Stack gap={2}>
							<Grid container>
								<Grid xs>
									<FormControl color={errors.checkpoint ? "danger" : "neutral"}>
										<FormLabel>Checkpoint (SDXL)</FormLabel>
										<Input
											error={Boolean(errors.checkpoint)}
											placeholder="C:\path\to\your\sd_xl_base_1.0.safetensors"
											{...register("checkpoint", { required: true })}
										/>
										<FormHelperText>
											Please enter the path to your checkpoint.
										</FormHelperText>
									</FormControl>
								</Grid>
								<Grid sx={{ display: "flex", alignItems: "center" }}>
									<Typography
										component="label"
										startDecorator={
											<Controller
												name="sdxl"
												control={control}
												render={({ field }) => (
													<Switch
														disabled
														sx={{ ml: 1 }}
														{...field}
														checked={field.value}
													/>
												)}
											/>
										}
									>
										SDXL
									</Typography>
								</Grid>
							</Grid>
							<Grid container spacing={2} columns={2}>
								<Grid xs={1}>
									<FormControl color={errors.projectName ? "danger" : "neutral"}>
										<FormLabel>Project Name</FormLabel>
										<Controller
											control={control}
											name="projectName"
											rules={{ required: true }}
											render={({ field }) => (
												<Input
													error={Boolean(errors.projectName)}
													placeholder="my_lora"
													{...field}
													onChange={event =>
														field.onChange({
															target: {
																value: event.target.value
																	.toLowerCase()
																	.replace(/\s+/g, "_")
																	.replace(/_+/g, "_"),
															},
														})
													}
												/>
											)}
										/>

										<FormHelperText>
											Please enter the name of the project.
										</FormHelperText>
									</FormControl>
								</Grid>
								<Grid xs={1}>
									<FormControl color={errors.filename ? "danger" : "neutral"}>
										<FormLabel>LoRA Name</FormLabel>
										<Controller
											control={control}
											name="filename"
											rules={{ required: true }}
											render={({ field }) => (
												<Input
													error={Boolean(errors.projectName)}
													placeholder="ohwxwoman_v1"
													{...field}
													onChange={event =>
														field.onChange({
															target: {
																value: event.target.value
																	.toLowerCase()
																	.replace(/\s+/g, "_")
																	.replace(/_+/g, "_"),
															},
														})
													}
												/>
											)}
										/>
										<FormHelperText>
											Please enter the filename of the LoRA.
										</FormHelperText>
									</FormControl>
								</Grid>
							</Grid>
							<Grid container spacing={2} columns={2}>
								<Grid xs={1}>
									<FormControl color={errors.subject ? "danger" : "neutral"}>
										<FormLabel>Subject Name</FormLabel>
										<Input
											error={Boolean(errors.subject)}
											placeholder="ohwx"
											{...register("subject", { required: true })}
										/>
										<FormHelperText>
											Please enter the name of the subject you want to train.
										</FormHelperText>
									</FormControl>
								</Grid>
								<Grid xs={1}>
									<FormControl color={errors.className ? "danger" : "neutral"}>
										<FormLabel>Class Name</FormLabel>
										<Input
											error={Boolean(errors.className)}
											placeholder="woman"
											{...register("className", { required: true })}
										/>
										<FormHelperText>
											Please enter the name of the class you want to train.
										</FormHelperText>
									</FormControl>
								</Grid>
							</Grid>
							<Controller
								name="epochs"
								control={control}
								defaultValue={5}
								render={({ field }) => (
									<SyncedSliderInput
										{...field}
										min={1}
										max={30}
										label="Epochs"
										helperText="How long do you want to train?"
										onChange={value => {
											setValue("epochs", value);
											field.onChange(value);
										}}
									/>
								)}
							/>
							<Grid container spacing={2} columns={2}>
								<Grid xs={1}>
									<Typography
										component="label"
										startDecorator={
											<Controller
												name="crop"
												control={control}
												render={({ field }) => (
													<Switch
														sx={{ ml: 1 }}
														{...field}
														checked={field.value}
													/>
												)}
											/>
										}
									>
										Create crops
									</Typography>
									<FormHelperText sx={{ mt: 1 }}>
										Do you want to create SDXL resolution crop versions of you
										images?
									</FormHelperText>
								</Grid>
								<Grid xs={1}>
									<Typography
										component="label"
										startDecorator={
											<Controller
												name="sample"
												control={control}
												render={({ field }) => (
													<Switch
														sx={{ ml: 1 }}
														{...field}
														checked={field.value}
													/>
												)}
											/>
										}
									>
										Create samples
									</Typography>
									<FormHelperText sx={{ mt: 1 }}>
										Do you want to create sample images during training?
										(slower)
									</FormHelperText>
								</Grid>
							</Grid>
							<Grid container spacing={2} columns={2}>
								<Grid xs={1}>
									<Typography
										component="label"
										startDecorator={
											<Controller
												name="lowVRAM"
												control={control}
												render={({ field }) => (
													<Switch
														sx={{ ml: 1 }}
														{...field}
														checked={field.value}
													/>
												)}
											/>
										}
									>
										Low VRAM
									</Typography>
									<FormHelperText sx={{ mt: 1 }}>
										Optimize for low VRAM (below 16GB)? (less accurate)
									</FormHelperText>
								</Grid>
								<Grid xs={1}>
									<Typography
										component="label"
										startDecorator={
											<Controller
												name="regularisation"
												control={control}
												render={({ field }) => (
													<Switch
														disabled
														sx={{ ml: 1 }}
														{...field}
														checked={field.value}
													/>
												)}
											/>
										}
									>
										Regularisation
									</Typography>
									<FormHelperText sx={{ mt: 1 }}>
										<Box>
											<Chip
												size="sm"
												color="primary"
												variant="solid"
												sx={{ mr: 1 }}
											>
												WIP
											</Chip>
											Do you want to use regularisation images during
											training? (more flexible but twice as slow)
										</Box>
									</FormHelperText>
								</Grid>
							</Grid>
							<Box sx={{ mt: 4 }}>
								<Button
									fullWidth
									loading={loading}
									type="submit"
									disabled={images.length === 0 || loading}
								>
									Prepare
								</Button>
							</Box>

							{error && (
								<Alert variant="soft" color="danger">
									{error.message}
								</Alert>
							)}
							<Alert
								variant="outlined"
								color={
									/* eslint-disable no-nested-ternary */
									images.length >= preferredLength
										? "success"
										: images.length >= secondaryLength
										? "warning"
										: "danger"
									/* eslint-enable no-nested-ternary */
								}
								size="sm"
							>
								Using {images.length} image{images.length === 1 ? "" : "s"}.
								{images.length < secondaryLength && images.length > 0 && (
									<Typography level="body-xs">
										Less images will create less flexible LoRAs.
									</Typography>
								)}
								{images.length < preferredLength && images.length >= 5 && (
									<Typography level="body-xs">
										We recommend at least {preferredLength} mages.
									</Typography>
								)}
								{images.length === 0 && (
									<Typography level="body-xs">Please add images.</Typography>
								)}
							</Alert>
						</Stack>
					</Grid>
					<Grid xs={1} sx={{ display: "flex" }}>
						<FileUpload
							min={1}
							ok={secondaryLength}
							recommended={preferredLength}
							onDrop={handleDrop}
							onLoad={imageData => {
								setImages(previousState => [...previousState, imageData]);
							}}
						/>
					</Grid>
				</Grid>
			</Box>
			<Box>
				<Button
					variant="soft"
					disabled={images.length === 0}
					onClick={() => {
						setImages([]);
					}}
				>
					Remove all images
				</Button>
			</Box>
			<Masonry>
				{images.map((image, index) => (
					<ImageItem
						key={image.id}
						image={image}
						onFace={faceBox => {
							handleFace(faceBox, index);
						}}
						onRemove={() => {
							handleRemove(index);
						}}
						onOpen={() => {
							openModal(index);
						}}
						onCaptionChange={event => {
							handleCaptionChange(index, event.target.value);
						}}
					/>
				))}

				{images.length === 0 &&
					exampleImages.map(image => <ImageItem key={image.id} demo image={image} />)}
			</Masonry>
		</Layout>
	);
}

export async function getServerSideProps() {
	const directories = await getDirectories(path.join(process.cwd(), "training"));
	return {
		props: {
			directories,
		},
	};
}
