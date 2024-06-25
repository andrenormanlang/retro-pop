import Navbar from "../components/partials/navbar";
import { Box, ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/lib/query-provider";
import ReduxProvider from '../contexts/ReduxProvider'; // Import the new ReduxProvider component
import { UserProvider } from "@/contexts/UserContext";
import Head from 'next/head';

export const metadata: Metadata = {
  title: "Retro-Pop Comics",
  description: "Search & Sell Used Comics Web App",
  authors: [{ name: "Andre Lang", url: "" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-bs-theme="dark">
      {/* <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com/s/librefranklin/v4/jiizDREVtHg8c9pDtHTskTgx4kRiUFzc.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

      </Head> */}
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
