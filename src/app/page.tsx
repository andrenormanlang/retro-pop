'use client';

import { useEffect, useState, useRef } from 'react';

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
} from '@chakra-ui/react';
import { useComicBuy } from '@/hooks/comics-sale/useComicBuy';
import { motion } from 'framer-motion';
import NextLink from 'next/link';
import { DeleteIcon, EditIcon, StarIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { Comic } from '@/types/comics-store/comic-detail.type';
import { NextPage } from 'next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeFromWishlist, updateWishlistQuantity } from '@/store/wishlistSlice';
import { AppDispatch, RootState } from '@/store/store';
import { useUser } from '@/contexts/UserContext';

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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
  const wishlist = useSelector((state: RootState) => state.wishlist.wishlist);

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

  const handleStockChange = async (comicId: string, newStock: number) => {
    if (!user) return;

    // Fetch the current stock of the comic from the comics-sell table
    const { data: comicData, error: comicError } = await supabase
      .from('comics-sell')
      .select('stock')
      .eq('id', comicId)
      .single();

    if (comicError || !comicData || comicData.stock < newStock) {
      toast({
        title: 'Error updating stock.',
        description: 'There was an error updating the stock or insufficient stock available.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    dispatch(updateWishlistQuantity({ userId: user.id, comicId, stock: newStock }))
      .unwrap()
      .then(() => {
        toast({
          title: 'Wishlist updated.',
          description: 'The stock has been updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      })
      .catch(() => {
        toast({
          title: 'Error updating wishlist.',
          description: 'There was an error updating the wishlist.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const addToWishlist = async (comicId: string) => {
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

    const existingItem = wishlist.find((item) => item.comic.id === comicId);

    if (existingItem) {
      if (existingItem.stock >= existingItem.comic.stock) {
        toast({
          title: "Stock limit reached.",
          description: "You cannot add more of this comic to your wishlist.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      handleStockChange(comicId, existingItem.stock + 1);
      return;
    }

    try {
      const { data: comicData, error: comicError } = await supabase
        .from('comics-sell')
        .select('stock')
        .eq('id', comicId)
        .single();

      if (comicError || !comicData || comicData.stock < 1) {
        throw new Error(comicError?.message || 'Comic not available');
      }

      const { error } = await supabase.from("wishlists").insert([{ user_id: user.id, comic_id: comicId, stock: 1 }]);

      if (error) throw error;

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
        description: error instanceof Error ? error.message : "There was an error adding the comic to your wishlist.",
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
              position="relative"
              cursor="pointer"
              onClick={() => router.push(`/${comic.id}`)}
            >
              <Box position="relative" width="100%" height="0" paddingBottom="150%">
                <Image
                  src={comic.image || defaultImageUrl}
                  alt={comic.title}
                  width="100%"
                  height="100%"
                  position="absolute"
                  top="0"
                  left="0"
                  objectFit="cover"
                  onError={(e) => {
                    e.currentTarget.src = defaultImageUrl;
                  }}
                />
                <Box
                  position="absolute"
                  bottom="0"
                  width="100%"
                  bgColor="rgba(0, 0, 0, 0.7)"
                  color="white"
                  padding={2}
                >
                  <Text fontWeight="bold" fontSize="lg">
                    {comic.price} {comic.currency}
                  </Text>
                  <Text>In Stock: {comic.stock}</Text>
                </Box>
                {comic.stock === 0 && (
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    width="100%"
                    height="20%"
                    bgColor="rgba(255, 0, 0, 0.7)"
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="2xl"
                    fontWeight="bold"
                  >
                    Sold Out
                  </Box>
                )}
                {isAdmin && !comic.is_approved && (
                  <Box
                    position="absolute"
                    bottom="60"
                    left="0"
                    width="100%"
                    height="20%"
                    bgColor="rgba(255, 252, 127, 0.5)"
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
					textColor="red.800"
                    fontSize="2xl"
                    fontWeight="bold"
                  >
                    Not Approved
                  </Box>
                )}
              </Box>
              <Box p={3} bgColor="black" color="white" width="100%">
                <Text fontWeight="bold" fontSize="lg" noOfLines={1} textAlign="center">
                  {comic.title}
                </Text>
                <Badge m={1} colorScheme="green">
                  Release Date: {formatDate(comic.release_date)}
                </Badge>
                <Badge m={1} colorScheme="purple">
                  Publisher: {comic.publisher}
                </Badge>
                <Badge m={1} colorScheme="yellow">
                  Genre: {comic.genre}
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
                  addToWishlist(comic.id);
                }}
                disabled={comic.stock === 0}
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





// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Image, Text, Flex, Container, Center, Spinner } from "@chakra-ui/react";
// import { ComicIssue } from '../types/metron.types'; // Adjust the import path as needed
// // import { getRandomComicCover } from '@/helpers/getRandomCover';

// export default function HomePage() {
// 	const [cover, setCover] = useState<ComicIssue | null>(null);
//     const [isLoading, setIsLoading] = useState<boolean>(false);

//     useEffect(() => {
//         async function fetchRandomCover() {
//             setIsLoading(true);
//             try {
//                 const response = await fetch('/api/random-cover');
//                 if (!response.ok) {
//                     throw new Error(`API call failed with status: ${response.status}`);
//                 }
//                 const randomCover = await response.json();
//                 setCover(randomCover);
//             } catch (error) {
//                 console.error("Error fetching random cover:", error);
//             }
//             setIsLoading(false);
//         }

//         fetchRandomCover();
//     }, []);

//     if (isLoading) {
//         return (
//             <Center h="100vh">
//                 <Spinner size="xl" />
//             </Center>
//         );
//     }

//     return (
//         <Container maxW="container.xl" centerContent p={4}>
//             {cover && (
//                 <Flex
//                     p={4}
//                     borderRadius="md"
//                     direction="column"
//                     align="center"
//                     justify="center"
//                 >
//                     <Text fontWeight="bold" fontSize="2rem" mt={2} fontFamily="Bangers" letterSpacing="0.2rem" color="red">
//                         RANDOM COVER!
//                     </Text>
//                     <Text fontWeight="bold" fontSize="1.5rem" mt={2} fontFamily="Bangers" letterSpacing="0.2rem" color="red.500">
//                         {cover.issue}
//                     </Text>
//                     <Image
//                         src={cover.image}
//                         alt={`Random Comic Book Cover: ${cover.issue}`}
//                         boxSize={{ base: "300px", md: "400px" }}
//                         objectFit="contain"
//                     />
//                 </Flex>
//             )}
//         </Container>
//     );
// }


// pages/index.tsx
// const HomePage = () => {
//     return <div></div>;
//   };

//   export default HomePage;


// import {
// 	Image,
// 	Text,
// 	Flex,
// 	Container,
//   } from "@chakra-ui/react";

//   import getRandomCover from "@/helpers/getRandomCover";

//   export default async function HomePage() {
// 	const cover = await getRandomCover()

// 	return (
// 	  <Container maxW="container.xl" centerContent p={4}>
// 		{cover && (
// 		  <Flex
// 			p={4}
// 			borderRadius="md"
// 			direction="column"
// 			align="center"
// 			justify="center"
// 		  >
// 			<Text fontWeight="bold" fontSize="2rem" mt={2} fontFamily="Bangers" letterSpacing="0.2rem" color="red">
// 			  RANDOM COVER!
// 			</Text>
// 			<Text fontWeight="bold" fontSize="1.5rem" mt={2} fontFamily="Bangers" letterSpacing="0.2rem" color="white">
// 			  {cover.title}
// 			</Text>
// 			<Image
// 			  src={cover.coverPage}
// 			  alt={`Random Comic Book Cover: ${cover.title}`}
// 			  boxSize="400px"
// 			  objectFit="contain"
// 			/>
// 		  </Flex>
// 		)}
// 	  </Container>
// 	);
//   };


// 'use client';
// import React, { useEffect, useState } from 'react';
// import {
//   Box,
//   Image,
//   Text,
//   Center,
//   Spinner,
//   Flex,
//   Badge,
//   Container,
//   useColorModeValue
// } from "@chakra-ui/react";
// import { motion } from "framer-motion";
// import { ComicCover } from '../types/cbAPI.types'; // Adjust the import path as needed


// const HomePage: React.FC = () => {
//   const [cover, setCover] = useState<ComicCover | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const bgColor = useColorModeValue("white", "gray.800");

//   useEffect(() => {
//     const fetchRandomCover = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetch('/api/random-cover');
//         const data: ComicCover = await response.json();
//         setCover(data);
//       } catch (error) {
//         console.error('Error fetching random cover:', error);
//       }
//       setIsLoading(false);
//     };

//     fetchRandomCover();
//   }, []);

//   if (isLoading) {
//     return (
//       <Center h="100vh">
//         <Spinner size="xl" />
//       </Center>
//     );
//   }

//   return (
//     <Container maxW="container.xl" centerContent p={4}>
//       {cover && (
//         <motion.div
//           whileHover={{ scale: 1.05 }}
//           style={{ textDecoration: 'none', cursor: 'pointer' }}
//         >
//           <Flex
//             bg={bgColor}
//             p={4}
//             borderRadius="md"
//             direction="column"
//             align="center"
//             justify="center"
//           >
//             <Text fontWeight="bold" fontSize="lg" mt={2}>
//               {cover.title}
//             </Text>
//             <Image
//               src={cover.coverPage}
//               alt={`Random Comic Book Cover: ${cover.title}`}
//               boxSize="700px"
//               objectFit="contain"
//             />
//             {/* <Badge colorScheme="green" mt={1}>
//               {cover.information.Year}
//             </Badge> */}
//             {/* <Text fontSize="sm" color="gray.500" textAlign="center" mt={2}>
//               {cover.description}
//             </Text> */}
//             {/* Additional content or buttons can be added here */}
//           </Flex>
//         </motion.div>
//       )}
//       {!cover && !isLoading && (
//         <Text fontSize="xl">No cover available at the moment.</Text>
//       )}
//     </Container>
//   );
// };

// export default HomePage;
