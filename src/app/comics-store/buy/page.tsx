'use client';
import {
  SimpleGrid,
  Box,
  Image,
  Text,
  Container,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Heading,
} from "@chakra-ui/react";
import { useComicBuy, ComicBuy } from "@/hooks/comics-sale/useComicBuy";
import { motion } from "framer-motion";
import NextLink from "next/link";
import type { NextPage } from "next";

// Function to format the date as "21, Jan, 2024"
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const ComicsBuy: NextPage = () => {
  const { data, loading, error } = useComicBuy();

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Center>
    );
  }

  const defaultImageUrl = '/path/to/default-image.jpg'; // Provide a path to a default image

  console.log(data);

  return (
    <Container maxW="container.xl" centerContent p={4}>
      <Heading as="h1" size="xl" mb={6}>
        Buy Comic Books
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="100%">
        {data?.map((comic: ComicBuy) => (
          <NextLink
            href={`/comics-store/buy/${comic.id}`}
            passHref
            key={comic.id}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <Box
                boxShadow="0 4px 8px rgba(0,0,0,0.1)"
                rounded="md"
                overflow="hidden"
                p={4}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="space-between"
                minH="400px"
                position="relative"
              >
                <Image
                  src={comic.image || defaultImageUrl}
                  alt={comic.title}
                  maxW="300px"
                  maxH="300px"
                  objectFit="contain"
                  onError={(e) => {
                    e.currentTarget.src = defaultImageUrl;
                  }}
                />
                <Text
                  fontWeight="bold"
                  fontSize="lg"
                  noOfLines={1}
                  textAlign="center"
                  mt={4}
                >
                  {comic.title}
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Release Date: {formatDate(comic.release_date)}
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Publisher: {comic.publisher}
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Price: {comic.price} {comic.currency}
                </Text>
              </Box>
            </motion.div>
          </NextLink>
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default ComicsBuy;
