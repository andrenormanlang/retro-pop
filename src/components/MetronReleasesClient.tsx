"use client";

import { useQuery } from "@tanstack/react-query";
import {
	SimpleGrid,
	Box,
	Image,
	Text,
	Container,
	Center,
	Spinner,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Heading,
	useColorModeValue,
	VStack,
	Badge,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParameters } from "@/hooks/useSearchParameters";
import { useDebouncedCallback } from "use-debounce";
import SearchBox from "@/components/SearchBox";
import MarvelPagination from "@/components/MarvelPagination";
import { useState } from "react";
import { format } from "date-fns";

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
}

interface MetronResponse {
	results: MetronIssue[];
	count: number;
	next: string | null;
	previous: string | null;
	currentPage: number;
	pageSize: number;
	totalPages: number;
}

interface FetchReleasesParams {
	page: number;
	pageSize: number;
	storeDateRangeAfter?: string;
	storeDateRangeBefore?: string;
	publisherName?: string;
	seriesName?: string;
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

const fetchReleases = async ({
	page,
	pageSize,
	storeDateRangeAfter,
	storeDateRangeBefore,
	publisherName,
	seriesName,
}: FetchReleasesParams) => {
	const params = new URLSearchParams({
		page: page.toString(),
		pageSize: pageSize.toString(),
	});

	if (storeDateRangeAfter) {
		params.append("store_date_range_after", storeDateRangeAfter);
	}
	if (storeDateRangeBefore) {
		params.append("store_date_range_before", storeDateRangeBefore);
	}
	if (publisherName) {
		params.append("publisher_name", publisherName);
	}
	if (seriesName) {
		params.append("series_name", seriesName);
	}

	const response = await fetch(`/api/metron-issues?${params}`);
	if (!response.ok) {
		throw new Error("Failed to fetch releases");
	}
	const data: MetronResponse = await response.json();
	return data;
};

const MetronReleasesClient = () => {
	const router = useRouter();
	const { searchTerm, setSearchTerm } = useSearchParameters(1, "");
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 20;
	const [publisherName, setPublisherName] = useState<string>();
	const [seriesName, setSeriesName] = useState<string>();

	// Color mode values
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.800", "white");
	const mutedColor = useColorModeValue("gray.600", "gray.300");
	const borderColor = useColorModeValue("gray.200", "gray.700");

	const { data, isLoading, error } = useQuery<MetronResponse>({
		queryKey: ["releases", currentPage, pageSize, publisherName, seriesName],
		queryFn: () =>
			fetchReleases({
				page: currentPage,
				pageSize,
				publisherName,
				seriesName,
			}),
	});

	const handleSearchTerm = useDebouncedCallback((value: string) => {
		setSearchTerm(value);
		setCurrentPage(1);
	}, 500);

	const handlePageChange = (page: number) => {
		if (!data?.count) return;
		// Calculate total pages
		const totalPages = Math.ceil(data.count / pageSize);
		// Ensure page is a valid number and within bounds
		const validPage = Math.max(1, Math.min(page, totalPages));
		setCurrentPage(validPage);
		window.scrollTo(0, 0); // Scroll to top when changing pages
	};

	// Calculate total pages here for the pagination component
	const totalPages = data?.count ? Math.ceil(data.count / pageSize) : 1;

	const filterAndSortIssues = (issues: MetronIssue[]) => {
		if (!issues) return { recentReleases: [], upcomingReleases: [] };

		const filteredIssues = searchTerm
			? issues.filter(
					(issue) =>
						issue.series.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
						issue.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
						issue.issue.toLowerCase().includes(searchTerm.toLowerCase())
			  )
			: issues;

		const today = new Date();
		const sortedIssues = [...filteredIssues].sort(
			(a, b) => new Date(a.store_date).getTime() - new Date(b.store_date).getTime()
		);

		return {
			recentReleases: sortedIssues.filter((issue) => new Date(issue.store_date) <= today),
			upcomingReleases: sortedIssues.filter((issue) => new Date(issue.store_date) > today),
		};
	};

	const IssueGrid = ({ issues }: { issues: MetronIssue[] }) => (
		<SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
			{issues.map((issue) => (
				<NextLink key={issue.id} href={`/releases/${issue.id}`} passHref>
					<motion.div
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						style={{
							textDecoration: "none",
							cursor: "pointer",
							width: "100%",
						}}
					>
						<Box
							borderWidth="1px"
							borderRadius="lg"
							overflow="hidden"
							bg={cardBg}
							height="520px" // Increased height to accommodate 3 lines
							borderColor={borderColor}
							role="group"
							position="relative"
							_hover={{
								boxShadow: "lg",
								borderColor: "blue.400",
							}}
							transition="all 0.2s"
						>
							{/* Date Badge */}
							<Badge
								position="absolute"
								top="4"
								left="4"
								zIndex="1"
								bg="blackAlpha.800"
								color="purple.400"
								px="3"
								py="1"
								borderRadius="full"
								fontSize="sm"
							>
								{format(new Date(issue.store_date), "MMM d, yyyy")}
							</Badge>

							{/* Image Container */}
							<Box height="350px" overflow="hidden">
								<Image
									src={issue.image || "/default-image.webp"}
									alt={issue.issue}
									objectFit="cover"
									width="100%"
									height="100%"
									fallback={
										<Center height="100%">
											<Spinner />
										</Center>
									}
								/>
							</Box>

							{/* Content Container - Increased height */}
							<VStack p={4} align="center" spacing={2} height="170px" justify="center">
								<Heading
									size="md"
									color={textColor}
									noOfLines={3} // Allow up to 3 lines
									textAlign="center"
									lineHeight="1.2"
									minHeight="4.8em" // Ensure space for 3 lines + some padding
									display="-webkit-box"
									style={{
										WebkitLineClamp: 3,
										WebkitBoxOrient: "vertical",
										overflow: "hidden",
									}}
								>
									{issue.series.name}
								</Heading>
								<Text fontWeight="bold" color={textColor} fontSize="md">
									Issue #{issue.number}
								</Text>
								<Text fontSize="sm" color={mutedColor}>
									Series started: {issue.series.year_began}
								</Text>
							</VStack>
						</Box>
					</motion.div>
				</NextLink>
			))}
		</SimpleGrid>
	);

	if (isLoading) {
		return (
			<Center height="100vh">
				<Spinner size="xl" />
			</Center>
		);
	}

	if (error) {
		return (
			<Center height="100vh">
				<Text>Error loading releases</Text>
			</Center>
		);
	}

	const { recentReleases, upcomingReleases } = data?.results
		? filterAndSortIssues(data.results)
		: { recentReleases: [], upcomingReleases: [] };

	return (
		<Container maxW="1200px" py={8}>
			<SearchBox onSearch={handleSearchTerm} />

			{data && (
				<Box mb={6}>
					<Text fontSize="2xl" textAlign="center" color={textColor} fontWeight="bold">
						{searchTerm
							? `Found ${recentReleases.length + upcomingReleases.length} results for "${searchTerm}"`
							: `Total of ${data.count} comic releases`}
					</Text>
				</Box>
			)}

			<Tabs isFitted variant="enclosed" colorScheme="blue">
				<TabList mb="1em">
					<Tab _selected={{ color: "blue.500", borderColor: "blue.500" }}>
						Recently Released ({recentReleases.length})
					</Tab>
					<Tab _selected={{ color: "blue.500", borderColor: "blue.500" }}>
						Upcoming Releases ({upcomingReleases.length})
					</Tab>
				</TabList>

				<TabPanels>
					<TabPanel>
						{recentReleases.length === 0 ? (
							<Center p={8}>
								<Text color={textColor}>No recent releases found</Text>
							</Center>
						) : (
							<IssueGrid issues={recentReleases} />
						)}
					</TabPanel>
					<TabPanel>
						{upcomingReleases.length === 0 ? (
							<Center p={8}>
								<Text color={textColor}>No upcoming releases found</Text>
							</Center>
						) : (
							<IssueGrid issues={upcomingReleases} />
						)}
					</TabPanel>
				</TabPanels>
			</Tabs>

			{data && data.count > pageSize && (
				<Box mt={8}>
					<MarvelPagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={handlePageChange}
					/>
				</Box>
			)}
		</Container>
	);
};

export default MetronReleasesClient;
