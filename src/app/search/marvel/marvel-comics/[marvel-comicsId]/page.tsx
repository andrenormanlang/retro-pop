"use client";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
	Box,
	Image,
	Text,
	VStack,
	HStack,
	Tag,
	Flex,
	Badge,
	Container,
	useColorModeValue,
	Heading,
	Button,
	Center,
	Spinner,
	SimpleGrid,
} from "@chakra-ui/react";
import { CharacterCredit, PersonCredit } from "@/types/comic.types";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { useGetMarvelComic } from "@/hooks/marvel/useMarvelComics";

const MarvelComic: NextPage = () => {
	// const [comic, setComic] = useState<ComicVineIssue | null>(null);
	const router = useRouter();
	const [setIsLoading] = useState(false);
	const bgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.700");
	const pathname = usePathname();
	const comicId = pathname.split("/").pop() || "";
	const searchParams = useSearchParams();

	console.log("issueId", comicId);

	const { data, isLoading, isError, error } = useGetMarvelComic(comicId);

	const handleBack = () => {
		// Read the page number from the search parameters
		const page = searchParams.get("page") || "1";
		// Navigate back to the issues page with the remembered page number
		router.push(`/search/marvel/marvel-comics?page=${page}`);
	};

	const formatDate = (dateString: string) => {
		const options: Intl.DateTimeFormatOptions = {
			day: "numeric",
			month: "short",
			year: "numeric",
		};
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

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

	console.log("comic", data);

	const result = data?.data?.results?.[0];

	const solicitationText =
		result?.textObjects?.[0]?.text || "No description available.";

	return (
		<Suspense
			fallback={
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
					Loading...
				</div>
			}
		>
			<Container maxW="1150px" p={4}>
				<Box mb={4}>
					<Button
						leftIcon={<ArrowBackIcon />}
						colorScheme="teal"
						variant="outline"
						onClick={handleBack}
					>
						Back to Grid
					</Button>
				</Box>
				<VStack spacing={2}>
					{/* Content Box */}
					<Flex
						bg={bgColor}
						p={4}
						borderRadius="md"
						borderWidth="1px"
						borderColor={borderColor}
						direction={{ base: "column", md: "row" }}
						align="" // Center align items for better responsiveness
						justify=""
						width={{ base: "100%", md: "90%", lg: "1100px" }} // Responsive width
					>
						{/* Image */}
						<Image
							src={`${result?.thumbnail.path}/portrait_uncanny.jpg`}
							alt={data?.data?.results?.[0]?.title || "No Title"}
							maxW="300px"
							maxH="450px"
							objectFit="cover"
						/>

						<VStack
							spacing={4}
							align="start"
							maxW="600px"
							marginLeft={4}
						>
							<Tag
								size="lg"
								colorScheme="blue"
							>{`Issue #${result?.issueNumber}`}</Tag>
							<Tag size="lg" colorScheme="green">
								{formatDate(
									result?.dates?.find(
										(date: { type: string }) =>
											date.type === "onsaleDate"
									)?.date || new Date()
								)}
							</Tag>
							<Heading
								fontFamily="Bangers"
								letterSpacing="0.05em"
								color="tomato"
								size="lg"
							>
								{result?.series?.name || "Unknown Series"}
							</Heading>
							<Text
								p={4}
								bg={bgColor}
								borderRadius="md"
								borderWidth="1px"
								borderColor={borderColor}
							>
								{solicitationText}
							</Text>
						</VStack>
					</Flex>
				</VStack>
			</Container>
			<Container maxW="1100px" p={4}>
				<Flex
					direction={{ base: "column", md: "row" }}
					align="start"
					justify="space-between"
					gap={8}
				>
					<VStack spacing={4} w="full" align="start">
						<Heading
							size="md"
							fontFamily="Bangers"
							letterSpacing="0.05em"
							color="orange"
						>
							Character Credits:
						</Heading>
						<SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
							{data.results?.character_credits &&
								data.results?.character_credits.map(
									(character: CharacterCredit) => (
										<Box
											key={character.id}
											p={2}
											boxShadow="md"
											borderRadius="md"
										>
											<Text textAlign="start">
												{character.name}
											</Text>
										</Box>
									)
								)}
						</SimpleGrid>
					</VStack>
				</Flex>
			</Container>
		</Suspense>
	);
};

export default MarvelComic;
