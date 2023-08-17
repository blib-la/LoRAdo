import { Container } from "@mui/joy";
import { ReactNode } from "react";

import { Header } from "@/components/Header";

interface LayoutProps {
	children?: ReactNode;
	directories: { fullPath: string; id: string }[];
}

export default function Layout({ children, directories }: LayoutProps) {
	return (
		<>
			<Header directories={directories} />
			<Container component="main" sx={{ my: 8 }}>
				{children}
			</Container>
		</>
	);
}
