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
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useQuery } from "@tanstack/react-query";
import { useSearchParameters } from "@/hooks/useSearchParameters";

interface MetronIssueDetail {
	id: number;
	series: {
		name: string;
		volume: number;
		year_began: number;
	};
	number: string;
	cover_date: string;
	store_date: string;
	desc: string;
	image: string;
	price: string;
}

const MetronIssuePage = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { searchTerm, currentPage } = useSearchParameters();
	const issueId = pathname.split("/").pop();

	const bgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.700");
	const textColor = useColorModeValue("gray.800", "white");

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

	return (
		<Container maxW="1200px" py={8}>
			<Button leftIcon={<ArrowBackIcon />} onClick={handleBack} mb={6} colorScheme="blue">
				Back to Issues
			</Button>

			<Flex
				bg={bgColor}
				p={6}
				borderRadius="lg"
				borderWidth="1px"
				borderColor={borderColor}
				direction={{ base: "column", md: "row" }}
				align="flex-start"
				justify="space-between"
				gap={6}
			>
				<Box flex="1" maxW={{ base: "100%", md: "300px" }}>
					<Image
						src={issue.image || "/default-image.webp"}
						alt={`${issue.series.name} #${issue.number}`}
						borderRadius="md"
						width="100%"
						height="auto"
						objectFit="cover"
					/>
				</Box>

				<VStack flex="2" align="stretch" spacing={4}>
					<Heading size="lg" color={textColor}>
						{issue.series.name} #{issue.number}
					</Heading>

					<Box>
						<Text fontWeight="bold" color={textColor}>
							Release Date:
						</Text>
						<Text>
							{issue.store_date ? new Date(issue.store_date).toLocaleDateString() : "Not available"}
						</Text>
					</Box>

					<Box>
						<Text fontWeight="bold" color={textColor}>
							Cover Date:
						</Text>
						<Text>
							{issue.cover_date ? new Date(issue.cover_date).toLocaleDateString() : "Not available"}
						</Text>
					</Box>

					<Box>
						<Text fontWeight="bold" color={textColor}>
							Series Information:
						</Text>
						<Text>Volume: {issue.series.volume}</Text>
						<Text>Started: {issue.series.year_began}</Text>
					</Box>

					{issue.price && (
						<Box>
							<Text fontWeight="bold" color={textColor}>
								Price:
							</Text>
							<Text>{issue.price}</Text>
						</Box>
					)}

					{issue.desc && (
						<Box>
							<Text fontWeight="bold" color={textColor}>
								Description:
							</Text>
							<Text>{issue.desc}</Text>
						</Box>
					)}
				</VStack>
			</Flex>
		</Container>
	);
};

export default MetronIssuePage;
