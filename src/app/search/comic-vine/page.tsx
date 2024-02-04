"use client";

import { useState, useEffect, Suspense } from "react";
import {
	SimpleGrid,
	Box,
	Image,
	Text,
	Container,
	Center,
	Spinner,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import NextLink from "next/link";
import type { NextPage } from "next";
import SearchBox from "@/components/SearchBox";
import ComicsPagination from "@/components/ComicsPagination";
import { useDebouncedCallback } from "use-debounce";
import { htmlToText } from "html-to-text";
import { useGetComicVineIssues } from "@/hooks/comic-vine/useComicVine";
import { getCurrentPage } from "@/helpers/ComicVineIssues/getCurrentPage";
import { ComicVine, SearchQuery } from "@/types/comic.types";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSearchParameters } from "@/hooks/comic-vine/useSearchParameters";

// Function to format the date as "21, Jan, 2024"
const formatDate = (dateString: string) => {
	const options: Intl.DateTimeFormatOptions = {
		day: "numeric",
		month: "short",
		year: "numeric",
	};
	return new Date(dateString).toLocaleDateString(undefined, options);
};

const Issues: NextPage = () => {
	const pageSize = 15;
	const maxDescriptionLength = 100;
	const {
		searchTerm,
		setSearchTerm,
		currentPage,
		setCurrentPage,
		updateUrl
	  } = useSearchParameters(getCurrentPage(), "");
	// const [currentPage, setCurrentPage] = useState<number>(getCurrentPage());
	// const [searchTerm, setSearchTerm] = useState<string>("");
	const [searchQuery, setSearchQuery] = useState<SearchQuery>({
		page: getCurrentPage(),
		query: "",
	});

	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();


	const { data, isLoading, isError, error } = useGetComicVineIssues(
		searchTerm,
		currentPage,
		pageSize
	);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		setSearchQuery({ ...searchQuery, page });
	};

	const handleSearchTerm = useDebouncedCallback((term: string) => {
		setSearchTerm(term);
		setCurrentPage(1);
		setSearchQuery({ ...searchQuery, query: term, page: 1 });
	}, 300);

	useEffect(() => {
		const params = new URLSearchParams(searchParams);
		Object.keys(searchQuery).forEach((key) => {
			if (searchQuery[key]) {
				params.set(key, searchQuery[key].toString());
			} else {
				params.delete(key);
			}
		});
		const queryString = params.toString();
		const updatedPath = queryString
			? `${pathname}?${queryString}`
			: pathname;
		(router.push as any)(updatedPath, { shallow: true });
	}, [searchQuery, searchParams, pathname, router]);

	const validData = data?.results.slice(0);

	if (isLoading) {
		return (
			<Center h="100vh">
				<Spinner size="xl" />
			</Center>
		);
	}

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

	console.log("currentPage", currentPage);
	console.log("data", data);

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
			<Container maxW="container.xl" centerContent p={4}>
				<SearchBox onSearch={handleSearchTerm} />
				{data && (
					<Box>
						<Text fontSize="1.5em" mb={4} textAlign="center">
							{searchTerm
								? `You have ${
										data.number_of_total_results
								  } results for "${searchTerm}" in ${Math.ceil(
										data.number_of_total_results /
											data.limit
								  )} pages`
								: `You have a total of ${
										data.number_of_total_results
								  } issues from Comic Vine in ${Math.ceil(
										data.number_of_total_results /
											data.limit
							)} pages`}
						</Text>
					</Box>
				)}
				<SimpleGrid
					columns={{ base: 1, md: 3 }}
					spacing={10}
					width="100%"
				>
					{validData.map((comic: ComicVine) => {
						const plainDescription = htmlToText(
							comic.description || "",
							{
								wordwrap: 130,
							}
						);
						const truncatedDescription =
							plainDescription.length > maxDescriptionLength
								? plainDescription.substring(
										0,
										maxDescriptionLength
								  ) + "..."
								: plainDescription;

						return (
							<NextLink
								href={{
									pathname: `/search/comic-vine/${comic.id}`,
									query: { page: currentPage },
								}}
								passHref
								key={comic.id}
							>
								<motion.div
									whileHover={{ scale: 1.05 }}
									style={{
										textDecoration: "none",
										cursor: "pointer",
									}}
								>
									<Box
										boxShadow="0 4px 8px rgba(0,0,0,0.1)"
										rounded="md"
										overflow="hidden"
										p={4}
										display="flex"
										flexDirection="column"
										alignItems="center"
										justifyContent="space-between" // Distribute space between elements
										minH="630px" // Set a minimum height for the card
										position="relative"
									>
										<Image
											src={comic.image.original_url}
											alt={
												comic.name ||
												`Comic ${comic.id}`
											}
											maxW="400px"
											maxH="400px"
											objectFit="contain"
										/>
										<Text
											fontWeight="bold"
											fontSize="lg"
											noOfLines={1}
											textAlign="center"
											mt={4}
										>
											{comic.volume.name} #
											{comic.issue_number}
										</Text>
										<Text
											fontSize="sm"
											color="gray.500"
											textAlign="center"
										>
											Release Date:{" "}
											{formatDate(comic.store_date)}
										</Text>
										<Text
											fontSize="sm"
											color="gray.500"
											textAlign="left"
											mt={2}
											p={4}
										>
											{truncatedDescription}
										</Text>
									</Box>
								</motion.div>
							</NextLink>
						);
					})}
				</SimpleGrid>
				<div style={{ marginTop: "2rem" }}>
					<ComicsPagination
						currentPage={currentPage}
						totalPages={Math.ceil(
							data.number_of_total_results / data.limit
						)}
						onPageChange={handlePageChange}
					/>
				</div>
			</Container>
		</Suspense>
	);
};

export default Issues;
