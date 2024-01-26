'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Image,
  Text,
  Center,
  Spinner,
  Flex,
  Badge,
  Container,
  useColorModeValue
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ComicCover } from '../types/cbAPI.types'; // Adjust the import path as needed

const HomePage: React.FC = () => {
  const [cover, setCover] = useState<ComicCover | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const bgColor = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const fetchRandomCover = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/random-cover');
        const data: ComicCover = await response.json();
        setCover(data);
      } catch (error) {
        console.error('Error fetching random cover:', error);
      }
      setIsLoading(false);
    };

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
        <motion.div
          whileHover={{ scale: 1.50 }}
          style={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          <Flex
            bg={bgColor}
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
              {cover.title}
            </Text>
            <Image
              src={cover.coverPage}
              alt={`Random Comic Book Cover: ${cover.title}`}
              boxSize="400px"
              objectFit="contain"
            />
            {/* <Badge colorScheme="green" mt={1}>
              {cover.information.Year}
            </Badge> */}
            {/* <Text fontSize="sm" color="gray.500" textAlign="center" mt={2}>
              {cover.description}
            </Text> */}
            {/* Additional content or buttons can be added here */}
          </Flex>
        </motion.div>
      )}
      {!cover && !isLoading && (
        <Text fontSize="xl">No cover available at the moment.</Text>
      )}
    </Container>
  );
};

export default HomePage;
