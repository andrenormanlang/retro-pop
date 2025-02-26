"use client";

import { useState } from "react";
import { Box, Button, Text, Image, Link, VStack, useToast, Skeleton } from "@chakra-ui/react";

interface Suggestion {
	title: string;
	description: string;
	imageUrl: string;
	link: string;
}

export default function ComicSuggestion() {
	const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
	const [loading, setLoading] = useState(false);
	const [imageError, setImageError] = useState(false);
	const toast = useToast();

	const fetchSuggestion = async () => {
		try {
			setLoading(true);
			setImageError(false);
			const response = await fetch("/api/comic-suggestion");
			const data = await response.json();

			console.log(data);

			if (data.error) {
				toast({
					title: "Error",
					description: data.error,
					status: "error",
					duration: 5000,
					isClosable: true,
				});
			} else {
				setSuggestion(data.suggestion);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to fetch comic suggestion.",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleImageError = () => {
		setImageError(true);
	};

	return (
		<Box p={4} maxW="600px" mx="auto">
			<Button onClick={fetchSuggestion} colorScheme="blue" mb={4} isLoading={loading}>
				Get Comic Suggestion
			</Button>
			{suggestion && (
				<VStack spacing={4} align="start">
					<Text fontSize="2xl" fontWeight="bold">
						{suggestion.title}
					</Text>
					{loading ? (
						<Skeleton height="300px" width="100%" />
					) : (
						<Image
							src={
								imageError
									? "https://via.placeholder.com/300x450?text=Comic+Book+Cover"
									: suggestion.imageUrl
							}
							alt={suggestion.title}
							borderRadius="md"
							onError={handleImageError}
							maxH="450px"
						/>
					)}
					<Text>{suggestion.description}</Text>
					<Link href={suggestion.link} color="teal.500" isExternal>
						Read More
					</Link>
				</VStack>
			)}
		</Box>
	);
}
