import MuiMasonry from "@mui/lab/Masonry";
import type { ReactNode } from "react";

interface MasonryProps {
	children: NonNullable<ReactNode>;
}

export default function Masonry({ children }: MasonryProps) {
	return (
		<MuiMasonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} sx={{ mt: 2, overflow: "hidden" }}>
			{children}
		</MuiMasonry>
	);
}
