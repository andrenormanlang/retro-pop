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
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParameters } from "@/hooks/useSearchParameters";
import { useDebouncedCallback } from "use-debounce";
import SearchBox from "@/components/SearchBox";
import MarvelPagination from "@/components/MarvelPagination";
import { useState } from "react";

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
						whileHover={{ scale: 1.05 }}
						style={{
							textDecoration: "none",
							cursor: "pointer",
						}}
					>
						<Box borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white" height="100%">
							<Image
								src={issue.image || "/default-image.webp"}
								alt={issue.issue}
								width="100%"
								height="auto"
								fallback={
									<Center height="300px">
										<Spinner />
									</Center>
								}
							/>
							<Box p={4}>
								<Text fontWeight="bold" fontSize="sm" noOfLines={2}>
									{issue.issue}
								</Text>
								<Text fontSize="sm" color="gray.500" mt={2}>
									Store Date: {formatDate(issue.store_date)}
								</Text>
								<Text fontSize="sm" color="gray.500" mb={2}>
									Series started: {issue.series.year_began}
								</Text>
							</Box>
						</Box>
					</motion.div>
				</NextLink>
			))}
		</SimpleGrid>
	);

	const { recentReleases, upcomingReleases } = data?.results
		? filterAndSortIssues(data.results)
		: { recentReleases: [], upcomingReleases: [] };

	return (
		<Container maxW="1200px" py={8}>
			<SearchBox onSearch={handleSearchTerm} />

			{data && (
				<Box mb={4}>
					<Text fontSize="1.5em" textAlign="center">
						{searchTerm
							? `Found ${recentReleases.length + upcomingReleases.length} results for "${searchTerm}"`
							: `Total of ${data.count} comic releases`}
					</Text>
				</Box>
			)}

			<Tabs isFitted variant="enclosed">
				<TabList mb="1em">
					<Tab>Recently Released ({recentReleases.length})</Tab>
					<Tab>Upcoming Releases ({upcomingReleases.length})</Tab>
				</TabList>

				<TabPanels>
					<TabPanel>
						{recentReleases.length === 0 ? (
							<Center p={8}>
								<Text>No recent releases found</Text>
							</Center>
						) : (
							<IssueGrid issues={recentReleases} />
						)}
					</TabPanel>
					<TabPanel>
						{upcomingReleases.length === 0 ? (
							<Center p={8}>
								<Text>No upcoming releases found</Text>
							</Center>
						) : (
							<IssueGrid issues={upcomingReleases} />
						)}
					</TabPanel>
				</TabPanels>
			</Tabs>

			{data && data.count > pageSize && (
				<MarvelPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
			)}
		</Container>
	);
};

export default MetronReleasesClient;
