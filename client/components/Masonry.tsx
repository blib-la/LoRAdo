import { Box } from "@mui/joy";
import type { ReactNode } from "react";
import { Children } from "react";

interface MasonryProps {
	children: ReactNode;
	gap?: number;
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
			{Children.map(
				children,
				(child, index) =>
					child && (
						<Box key={index} sx={{ mb: gap }}>
							{child}
						</Box>
					)
			)}
		</Box>
	);
}
