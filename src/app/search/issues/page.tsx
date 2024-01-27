'use client';

import { useEffect, useState } from "react";
import {
	SimpleGrid,
	Box,
	Image,
	Text,
	Container,
	Link,
	Spinner,
	Center,
	Flex,
	Badge,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import NextLink from "next/link";
import type { NextPage } from "next";
import { ComicVine } from "@/types/comic.types";
import { htmlToText } from "html-to-text";
import {  usePathname, useRouter } from "next/navigation";
import SearchBox from "@/components/SearchBox";
import ComicsPagination from "@/components/ComicsPagination";
import { useDebouncedCallback } from "use-debounce";



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
	// const [searchParams] = useSearchParams();
	const [comics, setComics] = useState<ComicVine[]>([]);

	const [isLoading, setIsLoading] = useState(false);
	const pageSize = 15;
	const maxDescriptionLength = 100;
	const [totalComics, setTotalComics] = useState<number>(0);

	const getCurrentPage = () => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            return parseInt(searchParams.get('page') || '1', 10);
        }
        return 1;
    };
    const [currentPage, setCurrentPage] = useState<number>(getCurrentPage());
    const [searchTerm, setSearchTerm] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('query') || '';
        }
        return '';
    });

    const updateURL = (page: number, searchTerm?: string) => {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('page', page.toString());
        if (searchTerm !== undefined) {
            searchParams.set('query', searchTerm);
            setSearchTerm(searchTerm); // Update searchTerm state
        }
        window.history.pushState(null, '', '?' + searchParams.toString());
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        updateURL(page, searchTerm);
    };

    const handleSearchTerm = useDebouncedCallback((term: string) => {
        updateURL(1, term);
    }, 300);

	useEffect(() => {
        async function fetchIssues() {
            try {
                setIsLoading(true);
                let apiUrl = `/api/issues?page=${currentPage}&limit=${pageSize}`;

                // Use searchTerm state instead of reading from URL
                if (searchTerm) {
					setIsLoading(true);
					const offset = (currentPage - 1) * pageSize;
                    apiUrl += `&query=${encodeURIComponent(searchTerm)}&limit=${pageSize}&offset=${offset}`;
                }

                const response = await fetch(apiUrl);
                const data = await response.json();
                setComics(data.results);
                setTotalComics(data.number_of_total_results);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setIsLoading(false);
            }
        }

        fetchIssues();
    }, [currentPage, pageSize, searchTerm]);

	// useEffect(() => {
	// 	// Fetch data when URL params change
	// 	async function fetchIssuesFromParams() {
	// 		try {
	// 			setIsLoading(true);
	// 			const response = await fetch(
	// 				`/api/issues?page=${currentPage}&limit=${pageSize}`
	// 			);
	// 			const data = await response.json();
	// 			setComics(data.results);
	// 			setTotalComics(data.total);
	// 			setIsLoading(false);
	// 		} catch (error) {
	// 			console.error("Error fetching data:", error);
	// 			setIsLoading(false);
	// 		}
	// 	}

	// 	fetchDataFromParams();
	// }, [ pathname, currentPage]);

	if (isLoading) {
		return (
			<Center h="100vh">
				<Spinner size="xl" />
			</Center>
		);
	}

	return (
		<Container maxW="container.xl" centerContent p={4}>
			<SearchBox onSearch={handleSearchTerm} />
			<SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="100%">
				{comics.map((comic) => {
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
							href={`/search/issues/${comic.id}`}
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
										alt={comic.name || `Comic ${comic.id}`}
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
					totalPages={Math.ceil(totalComics / pageSize)}
					onPageChange={handlePageChange}
				/>
			</div>
		</Container>
	);
};

export default Issues;
