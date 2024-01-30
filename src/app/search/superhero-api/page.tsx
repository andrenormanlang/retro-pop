'use client';

import { useState, useEffect, Suspense } from "react";
import {
  SimpleGrid,
  Box,
  Image,
  Text,
  Container,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import NextLink from "next/link";
import type { NextPage } from "next";
import SearchBox from "@/components/SearchBox";
import ComicsPagination from "@/components/ComicsPagination";
import { useDebouncedCallback } from "use-debounce";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useGetSuperheroes } from "@/hooks/superhero-api/useGetSuperhero";
import { useSearchParameters } from "@/hooks/comic-vine/useSearchParameters";
import { Superheroes } from "@/types/superheroes.types";

const Superheroes: NextPage = () => {
  const pageSize = 16;
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
  } = useSearchParameters(1, "");

  const { data, isLoading, isError, error } = useGetSuperheroes(
    searchTerm,
    currentPage,
    pageSize
  );

  // ... rest of the handlePageChange and handleSearchTerm functions

  // ... useEffect for updating URL parameters

  if (isLoading)
  return (
	  <Center h="100vh">
		  <Spinner size="xl" />
	  </Center>
  );

if (isError) {
  return (
	  <div
		  style={{
			  display: "flex",
			  justifyContent: "center",
			  alignItems: "center",
			  height: "100vh", // Full viewport height
			  fontFamily: '"Bangers", cursive', // Assuming "Bangers" font is loaded
			  fontSize: "1.5rem", // Larger font size
			  color: "red", // Red color for the error message
			  textAlign: "center",
			  padding: "20px",
			  backgroundColor: "#f0f0f0", // Light background for visibility
			  borderRadius: "10px",
			  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)", // Optional shadow for better appearance
		  }}
	  >
		  Error: {error.message}
	  </div>
  );
}
  console.log('data', data);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Container maxW="container.xl" centerContent p={4}>
        {/* <SearchBox onSearch={handleSearchTerm} />
        {data && (
          // ... Displaying search results and pagination info
        )} */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} width="100%">
          {data?.map((hero : Superheroes) => (
            <NextLink
              href={`/search/superhero-api/${hero.id}`}
              passHref
              key={hero.id}
            >
              <motion.div whileHover={{ scale: 1.05 }}>
                <Box
                  boxShadow="0 4px 8px rgba(0,0,0,0.1)"
                  rounded="sm"
                  overflow="hidden"
                  p={4}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="space-between"
                  minH="500px"
				  minW="600px"
                >
                  <Image
                    src={hero.images.lg}
                    alt={hero.name}
					maxW="300px"
					maxH="300px"
                    objectFit="contain"
                  />
                  <Text fontWeight="bold" fontSize="lg" noOfLines={1} textAlign="center">
                    {hero.name}
                  </Text>
                  <Text fontWeight="bold" fontSize="sm" noOfLines={1} textAlign="center">
                    first appearance: {hero.biography.firstAppearance}
                  </Text>
                  <Text fontWeight="bold" fontSize="md" noOfLines={1} textAlign="center">
                    publisher: {hero.biography.publisher}
                  </Text>
                  {/* Display other hero details as needed */}
                </Box>
              </motion.div>
            </NextLink>
          ))}
        </SimpleGrid>
        {/* <ComicsPagination
          currentPage={currentPage}
          totalPages={Math.ceil(data?.number_of_total_results / pageSize)}
          onPageChange={handlePageChange}
        /> */}
      </Container>
    </Suspense>
  );
};

export default Superheroes;
