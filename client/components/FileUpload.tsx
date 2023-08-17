import PermMediaIcon from "@mui/icons-material/PermMedia";
import { Typography, Sheet, Box } from "@mui/joy";
import { nanoid } from "nanoid";
import type { DragEvent } from "react";

import type { ImageData } from "@/types";
import { resizeImage } from "@/utils/traverseFileTree";
interface FileUploadProps {
	min: number;
	ok: number;
	recommended: number;
	onDrop(event: DragEvent<HTMLLabelElement>): void;
	onLoad(imageData: ImageData): void;
}
export default function FileUpload({ onDrop, onLoad, min, ok, recommended }: FileUploadProps) {
	return (
		<Sheet
			component="label"
			variant="outlined"
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				p: 2,
				minHeight: 104,
				flex: 1,
				borderRadius: 4,
				position: "relative",
				cursor: "pointer",
				overflow: "hidden",
			}}
			onDrop={onDrop}
			onDragOver={e => e.preventDefault()}
		>
			<Box
				sx={{
					pointerEvents: "none",
					position: "absolute",
					inset: 0,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					opacity: 0.1,
				}}
			>
				<PermMediaIcon sx={{ height: "50%", width: "50%" }} />
			</Box>
			<Box sx={{ textAlign: "center", position: "relative" }}>
				<Typography level="body-md" display="block">
					Drop files or folders here or click to select files from disk.
				</Typography>
				<Typography color="danger" level="body-sm" display="block" mt={1}>
					Minimum: {min} image{min === 1 ? "" : "s"}
				</Typography>
				<Typography color="warning" level="body-sm" display="block" mt={1}>
					Better: {ok} images or more
				</Typography>
				<Typography color="success" level="body-sm" display="block" mt={1}>
					Recommended: {recommended} images or more
				</Typography>
			</Box>

			<Box
				type="file"
				component="input"
				multiple
				sx={{
					position: "absolute",
					bottom: "100%",
					right: "100%",
					opacity: 0,
				}}
				onChange={event => {
					if (event.target.files) {
						Array.from(event.target.files).forEach(file => {
							if (file.type.startsWith("image/")) {
								const reader = new FileReader();
								reader.onload = event => {
									const image = new Image();
									image.src = event.target!.result as string;
									image.onload = async () => {
										const maxWidth = 300;
										const resizedDataUrl = await resizeImage(
											image,
											maxWidth,
											maxWidth * (1535 / 640) // SDXL max
										);
										onLoad({
											id: nanoid(),
											data: image.src,
											src: resizedDataUrl,
											name: file.name,
											width: image.width,
											height: image.height,
											caption: "",
										});
									};
								};

								reader.readAsDataURL(file);
							}
						});
					}
				}}
			/>
		</Sheet>
	);
}
