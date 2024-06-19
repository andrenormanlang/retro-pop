"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "../../../contexts/UserContext";
import {
	SimpleGrid,
	Box,
	Image,
	Text,
	Container,
	Center,
	Spinner,
	Alert,
	AlertIcon,
	Heading,
	IconButton,
	useToast,
	Button,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
	Badge,
} from "@chakra-ui/react";
import { useComicBuy } from "@/hooks/comics-sale/useComicBuy";
import { motion } from "framer-motion";
import NextLink from "next/link";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Comic } from "@/types/comics-store/comic-detail.type";
import { NextPage } from "next";

const formatDate = (dateString: string) => {
	const options: Intl.DateTimeFormatOptions = {
		day: "numeric",
		month: "short",
		year: "numeric",
	};
	return new Date(dateString).toLocaleDateString(undefined, options);
};

const ComicsBuy: NextPage = () => {
	const { data, setData, loading, error } = useComicBuy();
	const toast = useToast();
	const [isAdmin, setIsAdmin] = useState(false);
	const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const cancelRef = useRef(null);
	const user = useUser();
	const router = useRouter();

	const onClose = () => setIsOpen(false);

	useEffect(() => {
		const fetchUserProfile = async () => {
			if (user) {
				const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();

				if (error) {
					console.error("Error fetching profile:", error.message);
					return;
				}

				if (data && data.is_admin) {
					setIsAdmin(true);
				}
			}
		};

		fetchUserProfile();
	}, [user]);

	const handleDelete = async () => {
		if (selectedComic) {
			try {
				const { error } = await supabase.from("comics-sell").delete().eq("id", selectedComic.id);

				if (error) throw error;

				toast({
					title: "Comic deleted.",
					description: "The comic has been successfully deleted.",
					status: "success",
					duration: 5000,
					isClosable: true,
				});

				// Refresh the list after deletion
				const updatedData = data ? data.filter((comic: Comic) => comic.id !== selectedComic.id) : [];
				setData(updatedData);
			} catch (error) {
				toast({
					title: "Error deleting comic.",
					description: "There was an error deleting the comic.",
					status: "error",
					duration: 5000,
					isClosable: true,
				});
			} finally {
				setIsOpen(false);
			}
		}
	};

	const openDeleteDialog = (comic: Comic) => {
		setSelectedComic(comic);
		setIsOpen(true);
	};

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
				<Alert status="error">
					<AlertIcon />
					{error}
				</Alert>
			</Center>
		);
	}

	const defaultImageUrl = "/path/to/default-image.jpg";

	return (
		<Container maxW="container.xl" centerContent p={4}>
			<Heading as="h1" size="xl" mb={6}>
				Buy Comic Books
			</Heading>
			<SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="100%">
				{data?.map((comic: Comic) => (
					<Box
						key={comic.id}
						as={motion.div}
						whileHover={{ scale: 1.05 }}
						boxShadow="0 4px 8px rgba(0,0,0,0.1)"
						rounded="md"
						overflow="hidden"
						p={4}
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="space-between"
						minH="400px"
						position="relative"
						cursor="pointer"
						onClick={() => router.push(`/comics-store/buy/${comic.id}`)}
					>
						<Image
							src={comic.image || defaultImageUrl}
							alt={comic.title}
							maxW="500px"
							maxH="500px"
							objectFit="contain"
							onError={(e) => {
								e.currentTarget.src = defaultImageUrl;
							}}
						/>
						<Box
							position="absolute"
							bottom="0"
							left="0"
							width="100%"
							p={3}
							bgColor="black"
							color="white"
						>
							<Text fontWeight="bold" fontSize="lg" noOfLines={1} textAlign="center">
								{comic.title}
							</Text>
							<Badge m={1} colorScheme="green">
								Release Date: {formatDate(comic.release_date)}
							</Badge>
							<Badge m={1} colorScheme="purple">
								Publisher: {comic.publisher}
							</Badge>
							<Badge m={1} colorScheme="red">
								Price: {comic.price} {comic.currency}
							</Badge>
							<Badge m={1} colorScheme="blue">
								Genre: {comic.genre}
							</Badge>
						</Box>
						{isAdmin && (
							<Box position="absolute" top={2} right={2} display="flex" gap={1}>
								<NextLink href={`/comics-store/edit/${comic.id}`} passHref>
									<IconButton
										aria-label="Edit Comic"
										icon={<EditIcon />}
										fontWeight={"900"}
										color={"white"}
										backgroundColor={"blue.500"}
										size="sm"
										onClick={(e) => e.stopPropagation()}
									/>
								</NextLink>
								<IconButton
									aria-label="Delete Comic"
									icon={<DeleteIcon />}
									fontWeight={"900"}
									color={"white"}
									backgroundColor={"red.500"}
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										openDeleteDialog(comic);
									}}
								/>
							</Box>
						)}
					</Box>
				))}
			</SimpleGrid>

			<AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Delete Comic
						</AlertDialogHeader>

						<AlertDialogBody>
							Are you sure you want to delete the comic titled {selectedComic?.title}?
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={onClose}>
								Cancel
							</Button>
							<Button colorScheme="red" onClick={handleDelete} ml={3}>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Container>
	);
};

export default ComicsBuy;
