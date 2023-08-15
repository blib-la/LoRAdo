import { Container } from "@mui/joy";
import { ReactNode } from "react";

interface LayoutProps {
	children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	return (
		<Container component="main" sx={{ my: 8 }}>
			{children}
		</Container>
	);
}
