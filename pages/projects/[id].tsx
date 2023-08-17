import fs from "node:fs/promises";
import path from "node:path";

import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { Box, IconButton, Table, Textarea } from "@mui/joy";
import axios from "axios";
import { globby } from "globby";
import type { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useEffect, useState } from "react";

import { getDirectories } from "../api/projects";

import Layout from "@/components/Layout";
import SlideshowModal from "@/components/SlideshowModal";
import { getImageDimensions } from "@/services/prepare/utils";
import type { ImageUpload } from "@/types";

export function BasicTable({
	rows,
	onCaptionChange,
	onRemove,
	onSave,
	onClick,
}: {
	rows: ImageUpload[];
	onCaptionChange(id: string, value: string): void;
	onSave(image: ImageUpload): void;
	onRemove(image: ImageUpload): void;
	onClick(index: number): void;
}) {
	return (
		<Table aria-label="basic table">
			<tbody>
				{rows.map((image, index) => {
					const name = image.src.split("/").pop();
					return (
						<tr key={image.src}>
							<Box component="td" sx={{ width: 116 }}>
								<Box
									component="button"
									sx={{ p: 0, bgcolor: "transparent", border: 0 }}
									onClick={() => {
										onClick(index);
									}}
								>
									<Image
										src={image.src}
										alt={image.alt}
										height={image.height}
										width={image.width}
										style={{
											height: 100,
											width: 100,
											objectFit: "contain",
											objectPosition: "center",
										}}
									/>
								</Box>
							</Box>
							<Box component="td" sx={{ width: 200 }}>
								{name}
							</Box>
							<td>
								<Textarea
									value={image.alt}
									onChange={event => {
										onCaptionChange(image.src, event.target.value);
									}}
								/>
							</td>
							<Box component="td" sx={{ width: 56 }}>
								{image.modified ? (
									<IconButton
										variant="solid"
										color="warning"
										onClick={() => {
											onSave(image);
										}}
									>
										<SaveIcon />
									</IconButton>
								) : (
									<IconButton
										variant="solid"
										color="danger"
										onClick={() => {
											onRemove(image);
										}}
									>
										<DeleteIcon />
									</IconButton>
								)}
							</Box>
						</tr>
					);
				})}
			</tbody>
		</Table>
	);
}

export default function Project({
	directories,
	uploads: uploads_,
}: {
	directories: { fullPath: string; id: string }[];
	uploads: ImageUpload[];
}) {
	const [uploads, setUploads] = useState<ImageUpload[]>(uploads_);
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
			return prevIndex >= uploads.length - 1 ? 0 : prevIndex + 1;
		});
	};

	const prevImage = () => {
		setCurrentImageIndex(prevIndex => {
			if (prevIndex === null) {
				return uploads.length - 1; // Initialize to the last image if currently null
			}

			// If we're at the first index, go to the last one.
			return prevIndex === 0 ? uploads.length - 1 : prevIndex - 1;
		});
	};

	useEffect(() => {
		setUploads(previousUploads => (previousUploads === uploads_ ? previousUploads : uploads_));
	}, [uploads_]);

	return (
		<Layout directories={directories}>
			<SlideshowModal
				images={uploads.map(image => ({
					id: image.src,
					name: image.src.split("/").pop()!,
					data: image.src,
					src: image.src,
					caption: image.alt,
					height: image.height,
					width: image.width,
					size: 0,
				}))}
				currentIndex={currentImageIndex === null ? 0 : currentImageIndex}
				isOpen={isModalOpen}
				onClose={closeModal}
				onNext={nextImage}
				onPrev={prevImage}
				onCaptionChange={(index, value) => {
					setUploads(previousState =>
						previousState.map((image, imageIndex) =>
							imageIndex === index
								? {
										...image,
										alt: value,
										modified: true,
								  }
								: image
						)
					);
				}}
				onDelete={async index => {
					const image = uploads[index];
					try {
						await axios.post(`/api/image/delete`, image);
						setUploads(previousState =>
							previousState.filter((_, imageIndex) => imageIndex !== index)
						);
					} catch (error) {
						console.log(error);
					}
				}}
			/>

			<BasicTable
				rows={uploads}
				onClick={openModal}
				onCaptionChange={(id, value) => {
					setUploads(previousState =>
						previousState.map(image =>
							image.src === id
								? {
										...image,
										alt: value,
										modified: true,
								  }
								: image
						)
					);
				}}
				onRemove={async image => {
					try {
						await axios.post(`/api/image/delete`, image);
						setUploads(previousState =>
							previousState.filter(({ src }) => src !== image.src)
						);
					} catch (error) {
						console.log(error);
					}
				}}
				onSave={async image => {
					try {
						await axios.post(`/api/image/edit`, image);
						setUploads(previousState =>
							previousState.map(image_ =>
								image_.src === image.src ? { ...image_, modified: false } : image_
							)
						);
					} catch (error) {
						console.log(error);
					}
				}}
			/>
		</Layout>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const { id } = context.query;
	const directories = await getDirectories(path.join(process.cwd(), "training"));
	const project = directories.find(directory => directory.id === id);
	const directory = project ? path.join(project.fullPath, "img") : null;
	const uploadFiles = directory
		? await globby(["*.png", "*/*.png"], { cwd: directory, gitignore: false })
		: [];
	const uploads = await Promise.all(
		uploadFiles.map(async filePath => {
			const outputPath = directory ? path.join(directory, filePath) : "";
			const { height, width } = await getImageDimensions(outputPath);
			let alt = "";
			let hasCaption = false;
			const captionPath = outputPath.replace(/\.png$/, ".txt");
			try {
				alt = await fs.readFile(captionPath, "utf-8");
				hasCaption = true;
			} catch (error) {
				console.log("no caption file found for", outputPath);
			}

			const src = `/api/uploads/${outputPath.split("training")[1]}`
				.replaceAll("\\", "/")
				.replace(/\/+/g, "/");
			return {
				height,
				width,
				src,
				alt,
				outputPath,
				captionPath: hasCaption ? captionPath : outputPath.replace(/\.png$/, ".txt"),
			};
		})
	);
	return {
		props: {
			directories,
			uploads,
		},
	};
}
