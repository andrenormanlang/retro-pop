"use client";

import { Box, Container } from "@chakra-ui/react";
import ComicsBuy from "./comics-store/buy/page";
import { NextPage } from "next";
import { Global } from "@emotion/react";

const HomePage: NextPage = () => {
	return (
		<>
			<Global
				styles={`
          @layer base {
            .halftone-background {
              position: relative;
              overflow: hidden;
              width: 100%;
              height: 100%;
              background-color: white;
              transition: background-color 0.5s ease;
            }

            .halftone-background::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-size: 10px 10px;
              background-image: radial-gradient(circle, black 3px, transparent 3px); /* Black dots */
              transition: background-image 0.5s ease;
            }

            /* Dark mode: White dots on black background */
            [data-theme="dark"] .halftone-background {
              background-color: black; /* Black background */
            }

            [data-theme="dark"] .halftone-background::before {
              background-image: radial-gradient(circle, white 3px, transparent 3px); /* White dots */
            }
          }
        `}
			/>
			<Box className="halftone-background" position="relative" zIndex="0">
				<Container maxW="container.xl" p={4} position="relative" zIndex="1">
					<ComicsBuy />
				</Container>
			</Box>
		</>
	);
};

export default HomePage;
