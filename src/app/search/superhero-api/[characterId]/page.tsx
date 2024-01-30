'use client';

import { useGetSuperhero } from "@/hooks/superhero-api/useGetSuperhero";
import { Superhero } from "@/types/superhero.types";
import { Box, Center, Container, Flex, HStack, Image, Spinner, Tag, Text, VStack } from "@chakra-ui/react";
import { usePathname } from "next/navigation";


const SuperheroID = () => {
	const pathname = usePathname();
	const superheroId = pathname.split("/").pop() || "";
	const {
		data,
		isLoading,
		isError,
		error,
	} = useGetSuperhero(superheroId);

	const superhero = data as Superhero;

	console.log('superhero', superhero);

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

	// Render your superhero details using the 'superhero' data object
	return (
		<Container maxW="container.xl" p={4}>
        <VStack spacing={4} align="stretch">
            <Flex direction={{ base: "column", md: "row" }} gap={4} align="start">
                <Box flexShrink={0}>
                    <Image
                        borderRadius="md"
                        boxSize={{ base: "100%", md: "300px" }}
                        objectFit="contain"
                        src={superhero.image.url}
                        alt={superhero.name}
                    />
                    <Text fontSize="2xl" fontWeight="bold">{superhero.name}</Text>
                    <Text fontSize="md">Publisher: {superhero.biography.publisher}</Text>
                </Box>

                <VStack spacing={2} flex={1}>
                    <Text fontSize="lg" fontWeight="bold">Biography</Text>
                    <Text fontSize="md">Full Name: {superhero.biography.fullName}</Text>
                    <Text fontSize="md">Place of Birth: {superhero.biography.placeOfBirth}</Text>
                    <Text fontSize="md">Alter Egos: {superhero.biography.alteregos}</Text>
                    <Text fontSize="md">Aliases: {superhero.biography.aliases.join(", ")}</Text>
                    <Text fontSize="md">Alignment: {superhero.biography.alignment}</Text>
                </VStack>
            </Flex>

            <Box>
                <Text fontSize="lg" fontWeight="bold">Power Stats</Text>
                <HStack spacing={2}>
                    {/* Mapping through powerstats for cleaner code */}
                    {Object.entries(superhero.powerstats).map(([key, value]) => (
                        <Tag key={key}>{`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`}</Tag>
                    ))}
                </HStack>
            </Box>

            {/* Additional sections for appearance, work, connections */}
            <Box>
                <Text fontSize="lg" fontWeight="bold">Appearance</Text>
                {/* Similar mapping approach for appearance, work, connections */}
            </Box>
            {/* ...similar for work and connections... */}
        </VStack>
    </Container>
    );
};

export default SuperheroID;
