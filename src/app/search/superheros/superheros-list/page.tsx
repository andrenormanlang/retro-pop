'use client';

import React from 'react';
import { Spinner, Center, Container, Box, Text, Heading } from '@chakra-ui/react';
import CharactersReferenceListTable from '@/helpers/Superhero-API/CharactersReferenceListTable';
import useGetCharactersList from '@/hooks/superhero-api/useGetCharactersList';
import { CharactersApiResponse } from '@/types/characters-list.types';

function CharactersComponent() {
//   const { characters, isLoading, error } = useGetCharactersList();
const {  data : charactersList, isLoading, error } = useGetCharactersList()

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

  const charactersData: CharactersApiResponse = {
	  data: charactersList ?? [],
	  status: charactersList ? 'success' : 'error',
	  ID: 0,
	  CharacterName: ''
  };

  return (
    <Container maxW="1300px" p={4}>
      <Box mb={4}>
	  <Heading as="h1"  size="xl" fontFamily="Permanent Marker" fontWeight="" textAlign="center" mb={4}>
          Characters Reference List
        </Heading>
        <CharactersReferenceListTable characters={charactersData} />
      </Box>
    </Container>
  );
}

export default CharactersComponent;
