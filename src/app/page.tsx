'use client';

import React, { useEffect, useState } from 'react';
import { Image, Text, Flex, Container, Center, Spinner } from "@chakra-ui/react";
import { ComicIssue } from '../types/metron.types'; // Adjust the import path as needed
// import { getRandomComicCover } from '@/helpers/getRandomCover';

export default function HomePage() {
	const [cover, setCover] = useState<ComicIssue | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        async function fetchRandomCover() {
            setIsLoading(true);
            try {
                const response = await fetch('/api/random-cover');
                if (!response.ok) {
                    throw new Error(`API call failed with status: ${response.status}`);
                }
                const randomCover = await response.json();
                setCover(randomCover);
            } catch (error) {
                console.error("Error fetching random cover:", error);
            }
            setIsLoading(false);
        }

        fetchRandomCover();
    }, []);

    if (isLoading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" />
            </Center>
        );
    }

    return (
        <Container maxW="container.xl" centerContent p={4}>
            {cover && (
                <Flex
                    p={4}
                    borderRadius="md"
                    direction="column"
                    align="center"
                    justify="center"
                >
                    <Text fontWeight="bold" fontSize="2rem" mt={2} fontFamily="Bangers" letterSpacing="0.2rem" color="red">
                        RANDOM COVER!
                    </Text>
                    <Text fontWeight="bold" fontSize="1.5rem" mt={2} fontFamily="Bangers" letterSpacing="0.2rem" color="white">
                        {cover.issue}
                    </Text>
                    <Image
                        src={cover.image}
                        alt={`Random Comic Book Cover: ${cover.issue}`}
                        boxSize="400px"
                        objectFit="contain"
                    />
                </Flex>
            )}
        </Container>
    );
}


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
