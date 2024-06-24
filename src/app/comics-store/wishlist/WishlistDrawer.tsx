'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Flex,
  Image,
  Text,
  IconButton,
  useToast,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchWishlist, removeFromWishlist, updateWishlistQuantity } from '@/store/wishlistSlice';
import { WishlistItem } from '@/types/comics-store/comic-detail.type';
import { useUser } from '../../../contexts/UserContext';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useUser();
  const wishlist = useSelector((state: RootState) => state.wishlist.wishlist);
  const loading = useSelector((state: RootState) => state.wishlist.loading);
  const error = useSelector((state: RootState) => state.wishlist.error);
  const toast = useToast();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedComicId, setSelectedComicId] = useState<string | null>(null);
  const cancelRef = useRef(null);

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
      .catch(() => {
        toast({
          title: 'Error removing from wishlist.',
          description: 'There was an error removing the comic from your wishlist.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const confirmRemoveFromWishlist = (comicId: string) => {
    setSelectedComicId(comicId);
    setIsDeleteDialogOpen(true);
  };

  const handleStockChange = (comicId: string, newStock: number) => {
    if (!user) return;

    if (newStock < 1) {
      confirmRemoveFromWishlist(comicId);
      return;
    }

    const existingItem = wishlist.find((item) => item.comic.id === comicId);

    if (existingItem && newStock > existingItem.comic.stock) {
      toast({
        title: 'Stock limit reached.',
        description: 'You cannot add more of this comic to your wishlist.',
        status: 'warning',
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

  const calculateTotalAmount = () => {
    return wishlist.reduce((total, item) => total + item.comic.price * item.stock, 0).toFixed(2);
  };

  const defaultImageUrl = '/path/to/default-image.jpg';

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size={{ base: 'full', md: 'md' }}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          {/* <DrawerHeader>My Wishlist</DrawerHeader> */}

          <DrawerBody>
            {loading ? (
              <Center h="100vh">
                <Spinner size="xl" />
              </Center>
            ) : error ? (
              <Center h="100vh">
                <Alert status="error">
                  <AlertIcon />
                  {error}
                </Alert>
              </Center>
            ) : (
              wishlist.map((item: WishlistItem) => (
                <Flex
                  key={item.comic.id}
                  boxShadow="0 4px 8px rgba(0,0,0,0.1)"
                  rounded="md"
                  overflow="hidden"
                  p={4}
                  alignItems="center"
                  justifyContent="space-between"
                  mb={4}
                >
                  <Image
                    src={item.comic.image || defaultImageUrl}
                    alt={item.comic.title}
                    maxW={{ base: '75px', md: '100px' }}
                    maxH={{ base: '75px', md: '100px' }}
                    objectFit="contain"
                    onError={(e) => {
                      e.currentTarget.src = defaultImageUrl;
                    }}
                  />
                  <Box flex="1" ml={{ base: 2, md: 4 }}>
                    <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'lg' }} noOfLines={1}>
                      {item.comic.title}
                    </Text>
                    <Text fontSize={{ base: 'xs', md: 'md' }}>Price: {item.comic.price} {item.comic.currency}</Text>
                    <Flex alignItems="center">
                      <Button
                        size="sm"
                        onClick={() => handleStockChange(item.comic.id, item.stock - 1)}
                        disabled={item.stock <= 1}
                      >
                        -
                      </Button>
                      <Input
                        size="sm"
                        value={item.stock}
                        readOnly
                        width="50px"
                        mx={2}
                        textAlign="center"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleStockChange(item.comic.id, item.stock + 1)}
                        disabled={item.stock >= item.comic.stock}
                      >
                        +
                      </Button>
                    </Flex>
                  </Box>
                  <IconButton
                    aria-label="Remove from wishlist"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => confirmRemoveFromWishlist(item.comic.id)}
                  />
                </Flex>
              ))
            )}
          </DrawerBody>

          <DrawerFooter>
            <Box width="100%">
              <Flex justifyContent="space-between" mt={2}>
                <Text>Subtotal</Text>
                <Text>{calculateTotalAmount()}</Text>
              </Flex>
              <Flex justifyContent="space-between" mt={2}>
                <Text>Shipping</Text>
                <Text>Gratis</Text>
              </Flex>
              <Flex justifyContent="space-between" mt={2} fontWeight="bold">
                <Text>Total</Text>
                <Text>{calculateTotalAmount()}</Text>
              </Flex>
              <Button mt={4} colorScheme="blue" width="100%">
                Go to Checkout
              </Button>
            </Box>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Comic
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this comic from your wishlist?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  if (selectedComicId) {
                    handleRemoveFromWishlist(selectedComicId);
                  }
                  setIsDeleteDialogOpen(false);
                }}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default WishlistDrawer;
