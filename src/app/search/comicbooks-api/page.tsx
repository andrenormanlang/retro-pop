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
import { useSearchParameters } from "@/hooks/useSearchParameters";
import MarvelPagination from "@/components/MarvelPagination";
import { useGetComicBooksApi } from "@/hooks/comicbooks-api/useGetComicBooksAPI";
import { ComicBooksAPI } from "@/types/cbAPI.types";

// Function to format the date as "21, Jan, 2024"
const formatDate = (dateString: string) => {
	const options: Intl.DateTimeFormatOptions = {
		day: "numeric",
		month: "short",
		year: "numeric",
	};
	return new Date(dateString).toLocaleDateString(undefined, options);
};

const CBAPI: NextPage = () => {
	const pageSize = 1;
	const maxDescriptionLength = 100;
	const {
		searchTerm,
		setSearchTerm,
		currentPage,
		setCurrentPage,
		updateUrl,
	} = useSearchParameters(1, "");

	const [searchQuery, setSearchQuery] = useState<SearchQuery>({
		page: 1,
		query: "",
	});

	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();

	const { data, isLoading, isError, error } = useGetComicBooksApi(
		searchTerm,
		currentPage,
		pageSize
	);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		setSearchQuery({ ...searchQuery, page });
		updateUrl(searchTerm, page);
	};

	const handleSearchTerm = useDebouncedCallback((term: string) => {
		setSearchTerm(term);
		setCurrentPage(1);
		updateUrl(term, 1);
		setSearchQuery({ ...searchQuery, query: term, page: 1 });
	}, 300);

	useEffect(() => {
		const url = new URL(window.location.href);
		url.searchParams.set("page", currentPage.toString());
		if (searchTerm) {
			url.searchParams.set("query", searchTerm);
		} else {
			url.searchParams.delete("query");
		}
		// Convert URL object to a string
		const urlString = url.toString();
		router.push(urlString, undefined);
	}, [searchTerm, currentPage, router]);


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
										data.length
								  } results for "${searchTerm}" in ${Math.ceil(
										data.number_of_total_results /
											data.limit
								  )} pages`
								: `You have a total of ${
										data.length
								  } issues from Comic Books API in ${Math.ceil(
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
					{data?.map((comic: ComicBooksAPI) => {


						return (
							<NextLink
								href={`/search/comicbooks-api/${comic.title}?page=${currentPage}&query=${searchTerm}`}
								passHref
								key={comic.title}
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
											src={comic.coverPage}
											alt={
												comic.title ||
												`Comic ${comic.title}`
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
											{comic.title}
										</Text>
										<Text
											fontSize="sm"
											color="gray.500"
											textAlign="left"
											mt={2}
											p={4}
										>
											{comic.description}
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

export default CBAPI;
