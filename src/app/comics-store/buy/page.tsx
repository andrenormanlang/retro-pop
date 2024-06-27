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
  Stack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import NextLink from 'next/link';
import { DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { Comic } from '@/types/comics-store/comic-detail.type';
import { NextPage } from 'next';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateCartQuantity } from '@/store/cartSlice';
import { AppDispatch, RootState } from '@/store/store';
import { useUser } from '@/contexts/UserContext';
import { useUpdateStock } from '@/hooks/stock-management/useUpdateStock';
import { useComics } from '@/hooks/stock-management/useComics';

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const ComicsBuy: NextPage = () => {
  const { data: comics, isLoading, error } = useComics();
  const toast = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingComicIds, setLoadingComicIds] = useState<string[]>([]);
  const cancelRef = useRef(null);
  const { user } = useUser();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart.items);
  const { mutate: updateStock } = useUpdateStock();

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

        // The useQuery hook will automatically refetch the data after a successful mutation.
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

  const handleStockChange = async (comicId: string, quantity: number) => {
    if (!user) return;

    setLoadingComicIds((prev) => [...prev, comicId]);

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
      setLoadingComicIds((prev) => prev.filter((id) => id !== comicId));
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
      setLoadingComicIds((prev) => prev.filter((id) => id !== comicId));
      return;
    }

    const existingItem = cart.find((item) => item.comicId === comicId);

    if (existingItem) {
      dispatch(updateCartQuantity({ userId: user.id, comicId, quantity: existingItem.quantity + quantity }))
        .unwrap()
        .then(() => {
          updateStock({ comicId, newStock: comicData.stock - quantity }, {
            onSuccess: () => {
              setLoadingComicIds((prev) => prev.filter((id) => id !== comicId));
              toast({
                title: 'Cart updated.',
                description: 'The stock has been updated.',
                status: 'success',
                duration: 5000,
                isClosable: true,
              });
            },
            onError: () => {
              setLoadingComicIds((prev) => prev.filter((id) => id !== comicId));
            }
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
          setLoadingComicIds((prev) => prev.filter((id) => id !== comicId));
        });
    } else {
      dispatch(addToCart({
        userId: user.id,
        comicId,
        quantity,
        title: comicData.title,
        image: comicData.image,
        price: comicData.price,
        currency: comicData.currency,
        stock: comicData.stock - quantity
      }))
        .unwrap()
        .then(() => {
          updateStock({ comicId, newStock: comicData.stock - quantity }, {
            onSuccess: () => {
              setLoadingComicIds((prev) => prev.filter((id) => id !== comicId));
              toast({
                title: 'Added to cart.',
                description: 'The comic has been added to your cart.',
                status: 'success',
                duration: 5000,
                isClosable: true,
              });
            },
            onError: () => {
              setLoadingComicIds((prev) => prev.filter((id) => id !== comicId));
            }
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
          setLoadingComicIds((prev) => prev.filter((id) => id !== comicId));
        });
    }
  };

  if (isLoading) {
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
          {error instanceof Error ? error.message : 'An error occurred'}
        </Alert>
      </Center>
    );
  }

  const defaultImageUrl = "/path/to/default-image.jpg";

  return (
    <Container maxW="container.xl" centerContent p={4}>
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={6} width="100%">
        {comics
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
                  fontSize={{ base: 'sm', md: 'md' }}
                >
                  <Text fontWeight="bold" fontSize={{ base: 'xs', md: 'lg' }}>
                    {comic.price} {comic.currency}
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'md' }}>In Stock: {comic.stock}</Text>
                </Box>
                {comic.stock === 0 && (
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    width="100%"
                    height="40%"
                    bgColor="rgba(255, 0, 0, 0.7)"
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize={{ base: 'lg', md: 'lg' }}
                    fontWeight="bold"
                  >
                    Sold Out
                  </Box>
                )}
                {isAdmin && !comic.is_approved && (
                  <Box
                    position="absolute"
                    bottom="40"
                    left="0"
                    width="100%"
                    height="10%"
                    bgColor="rgba(255, 252, 127, 0.5)"
                    color="red.800"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize={{ base: 'xs', md: '2xl' }}
                    fontWeight="bold"
                  >
                    Not Approved
                  </Box>
                )}
              </Box>
              <Box p={3} bgColor="black" color="white" width="100%">
                <Stack spacing={2}>
                  <Text fontWeight="bold" fontSize={{ base: 'xs', md: 'lg' }} noOfLines={1} textAlign="center">
                    {comic.title}
                  </Text>
                  <Badge m={1} colorScheme="green" fontSize={{ base: '2xs', md: 'sm' }}>
                    Released: {formatDate(comic.release_date)}
                  </Badge>
                  <Badge m={1} colorScheme="purple" fontSize={{ base: '2xs', md: 'sm' }}>
                    {comic.publisher}
                  </Badge>
                  <Badge m={1} colorScheme="yellow" fontSize={{ base: '2xs', md: 'sm' }}>
                    Genre: {comic.genre}
                  </Badge>
                </Stack>
              </Box>
              <IconButton
                aria-label="Add to cart"
                icon={loadingComicIds.includes(comic.id) ? <Spinner size="sm" /> : <AddIcon />}
                colorScheme="yellow"
                position="absolute"
                top={2}
                left={2}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStockChange(comic.id, 1);
                }}
                size={{ base: 'xs', md: 'md' }}
                disabled={comic.stock === 0 || loadingComicIds.includes(comic.id)}
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
                      size={{ base: 'xs', md: 'md' }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </NextLink>
                  <IconButton
                    aria-label="Delete Comic"
                    icon={<DeleteIcon />}
                    fontWeight={"900"}
                    color={"white"}
                    backgroundColor={"red.500"}
                    size={{ base: 'xs', md: 'md' }}
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
