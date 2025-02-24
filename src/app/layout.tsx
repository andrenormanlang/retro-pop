import { Inter, Libre_Franklin } from "next/font/google";
import { Metadata } from "next";
import ClientProviders from "@/components/client-providers";
import GlobalStyles from "@/components/global-styles";

const inter = Inter({ subsets: ["latin"] });
const libreFranklin = Libre_Franklin({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Retro-Pop Comics",
	description: "Search & Sell Used Comics Web App",
	authors: [{ name: "Andre Lang", url: "" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" data-bs-theme="dark" className={`${inter.className} ${libreFranklin.className}`}>
			<body>
				<GlobalStyles />
				<ClientProviders>{children}</ClientProviders>
			</body>
		</html>
	);
}

// WITH CONTEXT!
// import Navbar from "../components/partials/navbar";
// import { Box, ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
// import "./globals.css";
// import type { Metadata } from "next";
// import Providers from "@/lib/query-provider";
// import { AvatarProvider } from "@/contexts/AvatarContext";

// export const metadata: Metadata = {
// 	title: "Retro-Pop Comics",
// 	description: "Search & Sell Used Comics Web App",
// 	authors: [{ name: "Andre Lang", url: "" }],
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
// 	return (
// 		<html lang="en" data-bs-theme="dark">
// 			<body>
// 				<ChakraProvider>
// 					<ColorModeProvider
// 						options={{
// 							initialColorMode: "dark",
// 							useSystemColorMode: true,
// 						}}
// 					>
// 						<Providers>
// 							<AvatarProvider>
// 								<Navbar />
// 								<Box mt="8rem">{children}</Box>
// 							</AvatarProvider>
// 						</Providers>
// 					</ColorModeProvider>
// 				</ChakraProvider>
// 			</body>
// 		</html>
// 	);
// }
