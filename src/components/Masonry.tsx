import { Box } from "@mui/joy";
import { Children, ReactNode } from "react";

interface MasonryProps {
	children: ReactNode;
	columns?: number; // Number of columns for the masonry layout
	gap?: number; // Gap between masonry items
}

export default function Masonry({ children, gap = 2 }: MasonryProps) {
	return (
		<Box
			sx={{
				mt: 4,
				columnCount: { xs: 1, sm: 2, md: 3, lg: 4 },
				columnGap: gap,
			}}
		>
			{Children.map(children, child => (
				<Box sx={{ mb: gap }}>{child}</Box>
			))}
		</Box>
	);
}
