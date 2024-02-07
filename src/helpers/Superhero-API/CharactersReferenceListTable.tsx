'use client'

/* eslint-disable */
// @ts-nocheck

import { CharactersApiResponse, CharactersList } from '@/types/characters-list.types';
import { useRouter } from 'next/navigation';
import { Table, Thead, Tbody, Tr, Th, Td, Flex, useColorModeValue } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

const CharactersReferenceListTable: React.FC<{ characters:CharactersApiResponse }> = ({ characters }) => {
  // Correctly initialize sortConfig with SortConfig type
 const router = useRouter();
 const bg = useColorModeValue('red.100', 'red.700');
 const columns = 3;

 const [characterColumns, setCharacterColumns] = useState<CharactersApiResponse[][]>([]);

  const handleRowClick = (characterId: number) => {
    // Navigate to the SuperheroID page with the character ID
    router.push(`/search/superheros/superhero-api/${characterId}`);
  };



  useEffect(() => {
	// Access the array with characters.data.data
	const charactersAny = characters as any;
	if (Array.isArray(charactersAny.data.data)) {
	  const columnSize = Math.ceil(charactersAny.data.data.length / columns);
	  const newCharacterColumns = new Array(columns).fill(null).map((_, index) => {
		return charactersAny.data.data.slice(index * columnSize, (index + 1) * columnSize);
	  });
	  setCharacterColumns(newCharacterColumns);
	} else {
	  console.log('Data is not an array:', charactersAny.data);
	}
  }, [characters]);


  return (
    <Flex direction="row" overflowX="auto" h="80vh">
      {characterColumns.map((columnCharacters, index) => (
        <Table key={index} variant="simple" size="sm" mx={4}>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Character Name</Th>
            </Tr>
          </Thead>
          <Tbody>
		  {columnCharacters.map((character: CharactersApiResponse)  => (
              <Tr
			  key={character.ID}
			  _hover={{ bg: bg, cursor: 'pointer' }}
			  onClick={() => handleRowClick(character.ID)}
			>
                <Td>{character.ID}</Td>
                <Td>{character.CharacterName}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ))}
    </Flex>
  );
};

export default CharactersReferenceListTable;

