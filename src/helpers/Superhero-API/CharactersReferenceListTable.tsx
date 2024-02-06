'use client'

import { CharactersList } from '@/types/characters-list.types';
import { useRouter } from 'next/navigation';
import { Table, Thead, Tbody, Tr, Th, Td, Flex, useColorModeValue } from '@chakra-ui/react';

const CharactersReferenceListTable: React.FC<{ characters: CharactersList[] }> = ({ characters }) => {
  // Correctly initialize sortConfig with SortConfig type
 const router = useRouter();

  const handleRowClick = (characterId: number) => {
    // Navigate to the SuperheroID page with the character ID
    router.push(`/search/superheros/superhero-api/${characterId}`);
  };

  // Call useColorModeValue outside the callback
  const bg = useColorModeValue('gray.100', 'gray.700');
  console.log('CHARACTERS', characters);

   // Divide the characters into columns
  const columns = 3;
   const columnSize = Math.ceil(characters.data.length / columns);
  const characterColumns = new Array(columns).fill(null).map((_, index) => {
    return characters.data.slice(index * columnSize, (index + 1) * columnSize);
  });
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
            {columnCharacters.map(character => (
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
