"use client";

import { usePathname, useRouter } from "next/navigation";
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
  Switch,
  useToast,
  IconButton
} from "@chakra-ui/react";
import { ArrowBackIcon, StarIcon } from "@chakra-ui/icons";
import { Comic } from "@/types/comics-store/comic-detail.type";
import { useUser } from "@/contexts/UserContext";
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, updateWishlistQuantity } from '@/store/wishlistSlice';
import { AppDispatch, RootState } from '@/store/store';

const ComicDetail = () => {
  const pathname = usePathname();
  const router = useRouter();
  const pathParts = pathname.split("/");
  const id = pathParts.pop(); // Extracts the last segment of the path as the id

  const { user } = useUser();
  const toast = useToast();
  const [comic, setComic] = useState<Comic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const dispatch: AppDispatch = useDispatch();
  const wishlist = useSelector((state: RootState) => state.wishlist.wishlist);

  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error.message);
          return;
        }

        if (data && data.is_admin) {
          setIsAdmin(true);
        }
      };

      fetchUserProfile();
    }
  }, [user]);

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
              currency,
              stock,
              is_approved
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

  const toggleApproval = async () => {
    if (comic) {
      try {
        const { error } = await supabase
          .from("comics-sell")
          .update({ is_approved: !comic.is_approved })
          .eq("id", comic.id);

        if (error) throw error;

        setComic({ ...comic, is_approved: !comic.is_approved });

        toast({
          title: comic.is_approved ? "Comic disapproved." : "Comic approved.",
          description: comic.is_approved
            ? "The comic has been set to not approved."
            : "The comic has been approved.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error updating comic.",
          description: "There was an error updating the comic.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
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
              src={comic.image || "../../public/default-image.jpg"}
              alt={`Cover of ${comic.title}`}
              width="100%"
            />
          </Box>
          <VStack flex="2" align="start" spacing={4} p={4}>
            <Heading as="h1" size="xl" color="tomato">
              {comic.title}
            </Heading>
            <HStack spacing={4}>
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
            {isAdmin && (
              <HStack spacing={4} align="center">
                <Switch
                  size="lg"
                  colorScheme="teal"
                  isChecked={comic.is_approved}
                  onChange={toggleApproval}
                />
                <Text color="white">{comic.is_approved ? "Approved" : "Not Approved"}</Text>
              </HStack>
            )}
            <Button
              leftIcon={<StarIcon />}
              colorScheme="yellow"
              onClick={() => addToWishlist(comic.id)}
              isDisabled={comic.stock === 0}
            >
              Add to Wishlist
            </Button>
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

