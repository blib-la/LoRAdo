import fs from "node:fs/promises";
import path from "node:path";

import axios from "axios";
import { globby } from "globby";
import type { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";

import { getDirectories } from "../api/projects";

import Layout from "@/components/Layout";
import { ProjectsTable } from "@/components/ProjectsTable";
import SlideshowModal from "@/components/SlideshowModal";
import { getImageDimensions } from "@/services/prepare/utils";
import type { ImageUpload } from "@/types";

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

			<ProjectsTable
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
