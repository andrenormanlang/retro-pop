// pages/_app.tsx
import { NextUIProvider } from '@nextui-org/react';
import Nav from '../components/partials/navbar';
import '../styles/globals.scss'; // Make sure you have this Sass file in your project
import { AppProps } from 'next/app'; // Import AppProps for typing
import { ChakraProvider } from '@chakra-ui/react';

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
    <NextUIProvider>

      <Nav />
      <Component {...pageProps} />
    </NextUIProvider>

    </ChakraProvider>
  );
}

export default App;
