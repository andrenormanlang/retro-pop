"use client";

import React, { Suspense, useState } from "react";
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
import { CharacterCredit, PersonCredit, SearchQuery } from "@/types/comic.types";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { NextPage } from "next";
import { useGetComicVineIssue } from "@/hooks/comic-vine/useComicVine";
import { useSearchParams } from "next/navigation";
import { useSearchParameters } from "../../../../hooks/useSearchParameters";
import { getCurrentPage } from "@/helpers/ComicVineIssues/getCurrentPage";

const IssuePage: NextPage = () => {
	// const [comic, setComic] = useState<ComicVineIssue | null>(null);
	const router = useRouter();
	const {
		searchTerm,
		currentPage,
	} = useSearchParameters();
	const bgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.700");
	const pathname = usePathname();
	const issueId = pathname.split("/").pop() || "";
	const searchParams = useSearchParams();

	const {
		data: comic,
		isLoading,
		isError,
		error,
	} = useGetComicVineIssue(searchTerm, currentPage, issueId);

	const handleBack = () => {
		// Read the page number and search term from the search parameters


		// Navigate back to the issues page with both the page number and search term
		router.push(`/search/comic-vine?page=${currentPage}&query=${encodeURIComponent(searchTerm)}`);
	};

	console.log('HANDLE BACK', handleBack);

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

	const imageUrl = comic.results?.image?.original_url || "defaultImageUrl";
	const volumeName = comic.results?.volume?.name || "Unknown Volume";
	console.log("imageUrl", imageUrl);
	const coverDate = comic.results?.cover_date
		? formatDate(comic.results.cover_date)
		: "Invalid date";
	const issueNumber = comic.results?.issue_number || "N/A";
	const description =
		comic.results?.description || "No description available.";

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
							borderRadius="md"
							boxSize={{ base: "100%", md: "600px" }} // Adjust the size as you like
							objectFit="contain"
							src={imageUrl}
							alt={`Cover of ${comic.name}`}
							mr={{ md: 1 }}
						/>

						<VStack spacing={4} align="">
							<HStack justifyContent="" mt={2}>
								<Tag
									fontFamily="Bangers"
									letterSpacing="0.05em"
									size="lg"
									colorScheme="blue"
								>{`Issue #${issueNumber}`}</Tag>
								<Tag
									fontFamily="Bangers"
									letterSpacing="0.05em"
									size="lg"
									colorScheme="green"
								>
									{coverDate}
								</Tag>
							</HStack>
							<Heading
								fontFamily="Bangers"
								letterSpacing="0.05em"
								color="tomato"
								textAlign="start"
								size="lg"
							>
								{volumeName}
							</Heading>

							<Box
								bg={bgColor}
								p={4}
								borderRadius="md"
								shadow="md"
								borderWidth="0px"
								borderColor={borderColor}
								maxWidth="600px"
							>
								{description ? (
									<div
										dangerouslySetInnerHTML={{
											__html: comic.results.description,
										}}
									/>
								) : (
									<Text fontSize="md" fontStyle="italic">
										No description available.
									</Text>
								)}
							</Box>
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
							{comic.results?.character_credits &&
								comic.results?.character_credits.map(
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
					<VStack spacing={4} w="full" align="start">
						<Heading
							size="md"
							fontFamily="Bangers"
							letterSpacing="0.05em"
							color="lightblue"
						>
							Person Credits:
						</Heading>
						<SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
							{comic.results?.person_credits &&
								comic.results?.person_credits?.map(
									(person: PersonCredit) => (
										<Box
											key={person.id}
											p={2}
											boxShadow="md"
											borderRadius="md"
										>
											<Text textAlign="start">
												{person.name}
											</Text>
											<Badge colorScheme="blue">
												{person.role}
											</Badge>
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

export default IssuePage;
