"use client";

import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	Text,
	Image,
	Link,
	VStack,
	HStack,
	useToast,
	Skeleton,
	Badge,
	Divider,
	Heading,
	SimpleGrid,
	Icon,
	Flex,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { FaBook, FaPencilAlt, FaPaintBrush, FaBuilding, FaCalendarAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface Suggestion {
	title: string;
	description: string;
	imageUrl: string;
	link: string;
	year: string;
	type: string;
	publisher: string;
	artist: string;
	writer: string;
	reason: string;
}

export default function ComicSuggestion() {
	const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
	const [loading, setLoading] = useState(true);
	const [imageError, setImageError] = useState(false);
	const [previousTitles, setPreviousTitles] = useState<string[]>([]);
	const toast = useToast();
	const router = useRouter();

	// On first load, fetch a suggestion
	useEffect(() => {
		fetchSuggestion();
	}, []);

	const fetchSuggestion = async () => {
		try {
			setLoading(true);
			setImageError(false);

			// Pass previous titles to avoid repetition
			const encodedPrevious = encodeURIComponent(previousTitles.join("|"));
			const response = await fetch(`/api/comic-suggestion?previous=${encodedPrevious}`);
			const data = await response.json();

			if (data.error) {
				toast({
					title: "Error",
					description: data.error,
					status: "error",
					duration: 5000,
					isClosable: true,
				});
			} else {
				setSuggestion(data.suggestion);
				// Add to previous titles to avoid repetition
				if (data.suggestion.title) {
					setPreviousTitles((prev) => [...prev, data.suggestion.title]);
				}
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to fetch comic suggestion.",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleImageError = () => {
		setImageError(true);
	};

	const goBack = () => {
		router.back();
	};

	return (
		<Box p={4} maxW="800px" mx="auto">
			<Button leftIcon={<ChevronLeftIcon />} onClick={goBack} colorScheme="gray" variant="outline" mb={6}>
				Go Back
			</Button>

			<Heading as="h1" size="xl" mb={6} textAlign="center" color="blue.600">
				AI Comic Book Recommendation
			</Heading>

			{loading ? (
				<Card boxShadow="lg" borderRadius="lg" overflow="hidden">
					<CardBody>
						<SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
							<Skeleton height="400px" borderRadius="md" />
							<VStack align="start" spacing={4}>
								<Skeleton height="40px" width="80%" />
								<Skeleton height="20px" width="40%" />
								<Skeleton height="120px" width="100%" />
								<Skeleton height="80px" width="100%" />
								<Skeleton height="40px" width="60%" />
							</VStack>
						</SimpleGrid>
					</CardBody>
				</Card>
			) : suggestion ? (
				<Card boxShadow="lg" borderRadius="lg" overflow="hidden">
					<CardBody>
						<SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
							<Box>
								<Image
									src={
										imageError
											? "https://via.placeholder.com/300x450?text=Comic+Book+Cover"
											: suggestion.imageUrl
									}
									alt={suggestion.title}
									borderRadius="md"
									onError={handleImageError}
									maxH="500px"
									mx="auto"
									objectFit="contain"
									boxShadow="dark-lg"
								/>
							</Box>

							<VStack align="start" spacing={4}>
								<Heading as="h2" size="lg" color="purple.600">
									{suggestion.title}
								</Heading>

								<Box display="flex" flexWrap="wrap" gap={2} mb={2}>
									<Badge
										colorScheme="blue"
										fontSize={{ base: "sm", md: "md" }}
										py={{ base: 0.5, md: 1 }}
										px={{ base: 1.5, md: 2 }}
										whiteSpace="normal"
										textAlign="center"
										maxW="100%" 
									>
										{suggestion.type}
									</Badge>
								</Box>
								<Box width="100%" p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
									<VStack align="stretch" spacing={2}>
										<HStack>
											<Icon as={FaBuilding} color="gray.500" />
											<Text fontWeight="bold">Publisher:</Text>
											<Text>{suggestion.publisher}</Text>
										</HStack>
										<HStack>
											<Icon as={FaCalendarAlt} color="gray.500" />
											<Text fontWeight="bold">Year:</Text>
											<Text>{suggestion.year}</Text>
										</HStack>
										<HStack>
											<Icon as={FaPaintBrush} color="gray.500" />
											<Text fontWeight="bold">Artist:</Text>
											<Text>{suggestion.artist}</Text>
										</HStack>
										<HStack>
											<Icon as={FaPencilAlt} color="gray.500" />
											<Text fontWeight="bold">Writer:</Text>
											<Text>{suggestion.writer}</Text>
										</HStack>
									</VStack>
								</Box>
								<Divider />
								<VStack align="start" spacing={3} width="100%">
									<Heading as="h3" size="sm" color="blue.600">
										<Icon as={FaBook} mr={2} />
										Description:
									</Heading>
									<Text>{suggestion.description}</Text>

									<Heading as="h3" size="sm" color="blue.600" mt={2}>
										Why is worth reading:
									</Heading>
									<Text>{suggestion.reason}</Text>
								</VStack>
							</VStack>
						</SimpleGrid>
					</CardBody>

					<CardFooter bg="gray.50" borderTop="1px" borderColor="gray.200">
						<Flex width="100%" justify="space-between" align="center">
							<Button onClick={fetchSuggestion} colorScheme="blue" leftIcon={<Icon as={FaBook} />}>
								Get Another Suggestion
							</Button>

							<Link href={suggestion.link} isExternal>
								<Button
									rightIcon={<ExternalLinkIcon />}
									colorScheme="teal"
									variant="solid"
									fontWeight="bold"
									color="white"
									_hover={{ bg: "teal.600" }}
									boxShadow="md"
								>
									Learn More
								</Button>
							</Link>
						</Flex>
					</CardFooter>
				</Card>
			) : (
				<Box textAlign="center" p={8}>
					<Text>No suggestion available. Please try again.</Text>
					<Button onClick={fetchSuggestion} colorScheme="blue" mt={4}>
						Get Comic Suggestion
					</Button>
				</Box>
			)}
		</Box>
	);
}
