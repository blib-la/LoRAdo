import { Typography, Sheet, Box } from "@mui/joy";
import { DragEvent } from "react";

interface FileUploadProps {
	min: number;
	ok: number;
	recommended: number;
	onDrop(event: DragEvent<HTMLLabelElement>): void;
	onLoad(imageData: ImageData): void;
}
interface ImageData {
	data: string;
	name: string;
	size: number;
	width: number;
	height: number;
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
			<Box sx={{ textAlign: "center" }}>
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
									const img = new Image();
									img.src = event.target!.result as string;
									img.onload = () => {
										onLoad({
											data: event.target!.result as string,
											name: file.name,
											size: file.size,
											width: img.width,
											height: img.height,
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
