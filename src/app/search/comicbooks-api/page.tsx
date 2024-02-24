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
	Button,
	VStack,
} from "@chakra-ui/react";
import { DownloadIcon, LinkIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import NextLink from "next/link";
import type { NextPage } from "next";
import SearchBox from "@/components/SearchBox";
import { useDebouncedCallback } from "use-debounce";
import { SearchQuery } from "@/types/comic.types";
import { useRouter } from "next/navigation";
import { useSearchParameters } from "@/hooks/useSearchParameters";
import { useGetComicBooksApi } from "@/hooks/comicbooks-api/useGetComicBooksAPI";
import { ComicBooksAPI } from "@/types/cbAPI.types";

const CBAPI: NextPage = () => {
	const pageSize = 1;
	const { searchTerm, setSearchTerm, currentPage, setCurrentPage, updateUrl } = useSearchParameters(1, "");

	const [searchQuery, setSearchQuery] = useState<SearchQuery>({
		page: 1,
		query: "",
	});

	const getColorScheme = (serviceName: string): string => {
		const schemes: { [key: string]: string } = {
			DOWNLOADNOW: "blue",
			TERABOX: "green",
			PIXELDRAIN: "orange",
			MEDIAFIRE: "red",
			READONLINE: "purple",
			// Add other services and their corresponding color schemes
		};
		return schemes[serviceName] || "gray"; // Default color scheme if not found
	};

	const desiredButtons = ["DOWNLOADNOW", "MEDIAFIRE", "READONLINE"];

	const router = useRouter();

	const { data, isLoading, isError, error } = useGetComicBooksApi(searchTerm, currentPage, pageSize);

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
				{/* {data && (
					<Box>
						<Text fontSize="1.5em" mb={4} textAlign="center">
							{searchTerm
								? `You have ${data.length} results for "${searchTerm}" in ${Math.ceil(
										data.total / data.limit
								  )} pages`
								: `You have a total of ${data.totalLength} issues from Comic Books API in ${Math.ceil(
										data.total / data.limit
								  )} pages`}
						</Text>
					</Box>
				)} */}
				<SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="100%">
					{data?.map((comic: ComicBooksAPI) => {
						return (
							<>
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
											alt={comic.title || `Comic ${comic.title}`}
											maxW="400px"
											maxH="400px"
											objectFit="contain"
										/>
										<Text fontWeight="bold" fontSize="md" textAlign="center" mt={4}>
											{comic.title}
										</Text>
										{<Text fontSize="sm" color="gray.500" textAlign="left" mt={1} p={2}>
											{comic.description}
										</Text>}
										<VStack spacing={4} align="stretch" mt={'1rem'}>
											{Object.entries(comic.downloadLinks)
												.filter(([key]) => desiredButtons.includes(key))
												.map(([key, value]) => (
													<Button
														as="a"
														href={value}
														target="_blank"
														rel="noopener noreferrer"
														key={key}
														leftIcon={<DownloadIcon />} // Or appropriate icon for each key
														colorScheme={getColorScheme(key)} // Function to determine color scheme based on the key
														_hover={{ transform: "scale(1.05)" }}
														aria-label={`Download from ${key}`}
														w="full" // This will make each button full width inside the VStack
													>
														{key}
													</Button>
												))}
										</VStack>
									</Box>
								</motion.div>
							</>
						);
					})}
				</SimpleGrid>
				<div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
					<Button
						onClick={() => setCurrentPage(1)}
						disabled={currentPage === 1}
						style={{ marginRight: "1rem" }}
					>
						First
					</Button>

					<Button
						onClick={() => setCurrentPage(currentPage - 1)}
						style={{ marginLeft: "1rem", marginRight: "1rem" }}
					>
						Previous
					</Button>

					<Button onClick={() => setCurrentPage(currentPage + 1)} style={{ marginLeft: "1rem" }}>
						Next
					</Button>
				</div>
			</Container>
		</Suspense>
	);
};

export default CBAPI;
