'use client';

import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Flex,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { RootState, AppDispatch } from '@/store/store';
import { fetchWishlist, removeFromWishlist } from '@/store/wishlistSlice';
import { useUser } from '../../../contexts/UserContext';
import { Comic } from '@/types/comics-store/comic-detail.type';
import { NextPage } from 'next';
import { motion } from 'framer-motion';

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
        year: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const Wishlist: NextPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useUser();
  const wishlist = useSelector((state: RootState) => state.wishlist.wishlist);
  const loading = useSelector((state: RootState) => state.wishlist.loading);
  const error = useSelector((state: RootState) => state.wishlist.error);
  const toast = useToast();
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const cancelRef = useRef(null);
  const router = useRouter();

  const onClose = () => setIsOpen(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist(user.id));
    }
  }, [user, dispatch]);

  const handleRemoveFromWishlist = (comicId: string) => {
    if (!user) return;

    dispatch(removeFromWishlist({ userId: user.id, comicId }))
      .unwrap()
      .then(() => {
        toast({
          title: 'Comic removed from wishlist.',
          description: 'The comic has been removed from your wishlist.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: 'Error removing from wishlist.',
          description: 'There was an error removing the comic from your wishlist.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const openDeleteDialog = (comic: Comic) => {
    setSelectedComic(comic);
    setIsOpen(true);
  };

  const handleDelete = async () => {
    if (selectedComic) {
      handleRemoveFromWishlist(selectedComic.id);
      setIsOpen(false);
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

  const defaultImageUrl = '/path/to/default-image.jpg';

    return (
        <Container maxW="container.xl" centerContent p={4}>
            <Flex width="100%" mb={4} alignItems="center" justifyContent="space-between">
                <Button leftIcon={<ArrowBackIcon />} colorScheme="teal" variant="outline"  onClick={() => router.push('/comics-store/buy')}  alignSelf="flex-start">
                    Back to Grid
                </Button>
                <Heading as="h1" size="xl" textAlign="center" flex="4">
                    My Wishlist
                </Heading>
                <Box flex="1" />
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="100%">
                {wishlist.map((comic: Comic) => (
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
                        <Box position="relative" width="100%" height="0" paddingBottom="100%">
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
                        <Box position="absolute" bottom="0" left="0" width="100%" p={3} bgColor="black" color="white">
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
                        <IconButton
                            aria-label="Remove from wishlist"
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            position="absolute"
                            top={2}
                            left={2}
                            onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDialog(comic);
                            }}
                        />
                    </Box>
                ))}
            </SimpleGrid>

            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Remove Comic from Wishlist
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to remove the comic titled {selectedComic?.title} from your wishlist?
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDelete} ml={3}>
                                Remove
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Container>
    );
};

export default Wishlist;
