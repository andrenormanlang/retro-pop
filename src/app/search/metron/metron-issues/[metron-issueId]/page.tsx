"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
	Box,
	Image,
	Text,
	VStack,
	Container,
	Button,
	Center,
	Spinner,
	useColorModeValue,
	Heading,
	Flex,
	Alert,
	AlertIcon,
	Badge,
	Grid,
	GridItem,
	Divider,
	Tag,
	HStack,
	Icon,
} from "@chakra-ui/react";
import { ArrowBackIcon, CalendarIcon, InfoIcon, StarIcon } from "@chakra-ui/icons";
import { useQuery } from "@tanstack/react-query";
import { useSearchParameters } from "@/hooks/useSearchParameters";
import { format } from "date-fns";
import { MetronIssueDetail } from "@/types/metron/metron-comic.type";

const MetronIssuePage = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { searchTerm, currentPage } = useSearchParameters();
	const issueId = pathname.split("/").pop();

	// Color mode values
	const bgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.700");
	const textColor = useColorModeValue("gray.800", "white");
	const mutedColor = useColorModeValue("gray.600", "gray.300");
	const accentColor = useColorModeValue("blue.500", "blue.300");
	const badgeBg = useColorModeValue("gray.100", "gray.700");

	const {
		data: issue,
		isLoading,
		error,
	} = useQuery<MetronIssueDetail>({
		queryKey: ["metronIssue", issueId],
		queryFn: async () => {
			const response = await fetch(`/api/metron/metron-issues/${issueId}`);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to fetch issue");
			}
			return response.json();
		},
	});

	const handleBack = () => {
		const page = searchParams.get("page") || "1";
		const query = searchParams.get("query") || "";
		const view = searchParams.get("view") || "recent";
		router.push(`/search/metron/metron-issues?page=${page}&query=${query}&view=${view}`);
	};

	if (isLoading) {
		return (
			<Center height="100vh">
				<Spinner size="xl" />
			</Center>
		);
	}

	if (error) {
		return (
			<Center height="100vh" p={4}>
				<Alert
					status="error"
					variant="subtle"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					textAlign="center"
					height="200px"
				>
					<AlertIcon boxSize="40px" mr={0} />
					<Text mt={4}>{error instanceof Error ? error.message : "Failed to load issue details"}</Text>
					<Button onClick={handleBack} mt={4} colorScheme="blue">
						Back to Issues
					</Button>
				</Alert>
			</Center>
		);
	}

	if (!issue) {
		return (
			<Center height="100vh">
				<VStack spacing={4}>
					<Text>Issue not found</Text>
					<Button onClick={handleBack} colorScheme="blue">
						Back to Issues
					</Button>
				</VStack>
			</Center>
		);
	}

	const formatDateString = (dateString: string) => {
		return format(new Date(dateString), "MMMM d, yyyy");
	};

	const groupCreditsByRole = (credits: MetronIssueDetail["credits"]) => {
		const grouped = new Map<string, string[]>();
		credits.forEach((credit) => {
			credit.role.forEach((role) => {
				const creators = grouped.get(role.name) || [];
				creators.push(credit.creator);
				grouped.set(role.name, creators);
			});
		});
		return grouped;
	};

	const groupedCredits = groupCreditsByRole(issue.credits);

	return (
		<Container maxW="1200px" py={8}>
			<Button leftIcon={<ArrowBackIcon />} onClick={handleBack} mb={6} colorScheme="blue">
				Back to Issues
			</Button>

			<Grid templateColumns={{ base: "1fr", md: "1fr" }} gap={8}>
				<GridItem>
					<Box mb={4} borderRadius="lg" overflow="hidden">
						<Center>
						<Image
							src={issue.image || "/default-image.webp"}
							alt={`${issue.series.name} #${issue.number}`}
							width="500px"
							height="auto"
							objectFit="cover"
							/>
						</Center>
					</Box>

					<Box bg={bgColor} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
						<VStack align="stretch" spacing={6}>
							{/* Title Section */}
							<Box>
								<Heading size="xl" color={textColor} mb={2}>
									{issue.series.name} #{issue.number}
								</Heading>
								{issue.name && issue.name.length > 0 && (
									<Heading size="md" color={mutedColor} fontWeight="normal">
										{issue.name.join(" / ")}
									</Heading>
								)}
							</Box>
								{/* Publisher & Genre Section */}
							<Text fontWeight="bold" color={textColor} mb={2}>
								Publisher Details
							</Text>
							<HStack spacing={1} mb={1}>
								<Badge colorScheme="purple">{issue.publisher.name}</Badge>
								{issue.imprint && <Badge colorScheme="blue">{issue.imprint.name}</Badge>}
							</HStack>
							{issue.series.genres.length > 0 && (
								<>
									<Text fontWeight="bold" fontSize="sm" color={mutedColor} mb={1}>
										Genres:
									</Text>
									<HStack spacing={2} wrap="wrap">
										{issue.series.genres.map((genre) => (
											<Badge key={genre.id} colorScheme="green">
												{genre.name}
											</Badge>
										))}
									</HStack>
								</>
							)}

							<Divider />

							{/* Key Details */}
							<Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
								<Box>
									<HStack spacing={2} mb={2}>
										<Icon as={CalendarIcon} color={accentColor} />
										<Text fontWeight="bold" color={textColor}>
											Release Date:
										</Text>
									</HStack>
									<Text color={mutedColor}>
										{issue.store_date ? formatDateString(issue.store_date) : "Not available"}
									</Text>
								</Box>

								<Box>
									<HStack spacing={2} mb={2}>
										<Icon as={CalendarIcon} color={accentColor} />
										<Text fontWeight="bold" color={textColor}>
											Cover Date:
										</Text>
									</HStack>
									<Text color={mutedColor}>
										{issue.cover_date ? formatDateString(issue.cover_date) : "Not available"}
									</Text>
								</Box>

								<Box>
									<HStack spacing={2} mb={2}>
										<Icon as={InfoIcon} color={accentColor} />
										<Text fontWeight="bold" color={textColor}>
											Series Info:
										</Text>
									</HStack>
									<Text color={mutedColor}>Volume {issue.series.volume}</Text>
									<Text color={mutedColor}>Started {issue.series.year_began}</Text>
								</Box>

								{issue.price && (
									<Box>
										<HStack spacing={2} mb={2}>
											<Icon as={StarIcon} color={accentColor} />
											<Text fontWeight="bold" color={textColor}>
												Price:
											</Text>
										</HStack>
										<Text color={mutedColor}>${issue.price}</Text>
									</Box>
								)}
							</Grid>

							<Divider />

							{/* Characters Section */}
							{issue.characters.length > 0 && (
								<Box>
									<Text fontWeight="bold" color={textColor} mb={4}>
										Featured Characters
									</Text>
									<HStack spacing={2} wrap="wrap">
										{issue.characters.map((character) => (
											<Tag
												key={character.id}
												size="md"
												variant="subtle"
												colorScheme="blue"
												borderRadius="full"
											>
												{character.name}
											</Tag>
										))}
									</HStack>
								</Box>
							)}

							{/* Description */}
							{issue.desc && (
								<Box>
									<Text fontWeight="bold" color={textColor} mb={2}>
										Description
									</Text>
									<Text color={mutedColor}>{issue.desc}</Text>
								</Box>
							)}

							{/* Additional Details */}
							<Box bg={badgeBg} p={4} borderRadius="md">
								<Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
									{issue.upc && (
										<Box>
											<Text fontSize="sm" fontWeight="bold" color={textColor}>
												UPC:
											</Text>
											<Text fontSize="sm" color={mutedColor}>
												{issue.upc}
											</Text>
										</Box>
									)}
									{issue.isbn && (
										<Box>
											<Text fontSize="sm" fontWeight="bold" color={textColor}>
												ISBN:
											</Text>
											<Text fontSize="sm" color={mutedColor}>
												{issue.isbn}
											</Text>
										</Box>
									)}
									{issue.page && (
										<Box>
											<Text fontSize="sm" fontWeight="bold" color={textColor}>
												Page Count:
											</Text>
											<Text fontSize="sm" color={mutedColor}>
												{issue.page} pages
											</Text>
										</Box>
									)}
									{issue.rating && issue.rating.name !== "Unknown" && (
										<Box>
											<Text fontSize="sm" fontWeight="bold" color={textColor}>
												Rating:
											</Text>
											<Text fontSize="sm" color={mutedColor}>
												{issue.rating.name}
											</Text>
										</Box>
									)}
								</Grid>
							</Box>
							<Divider />
							{/* Credits Section */}
							{issue.credits.length > 0 && (
								<Box>
									<Text fontWeight="bold" color={textColor} mb={4}>
										Credits
									</Text>
									<Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
										{Array.from(groupedCredits.entries()).map(([role, creators]) => (
											<Box key={role}>
												<Text fontSize="sm" color={mutedColor} mb={1}>
													{role}:
												</Text>
												{creators.map((creator, idx) => (
													<Text key={idx} color={textColor}>
														{creator}
													</Text>
												))}
											</Box>
										))}
									</Grid>
								</Box>
							)}




						</VStack>
					</Box>
				</GridItem>
			</Grid>
		</Container>
	);
};

export default MetronIssuePage;
