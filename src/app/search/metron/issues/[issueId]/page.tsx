"use client";

import { useQuery } from "@tanstack/react-query";
import { Container, Box, Image, Text, VStack, Heading, SimpleGrid, Spinner, Center, Button } from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import NextLink from "next/link";

interface MetronIssue {
	id: number;
	series: {
		name: string;
		volume: number;
		year_began: number;
	};
	number: string;
	issue: string;
	cover_date: string;
	store_date: string;
	image: string;
	cover_hash: string;
	desc: string;
	price: string;
	page_count: number;
}

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	});
};

const fetchIssue = async (issueId: string) => {
	const response = await fetch(`/api/metron-issues/${issueId}`);
	if (!response.ok) {
		throw new Error("Failed to fetch issue details");
	}
	return response.json();
};

export default function MetronIssuePage() {
	const params = useParams();
	const router = useRouter();
	const issueId = params.issueId as string;

	const {
		data: issue,
		isLoading,
		error,
	} = useQuery<MetronIssue>({
		queryKey: ["metron-issue", issueId],
		queryFn: () => fetchIssue(issueId),
	});

	if (isLoading) {
		return (
			<Center height="100vh">
				<Spinner size="xl" />
			</Center>
		);
	}

	if (error || !issue) {
		return (
			<Center height="100vh" flexDirection="column" gap={4}>
				<Text>Error loading issue details</Text>
				<Button as={NextLink} href="/search/metron/issues">
					Back to Issues
				</Button>
			</Center>
		);
	}

	return (
		<Container maxW="1200px" py={8}>
			<Button mb={4} onClick={() => router.back()}>
				← Back
			</Button>

			<SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
				<Box>
					<Image
						src={issue.image || "/default-image.webp"}
						alt={issue.issue}
						width="100%"
						height="auto"
						borderRadius="lg"
						fallback={
							<Center height="500px">
								<Spinner />
							</Center>
						}
					/>
				</Box>

				<VStack align="start" spacing={4}>
					<Heading size="lg">{issue.issue}</Heading>
					<Text fontSize="xl" color="gray.600">
						Series: {issue.series.name} Vol. {issue.series.volume}
					</Text>
					<Text>Issue Number: {issue.number}</Text>
					<Text>Store Date: {formatDate(issue.store_date)}</Text>
					<Text>Cover Date: {formatDate(issue.cover_date)}</Text>
					<Text>Series Started: {issue.series.year_began}</Text>
					{issue.page_count && <Text>Page Count: {issue.page_count}</Text>}
					{issue.price && <Text>Price: ${issue.price}</Text>}
					{issue.desc && (
						<Box>
							<Text fontWeight="bold">Description:</Text>
							<Text>{issue.desc}</Text>
						</Box>
					)}
				</VStack>
			</SimpleGrid>
		</Container>
	);
}
