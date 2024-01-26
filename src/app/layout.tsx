import Navbar from "../components/partials/navbar";
import { Box, ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import './globals.css'
import type { Metadata } from 'next'



export const metadata: Metadata = {
	title: 'Retro-Pop Comics',
	description: 'Search & Sell Used Comics Web App',
	authors: [{ name: 'Andre Lang', url: '' }]
}

export default function RootLayout({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='en' data-bs-theme='dark'>
			<body>

			<ChakraProvider>
			<ColorModeProvider
				options={{
					initialColorMode: "light",
					useSystemColorMode: true,
				}}
			>
					<Navbar />
					<Box mt="8rem">

					{children}
					</Box>
					</ColorModeProvider>
		</ChakraProvider>


			</body>
		</html>
	)
}

