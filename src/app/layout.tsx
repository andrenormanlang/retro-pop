// app/layout.tsx
import { Inter, Libre_Franklin } from "next/font/google";
import { Metadata } from "next";
import ClientProviders from "@/components/client-providers";
import GlobalStyles from "@/components/global-styles";

const inter = Inter({ subsets: ["latin"] });
const libreFranklin = Libre_Franklin({ subsets: ["latin"] }); // Assuming you want this font selectable in the editor

export const metadata: Metadata = {
	title: "Retro-Pop Comics",
	description: "Search & Sell Used Comics Web App",
	authors: [{ name: "Andre Lang", url: "" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" data-bs-theme="dark" className={`${inter.className} ${libreFranklin.className}`}>
			<head>
				{/* ignore the error below */}
				<script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" defer/>
				{/* rest of your scripts go under */}
			</head>
			<body>
				<GlobalStyles />
				<ClientProviders>{children}</ClientProviders> {/* ClientProviders likely includes ChakraProvider */}
			</body>
		</html>
	);
}
