import { Inter, Libre_Franklin } from 'next/font/google';
import Navbar from "../components/partials/navbar";
import { Box, ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import "./globals.css";
import Providers from "@/lib/query-provider";
import ReduxProvider from '../contexts/ReduxProvider';
import { UserProvider } from "@/contexts/UserContext";
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const libreFranklin = Libre_Franklin({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: "Retro-Pop Comics",
  description: "Search & Sell Used Comics Web App",
  authors: [{ name: "Andre Lang", url: "" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-bs-theme="dark" className={`${inter.className} ${libreFranklin.className}`}>
      <body>
        <ChakraProvider>
          <ColorModeProvider
            options={{
              initialColorMode: "dark",
              useSystemColorMode: true,
            }}
          >
            <Providers>
              <ReduxProvider>
                <UserProvider>
                  <Navbar />
                  <Box mt="8rem" className="container">
                    {children}
                  </Box>
                </UserProvider>
              </ReduxProvider>
            </Providers>
          </ColorModeProvider>
        </ChakraProvider>
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
