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
	modified: string;
}

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC", // Ensure consistent timezone
	});
};

const fetchReleases = async () => {
	const response = await fetch("/api/metron-issues");
	if (!response.ok) {
		throw new Error("Failed to fetch releases");
	}
	const data = await response.json();

	const today = new Date();
	const newRel: MetronIssue[] = [];
	const upcomingRel: MetronIssue[] = [];

	for (const issue of data) {
		const storeDate = new Date(issue.store_date);
		if (storeDate <= today) {
			newRel.push(issue);
		} else {
			upcomingRel.push(issue);
		}
	}

	return { newReleases: newRel, upcomingReleases: upcomingRel };
};

const MetronReleasesClient = () => {
	const router = useRouter();
	const { data, isLoading, error } = useQuery({
		queryKey: ["releases"],
		queryFn: fetchReleases,
	});

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

	const IssueGrid = ({ issues }: { issues: MetronIssue[] }) => (
		<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={4}>
			{issues.map((issue) => (
				<NextLink href={`/releases/${issue.id}`} passHref key={issue.id}>
					<motion.div whileHover={{ scale: 1.05 }}>
						<Box
							boxShadow="0 4px 8px rgba(0,0,0,0.1)"
							rounded="md"
							overflow="hidden"
							p={4}
							display="flex"
							flexDirection="column"
							height="100%"
							cursor="pointer"
						>
							<Image src={issue.image} alt={issue.series.name} maxH="300px" objectFit="contain" mb={4} />
							<Box flex="1">
								<Text fontWeight="bold" fontSize="lg" mb={2}>
									{issue.series.name} #{issue.number}
								</Text>
								<Text fontSize="sm" color="gray.500" mb={2}>
									Release Date: {formatDate(issue.store_date)}
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

	return (
		<Container maxW="container.xl" py={8}>
			{/* <Heading as="h1" mb={6} textAlign="center" fontFamily="Bangers" letterSpacing="0.05em">
				Comic Releases
			</Heading> */}
			<Tabs isFitted variant="enclosed">
				<TabList mb={4}>
					<Tab fontWeight="bold">New Releases</Tab>
					<Tab fontWeight="bold">Upcoming Releases</Tab>
				</TabList>
				<TabPanels>
					<TabPanel>
						<IssueGrid issues={data?.newReleases || []} />
					</TabPanel>
					<TabPanel>
						<IssueGrid issues={data?.upcomingReleases || []} />
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Container>
	);
};

export default MetronReleasesClient;
