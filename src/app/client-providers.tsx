"use client";

import { Box, ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import Navbar from "@/components/partials/navbar";
import ReduxProvider from '@/contexts/ReduxProvider';
import { UserProvider } from "@/contexts/UserContext";
import ReactQueryProvider from '@/lib/react-query-provider';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider>
      <ColorModeProvider options={{ initialColorMode: "dark", useSystemColorMode: true }}>
        <ReactQueryProvider>
          <ReduxProvider>
            <UserProvider>
              <Navbar />
              <Box mt="8rem" className="container">
                {children}
              </Box>
            </UserProvider>
          </ReduxProvider>
        </ReactQueryProvider>
      </ColorModeProvider>
    </ChakraProvider>
  );
}
