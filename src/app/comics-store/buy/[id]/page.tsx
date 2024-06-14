"use client"; // Add this at the top of your file

import { usePathname, useRouter } from "next/navigation"; // Use next/navigation
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import {
	Box,
	Button,
	Image,
	Text,
	Container,
	Center,
	Spinner,
	Heading,
	Badge,
	VStack,
	HStack,
	SimpleGrid,
	Flex,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Comic } from "@/types/comics-store/comic-detail.type";

const ComicDetail = () => {
	const pathname = usePathname();
	const router = useRouter();
	const pathParts = pathname.split("/");
	const id = pathParts.pop(); // Extracts the last segment of the path as the id

	const [comic, setComic] = useState<Comic | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (id) {
			const fetchComic = async () => {
				try {
					const { data, error } = await supabase
						.from("comics-sell")
						.select(
							`
              id,
              user_id,
              created_at,
              title,
              image,
              release_date,
              pages,
              publisher,
              main_artist,
              main_writer,
              description,
              price,
              currency
            `
						)
						.eq("id", id as string)
						.single();

					if (error) throw error;

					setComic(data as Comic);
				} catch (error: any) {
					setError(error.message);
				} finally {
					setLoading(false);
				}
			};

			fetchComic();
		}
	}, [id]);

	if (loading) {
		return (
			<Center h="100vh">
				<Spinner size="xl" />
			</Center>
		);
	}

	if (error) {
		return (
			<Center h="100vh">
				<Text>Error: {error}</Text>
			</Center>
		);
	}

	if (!comic) {
		return (
			<Center h="100vh">
				<Text>Comic not found</Text>
			</Center>
		);
	}

	const formatDate = (dateString: string) => {
		const options: Intl.DateTimeFormatOptions = {
			day: "numeric",
			month: "short",
			year: "numeric",
		};
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	return (
		<>
			<Container maxW="container.xl" p={4}>
				<Box mb={4}>
					<Button
						leftIcon={<ArrowBackIcon />}
						colorScheme="teal"
						variant="outline"
						onClick={() => router.back()}
					>
						Back to Grid
					</Button>
				</Box>
				<Flex
					direction={{ base: "column", md: "row" }}
					bg="gray.800"
					p={6}
					borderRadius="md"
					borderWidth="1px"
					borderColor="gray.700"
				>
					<Box flex="1" mb={{ base: 4, md: 0 }}>
						<Image
							borderRadius="md"
							objectFit="contain"
							src={comic.image || "/path/to/default-image.jpg"}
							alt={`Cover of ${comic.title}`}
							width="100%"
						/>
					</Box>
					<VStack flex="2" align="start" spacing={4} p={4}>
						<Heading as="h1" size="xl" color="tomato">
							{comic.title}
						</Heading>
						<HStack spacing={4}>
							{/* <Badge colorScheme="blue" fontSize="1.2em">{`Issue #${comic.id}`}</Badge> */}
							<Badge colorScheme="green" fontSize="1.2em">
								{formatDate(comic.release_date)}
							</Badge>
						</HStack>
						<HStack spacing={4}>
							<Text fontSize="md" color="gray.400">
								<strong>Publisher:</strong> {comic.publisher}
							</Text>
							<Text fontSize="md" color="gray.400">
								<strong>Price:</strong> {comic.price} {comic.currency}
							</Text>
						</HStack>
						<HStack spacing={4}>
							<Text fontSize="md" color="gray.400">
								<strong>Pages:</strong> {comic.pages}
							</Text>
						</HStack>
						<Box>
							<Heading as="h2" size="md" color="orange" mb={2}>
								Credits
							</Heading>
							<SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
								<Box>
									<Text color="white">
										<strong>Main Artist:</strong> {comic.main_artist}
									</Text>
								</Box>
								<Box>
									<Text color="white">
										<strong>Main Writer:</strong> {comic.main_writer}
									</Text>
								</Box>
							</SimpleGrid>
						</Box>
					</VStack>
				</Flex>
			</Container>
			<Container maxW="container.xl" p={4}>
				<Flex
					direction={{ base: "column", md: "row" }}
					bg="gray.800"
					p={6}
					borderRadius="md"
					borderWidth="1px"
					borderColor="gray.700"
				>
					<Text fontSize="lg" color="white" textAlign="start">
						{comic.description || "No description available."}
					</Text>
				</Flex>
			</Container>
		</>
	);
};

export default ComicDetail;
