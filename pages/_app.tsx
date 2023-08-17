import { CssBaseline } from "@mui/joy";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import type { AppProps } from "next/app";
import Head from "next/head";

const theme = extendTheme({
	colorSchemes: {
		light: {
			palette: {},
		},
		dark: {
			palette: {},
		},
	},
});

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<CssVarsProvider theme={theme} defaultMode="system">
			<CssBaseline />
			<Head>
				<title>Lorado by failfa.st</title>
				<meta
					name="description"
					content="Lorado is a UI that allows easy creation of LoRAs for stable diffussion SDXL."
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="shortcut icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
				<meta name="msapplication-TileColor" content="#223431" />
				<meta name="theme-color" content="#ffffff" />
			</Head>
			<Component {...pageProps} />
		</CssVarsProvider>
	);
}

export default MyApp;
