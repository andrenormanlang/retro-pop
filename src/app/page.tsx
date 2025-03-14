'use client'

import { Box, Container, Heading } from '@chakra-ui/react';
import ComicsBuy from './comics-store/buy/page';
import { NextPage } from 'next';
import { Global } from '@emotion/react';

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
      <Box
        className="halftone-background"
        width="100vw"
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Container maxW="container.xl" p={4}>
          <Heading as="h1" size="xl" mb={6}>
            {/* Welcome to RetroPop! */}
          </Heading>
          <Box>
            {/* ComicsBuy Component as a Child Component */}
            <ComicsBuy />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;



// 'use client'

// import { Box, Container, Heading } from '@chakra-ui/react';
// import ComicsBuy from './comics-store/buy/page';
// import { NextPage } from 'next';


// const HomePage: NextPage = () => {
//   return (
//     <Box
//       width="100vw"
//       minHeight="100vh"
//       bgImage="url('/halftone-background.svg')"
//       bgSize="cover"
//       bgPosition="center"
//       display="flex"
//       alignItems="center"
//     >
//       <Container maxW="container.xl" p={4}>
//         <Heading as="h1" size="xl" mb={6}>
//           {/* Welcome to RetroPop! */}
//         </Heading>
//         <Box>
//           {/* ComicsBuy Component as a Child Component */}
//           <ComicsBuy />
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default HomePage;

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Image, Text, Flex, Container, Center, Spinner } from "@chakra-ui/react";
// import { ComicIssue } from '../types/metron.types'; // Adjust the import path as needed
// // import { getRandomComicCover } from '@/helpers/getRandomCover';

// export default function HomePage() {
// 	const [cover, setCover] = useState<ComicIssue | null>(null);
//     const [isLoading, setIsLoading] = useState<boolean>(false);

//     useEffect(() => {
//         async function fetchRandomCover() {
//             setIsLoading(true);
//             try {
//                 const response = await fetch('/api/random-cover');
//                 if (!response.ok) {
//                     throw new Error(`API call failed with status: ${response.status}`);
//                 }
//                 const randomCover = await response.json();
//                 setCover(randomCover);
//             } catch (error) {
//                 console.error("Error fetching random cover:", error);
//             }
//             setIsLoading(false);
//         }

//         fetchRandomCover();
//     }, []);

//     if (isLoading) {
//         return (
//             <Center h="100vh">
//                 <Spinner size="xl" />
//             </Center>
//         );
//     }

//     return (
//         <Container maxW="container.xl" centerContent p={4}>
//             {cover && (
//                 <Flex
//                     p={4}
//                     borderRadius="md"
//                     direction="column"
//                     align="center"
//                     justify="center"
//                 >
//                     <Text fontWeight="bold" fontSize="2rem" mt={2} fontFamily="Bangers" letterSpacing="0.2rem" color="red">
//                         RANDOM COVER!
//                     </Text>
//                     <Text fontWeight="bold" fontSize="1.5rem" mt={2} fontFamily="Bangers" letterSpacing="0.2rem" color="red.500">
//                         {cover.issue}
//                     </Text>
//                     <Image
//                         src={cover.image}
//                         alt={`Random Comic Book Cover: ${cover.issue}`}
//                         boxSize={{ base: "300px", md: "400px" }}
//                         objectFit="contain"
//                     />
//                 </Flex>
//             )}
//         </Container>
//     );
// }


// pages/index.tsx
// const HomePage = () => {
//     return <div></div>;
//   };

//   export default HomePage;


// import {
// 	Image,
// 	Text,
// 	Flex,
// 	Container,
//   } from "@chakra-ui/react";

//   import getRandomCover from "@/helpers/getRandomCover";

//   export default async function HomePage() {
// 	const cover = await getRandomCover()

// 	return (
// 	  <Container maxW="container.xl" centerContent p={4}>
// 		{cover && (
// 		  <Flex
// 			p={4}
// 			borderRadius="md"
// 			direction="column"
// 			align="center"
// 			justify="center"
// 		  >
// 			<Text fontWeight="bold" fontSize="2rem" mt={2} fontFamily="Bangers" letterSpacing="0.2rem" color="red">
// 			  RANDOM COVER!
// 			</Text>
// 			<Text fontWeight="bold" fontSize="1.5rem" mt={2} fontFamily="Bangers" letterSpacing="0.2rem" color="white">
// 			  {cover.title}
// 			</Text>
// 			<Image
// 			  src={cover.coverPage}
// 			  alt={`Random Comic Book Cover: ${cover.title}`}
// 			  boxSize="400px"
// 			  objectFit="contain"
// 			/>
// 		  </Flex>
// 		)}
// 	  </Container>
// 	);
//   };


// 'use client';
// import React, { useEffect, useState } from 'react';
// import {
//   Box,
//   Image,
//   Text,
//   Center,
//   Spinner,
//   Flex,
//   Badge,
//   Container,
//   useColorModeValue
// } from "@chakra-ui/react";
// import { motion } from "framer-motion";
// import { ComicCover } from '../types/cbAPI.types'; // Adjust the import path as needed


// const HomePage: React.FC = () => {
//   const [cover, setCover] = useState<ComicCover | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const bgColor = useColorModeValue("white", "gray.800");

//   useEffect(() => {
//     const fetchRandomCover = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetch('/api/random-cover');
//         const data: ComicCover = await response.json();
//         setCover(data);
//       } catch (error) {
//         console.error('Error fetching random cover:', error);
//       }
//       setIsLoading(false);
//     };

//     fetchRandomCover();
//   }, []);

//   if (isLoading) {
//     return (
//       <Center h="100vh">
//         <Spinner size="xl" />
//       </Center>
//     );
//   }

//   return (
//     <Container maxW="container.xl" centerContent p={4}>
//       {cover && (
//         <motion.div
//           whileHover={{ scale: 1.05 }}
//           style={{ textDecoration: 'none', cursor: 'pointer' }}
//         >
//           <Flex
//             bg={bgColor}
//             p={4}
//             borderRadius="md"
//             direction="column"
//             align="center"
//             justify="center"
//           >
//             <Text fontWeight="bold" fontSize="lg" mt={2}>
//               {cover.title}
//             </Text>
//             <Image
//               src={cover.coverPage}
//               alt={`Random Comic Book Cover: ${cover.title}`}
//               boxSize="700px"
//               objectFit="contain"
//             />
//             {/* <Badge colorScheme="green" mt={1}>
//               {cover.information.Year}
//             </Badge> */}
//             {/* <Text fontSize="sm" color="gray.500" textAlign="center" mt={2}>
//               {cover.description}
//             </Text> */}
//             {/* Additional content or buttons can be added here */}
//           </Flex>
//         </motion.div>
//       )}
//       {!cover && !isLoading && (
//         <Text fontSize="xl">No cover available at the moment.</Text>
//       )}
//     </Container>
//   );
// };

// export default HomePage;
