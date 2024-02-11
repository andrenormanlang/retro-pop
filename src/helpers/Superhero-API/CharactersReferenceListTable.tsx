"use client";

import { useRouter } from "next/navigation";
import { useBreakpointValue, Table, Thead, Tbody, Tr, Th, Td, Flex, useColorModeValue } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export type Character = {
	ID: number;
	CharacterName: string;
};

export type CharactersApiResponse = {
	data: Character[];
	status: string;
};

const CharactersReferenceListTable: React.FC<{ characters: CharactersApiResponse }> = ({ characters }) => {
	const router = useRouter();
	const bg = useColorModeValue("red.100", "red.700");
	const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

	const [characterColumns, setCharacterColumns] = useState<Character[][]>([]);

	const handleRowClick = (characterId: number) => {
		// Navigate to the SuperheroID page with the character ID
		router.push(`/search/superheros/superhero-api/${characterId}`);
	};

	useEffect(() => {
		const charactersAny = characters as any;
		if (Array.isArray(charactersAny.data.data)) {
			const columnSize = Math.ceil(charactersAny.data.data.length / (columns || 1));
			const newCharacterColumns = new Array(columns).fill(null).map((_, index) => {
				return charactersAny.data.data.slice(index * columnSize, (index + 1) * columnSize);
			});
			setCharacterColumns(newCharacterColumns);
		} else {
			console.log('Data is not an array:', characters.data);
	
		}
	}, [characters, columns]);

	return (
		<Flex direction="row" overflowX="auto" h="80vh">
			{characterColumns.map((column, columnIndex) => (
				<Table key={columnIndex} variant="simple" size="sm" mx={4}>
					<Thead>
						<Tr>
							<Th>ID</Th>
							<Th>Character Name</Th>
						</Tr>
					</Thead>
					<Tbody>
						{column.map((character) => (
							<Tr
								key={character.ID}
								_hover={{ bg: bg, cursor: "pointer" }}
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
