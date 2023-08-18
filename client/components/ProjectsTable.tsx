import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { Box, IconButton, Table, Textarea } from "@mui/joy";
import type { ChangeEvent } from "react";

import { ImageWithErrorHandling } from "@/components/ImageWithErrorHandling";
import type { ImageUpload } from "@/types";

export interface ProjectsTableProps {
	rows: ImageUpload[];
	onCaptionChange(id: string, value: string): void;
	onSave(image: ImageUpload): void;
	onRemove(image: ImageUpload): void;
	onClick(index: number): void;
}

interface TableRowProps {
	image: ImageUpload;
	onCaptionChange(id: string, value: string): void;
	onSave(): void;
	onRemove(): void;
	onClick(): void;
}

export function TableRow({ image, onCaptionChange, onSave, onRemove, onClick }: TableRowProps) {
	const { src, alt, height, width, modified } = image;
	const name = src.split("/").pop();

	const handleCaptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		onCaptionChange(src, event.target.value);
	};

	return (
		<tr key={src}>
			<Box component="td" sx={{ width: 116 }}>
				<Box
					component="button"
					sx={{ p: 0, bgcolor: "transparent", border: 0 }}
					onClick={onClick}
				>
					<ImageWithErrorHandling
						unoptimized
						src={src}
						alt={alt}
						height={height}
						width={width}
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
				<Textarea value={alt} onChange={handleCaptionChange} />
			</td>
			<Box component="td" sx={{ width: 56 }}>
				{modified ? (
					<IconButton
						variant="solid"
						color="warning"
						onClick={() => {
							onSave();
						}}
					>
						<SaveIcon />
					</IconButton>
				) : (
					<IconButton
						variant="solid"
						color="danger"
						onClick={() => {
							onRemove();
						}}
					>
						<DeleteIcon />
					</IconButton>
				)}
			</Box>
		</tr>
	);
}

export function ProjectsTable(props: ProjectsTableProps) {
	const { rows, onCaptionChange, onRemove, onSave, onClick } = props;

	return (
		<Table aria-label="basic table">
			<tbody>
				{rows.map((image, index) => (
					<TableRow
						key={image.src}
						image={image}
						onCaptionChange={onCaptionChange}
						onSave={() => onSave(image)}
						onRemove={() => onRemove(image)}
						onClick={() => onClick(index)}
					/>
				))}
			</tbody>
		</Table>
	);
}
