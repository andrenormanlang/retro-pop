"use client";

import { Box, ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import Navbar from "@/components/partials/navbar";
import ReduxProvider from "@/contexts/ReduxProvider";
import { UserProvider } from "@/contexts/UserContext";
import ReactQueryProvider from "@/lib/react-query-provider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
	return (
		<ChakraProvider>
			<ColorModeProvider options={{ initialColorMode: "dark", useSystemColorMode: true }}>
				<ReactQueryProvider>
					<ReduxProvider>
						<UserProvider>
							<Box position="relative" minH="100vh" overflow="hidden">
								<Box position="fixed" top={0} left={0} right={0} zIndex={100}>
									<Navbar />
								</Box>
								<Box
									mt={{ base: "5rem", md: "6.5rem" }}
									minH="calc(100vh - 6.5rem)"
									position="relative"
									zIndex={1}
								>
									{children}
								</Box>
							</Box>
						</UserProvider>
					</ReduxProvider>
				</ReactQueryProvider>
			</ColorModeProvider>
		</ChakraProvider>
	);
}
