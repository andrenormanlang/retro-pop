import { Html, Head, Main, NextScript } from 'next/document';
import { Global } from '@emotion/react';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body>
        <Global
          styles={`
            html, body {
              width: 100%;
              overflow-x: hidden;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            *, *::before, *::after {
              box-sizing: border-box;
            }
            img, iframe {
              max-width: 100%;
              display: block;
            }
            .container {
              max-width: 100%;
              overflow-x: hidden;
            }
          `}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
