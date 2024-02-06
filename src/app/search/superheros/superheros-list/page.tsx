'use client';

import React from 'react';
import { Spinner, Center, Container, Box, Text, Heading } from '@chakra-ui/react';
import useGetCharactersList from '@/hooks/superhero-api/useGetCharactersList';
import CharactersReferenceListTable from '@/helpers/Superhero-API/CharactersReferenceListTable';

function CharactersComponent() {
//   const { characters, isLoading, error } = useGetCharactersList();
const { data: characters, isLoading, error } = useGetCharactersList();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Text color="red.500" fontSize="lg">An error has occurred: {error.message}</Text>
      </Center>
    );
  }

  return (
    <Container maxW="1300px" p={4}>
      <Box mb={4}>
	  <Heading as="h1"  size="xl" fontFamily="Permanent Marker" fontWeight="" textAlign="center" mb={4}>
          Characters Reference List
        </Heading>
        {/* Here we use CharactersReferenceListTable instead of a simple list */}
        {/* Make sure the CharactersReferenceListTable is adapted to use Chakra UI components if needed */}
        <CharactersReferenceListTable characters={characters ?? []} />
      </Box>
    </Container>
  );
}

export default CharactersComponent;
