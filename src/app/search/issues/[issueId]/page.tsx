"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { ComicVineIssue } from "@/types/comic.types";
import { htmlToText } from "html-to-text";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { NextPage } from "next";

const IssuePage: NextPage = () => {
	const [comic, setComic] = useState<ComicVineIssue | null>(null);
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const bgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.700");

	useEffect(() => {
		// Function to extract issue ID from URL
		const getIssueIdFromURL = () => {
			if (typeof window !== "undefined") {
				const url = new URL(window.location.href);
				return url.pathname.split("/").pop();
			}
			return null;
		};

		async function fetchData(issueId: string) {
			try {
				setIsLoading(true);
				const response = await fetch(`/api/issues/${issueId}`);
				const data = await response.json();
				setComic(data.results);
				setIsLoading(false);
			} catch (error) {
				console.error("Error fetching issue data:", error);
				setIsLoading(false);
			}
		}

		const issueId = getIssueIdFromURL();
		if (issueId) {
			fetchData(issueId);
		}
	}, []);

	const handleBack = () => {
		// Assuming the grid page is the homepage, you can replace '/' with the path you need
		router.push("/search/issues");
	};

	const formatDate = (dateString: string) => {
		const options: Intl.DateTimeFormatOptions = {
			day: "numeric",
			month: "short",
			year: "numeric",
		};
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	if (!comic)
		return (
			<Center h="100vh">
				<Spinner size="xl" />
			</Center>
		);

	return (
		<>
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
							src={comic.image.original_url}
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
								>{`Issue #${comic.issue_number}`}</Tag>
								<Tag
									fontFamily="Bangers"
									letterSpacing="0.05em"
									size="lg"
									colorScheme="green"
								>
									{formatDate(comic.cover_date)}
								</Tag>
							</HStack>
							<Heading
								fontFamily="Bangers"
								letterSpacing="0.05em"
								color="tomato"
								textAlign="start"
								size="lg"
							>
								{comic.volume.name}
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
								{comic.description ? (
									<div
										dangerouslySetInnerHTML={{
											__html: comic.description,
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
							{comic.character_credits &&
								comic.character_credits.map((character) => (
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
								))}
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
							{comic.person_credits &&
								comic.person_credits.map((person) => (
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
								))}
						</SimpleGrid>
					</VStack>
				</Flex>
			</Container>
		</>
	);
};

export default IssuePage;
