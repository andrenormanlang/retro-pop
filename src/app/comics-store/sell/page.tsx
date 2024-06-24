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
import { DeleteIcon, EditIcon, StarIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Comic } from "@/types/comics-store/comic-detail.type";
import { NextPage } from "next";
import { useDispatch } from "react-redux";
import { fetchWishlist } from '@/store/wishlistSlice';
import { AppDispatch } from '@/store/store';

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
    const { user } = useUser();
    const router = useRouter();
    const dispatch: AppDispatch = useDispatch();

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

    const addToWishlist = async (comic: Comic) => {
        if (!user) {
            toast({
                title: "Login required.",
                description: "You need to be logged in to add comics to your wishlist.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (comic.stock <= 0) {
            toast({
                title: "Out of stock.",
                description: "This comic is out of stock.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            const { error } = await supabase.from("wishlists").insert([{ user_id: user.id, comic_id: comic.id }]);

            if (error) throw error;

            // Dispatch fetchWishlist to update the wishlist state
            dispatch(fetchWishlist(user.id));

            toast({
                title: "Comic added to wishlist.",
                description: "The comic has been added to your wishlist.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Error adding to wishlist.",
                description: "There was an error adding the comic to your wishlist.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
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
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6} width="100%">
                {data
                    ?.filter((comic: Comic) => isAdmin || comic.is_approved)
                    .map((comic: Comic) => (
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
                            height="100%"
                            position="relative"
                            cursor="pointer"
                            onClick={() => router.push(`/${comic.id}`)}
                        >
                            <Box position="relative" width="100%" height="0" paddingBottom="100%">
                                <Image
                                    src={comic.image || defaultImageUrl}
                                    alt={comic.title}
                                    maxW="100%"
                                    maxH="100%"
                                    objectFit="contain"
                                    onError={(e) => {
                                        e.currentTarget.src = defaultImageUrl;
                                    }}
                                />
                                {!comic.is_approved && (
                                    <Box
                                        position="absolute"
                                        top="0"
                                        left="0"
                                        width="100%"
                                        height="100%"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        bgColor="rgba(0, 0, 0, 0.5)"
                                        color="white"
                                        fontSize="2xl"
                                        fontWeight="bold"
                                        textAlign="center"
                                    >
                                        Not Rendered
                                    </Box>
                                )}
                            </Box>
                            <Box width="100%" p={3} bgColor="black" color="white">
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
                                <Badge m={1} colorScheme="orange">
                                    Stock: {comic.stock}
                                </Badge>
                            </Box>
                            <IconButton
                                aria-label="Add to wishlist"
                                icon={<StarIcon />}
                                colorScheme="yellow"
                                position="absolute"
                                top={2}
                                left={2}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addToWishlist(comic);
                                }}
                                isDisabled={comic.stock <= 0}
                            />
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
