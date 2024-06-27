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
import { ArrowBackIcon, AddIcon } from "@chakra-ui/icons";
import { Comic } from "@/types/comics-store/comic-detail.type";
import { useUser } from "@/contexts/UserContext";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateCartQuantity } from '@/store/cartSlice';
import { AppDispatch, RootState } from '@/store/store';
import { useUpdateStock } from "@/hooks/stock-management/useUpdateStock";


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
  const cart = useSelector((state: RootState) => state.cart.items);
  const updateStockMutation = useUpdateStock();

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

  const addToCartHandler = async (comicId: string) => {
    if (!user) {
      toast({
        title: "Login required.",
        description: "You need to be logged in to add comics to your cart.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const existingItem = cart.find((item) => item.comicId === comicId);

    if (existingItem) {
      handleStockChange(comicId, existingItem.quantity + 1);
      return;
    }

    handleStockChange(comicId, 1);
  };

  const handleStockChange = async (comicId: string, quantity: number) => {
    if (!user) return;

    // Fetch the current stock of the comic from the comics-sell table
    const { data: comicData, error: comicError } = await supabase
      .from('comics-sell')
      .select('stock, title, image, price, currency')
      .eq('id', comicId)
      .single();

    if (comicError || !comicData) {
      toast({
        title: 'Error updating stock.',
        description: 'There was an error updating the stock or insufficient stock available.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (comicData.stock < quantity) {
      toast({
        title: 'Error updating stock.',
        description: 'Insufficient stock available.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const existingItem = cart.find((item) => item.comicId === comicId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      const stockDifference = quantity;

      dispatch(updateCartQuantity({ userId: user.id, comicId, quantity: newQuantity }))
        .unwrap()
        .then(() => {
          updateStockMutation.mutate({ comicId, newStock: comicData.stock - stockDifference });
          toast({
            title: 'Cart updated.',
            description: 'The stock has been updated.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        })
        .catch(() => {
          toast({
            title: 'Error updating cart.',
            description: 'There was an error updating the cart.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        });
    } else {
      const stockDifference = quantity;

      dispatch(addToCart({
        userId: user.id,
        comicId,
        quantity,
        title: comicData.title,
        image: comicData.image,
        price: comicData.price,
        currency: comicData.currency,
        stock: comicData.stock - stockDifference
      }))
        .unwrap()
        .then(() => {
          updateStockMutation.mutate({ comicId, newStock: comicData.stock - stockDifference });
          toast({
            title: 'Added to cart.',
            description: 'The comic has been added to your cart.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        })
        .catch(() => {
          toast({
            title: 'Error adding to cart.',
            description: 'There was an error adding the comic to your cart.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        });
    }
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
            size={{ base: "sm", md: "md" }} // Responsive button size
          >
            Back to Grid
          </Button>
        </Box>
        <Flex
          direction={{ base: "column", md: "row" }}
          bg="gray.800"
          p={{ base: 4, md: 6 }} // Responsive padding
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.700"
        >
          <Box flex="1" mb={{ base: 4, md: 0 }}>
            <Image
              borderRadius="md"
              objectFit="contain"
              src={comic.image || "/default-image.jpg"} // Use absolute path for public folder
              alt={`Cover of ${comic.title}`}
              width="100%"
              height={{ base: "auto", md: "400px" }} // Responsive image height
            />
          </Box>
          <VStack flex="2" align="start" spacing={4} p={{ base: 2, md: 4 }}>
            <Heading as="h1" size={{ base: "lg", md: "xl" }} color="tomato">
              {comic.title}
            </Heading>
            <HStack spacing={4}>
              <Badge colorScheme="green" fontSize={{ base: "0.8em", md: "1.2em" }}>
                RELEASED {formatDate(comic.release_date)}
              </Badge>
            </HStack>
            <HStack spacing={4}>
              <Text fontSize={{ base: "sm", md: "md" }} color="gray.400">
                <strong>{comic.publisher}</strong>
              </Text>

            </HStack>
            <HStack spacing={4}>
              <Text fontSize={{ base: "sm", md: "md" }} color="gray.400">
                <strong>{comic.pages} pages</strong>
              </Text>
              <Text fontSize={{ base: "sm", md: "md" }} color="gray.400">
                <strong>{comic.currency} {comic.price}</strong>
              </Text>
            </HStack>
            <Box>
              <Heading as="h2" size={{ base: "sm", md: "md" }} color="orange" mb={2}>
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
                  size={{ base: "sm", md: "lg" }}
                  colorScheme="teal"
                  isChecked={comic.is_approved}
                  onChange={toggleApproval}
                />
                <Text color="white" fontSize={{ base: "sm", md: "md" }}>
                  {comic.is_approved ? "Approved" : "Not Approved"}
                </Text>
              </HStack>
            )}
            <Button
              leftIcon={<AddIcon />}
              colorScheme="yellow"
              onClick={() => addToCartHandler(comic.id)}
              isDisabled={comic.stock === 0}
              size={{ base: "sm", md: "md" }} // Responsive button size
            >
              Add to Cart
            </Button>
          </VStack>
        </Flex>
      </Container>
      <Container maxW="container.xl" p={4}>
        <Flex
          direction={{ base: "column", md: "row" }}
          bg="gray.800"
          p={{ base: 4, md: 6 }} // Responsive padding
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.700"
        >
          <Text fontSize={{ base: "sm", md: "lg" }} color="white" textAlign="start">
            {comic.description || "No description available."}
          </Text>
        </Flex>
      </Container>
    </>
  );
};

export default ComicDetail;
