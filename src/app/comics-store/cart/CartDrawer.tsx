import React, { useEffect, useState, useRef } from "react";
import {
	Box,
	Flex,
	Image,
	Text,
	IconButton,
	useToast,
	Drawer,
	DrawerBody,
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
	DrawerFooter,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchCart, removeFromCart, updateCartQuantity } from "@/store/cartSlice";
import { CartItem } from "@/types/comics-store/comic-detail.type";
import { useUser } from "../../../contexts/UserContext";
import CheckoutForm from "@/components/CheckoutForm";
import { Elements } from "@stripe/react-stripe-js";
import getStripe from "@/utils/get-stripejs";
import { supabase } from "@/utils/supabase/client";
import { useUpdateStock } from "@/hooks/stock-management/useUpdateStock";
import { useQueryClient } from "@tanstack/react-query";
import { Appearance } from "@stripe/stripe-js";

interface PaymentSuccessDetail {
	userId: string;
}

interface OrderData {
	amount: number;
	items: CartItem[];
	orderId: number;
}

interface CartDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
	const dispatch = useDispatch<AppDispatch>();
	const { user } = useUser();
	const cartItems = useSelector((state: RootState) => state.cart.items);
	const loading = useSelector((state: RootState) => state.cart.loading);
	const error = useSelector((state: RootState) => state.cart.error);
	const toast = useToast();
	const queryClient = useQueryClient();
	const { mutate: updateStock, isPending: updatingStock } = useUpdateStock();

	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedComicId, setSelectedComicId] = useState<string | null>(null);
	const cancelRef = useRef<HTMLButtonElement>(null);
	const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
	const [totalAmount, setTotalAmount] = useState(0);
	const [clientSecret, setClientSecret] = useState("");
	const [orderData, setOrderData] = useState<OrderData | null>(null);

	useEffect(() => {
		if (user) {
			dispatch(fetchCart({ userId: user.id }));
		}

		const handlePaymentSuccess = (event: CustomEvent<PaymentSuccessDetail>) => {
			if (event.detail.userId === user?.id) {
				handleClearCart();
			}
		};

		window.addEventListener("paymentSuccess", handlePaymentSuccess as EventListener);

		return () => {
			window.removeEventListener("paymentSuccess", handlePaymentSuccess as EventListener);
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, dispatch]);

	const handleRemoveFromCart = async (comicId: string) => {
		if (!user) return;

		const existingItem = cartItems.find((item) => item.comicId === comicId);

		if (!existingItem) return;

		const { data: comicData, error: comicError } = await supabase
			.from("comics-sell")
			.select("stock")
			.eq("id", comicId)
			.single();

		if (comicError || !comicData) {
			toast({
				title: "Error updating stock.",
				description: "There was an error updating the stock or insufficient stock available.",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			return;
		}

		const updatedStock = comicData.stock + existingItem.quantity;

		dispatch(removeFromCart({ userId: user.id, comicId }))
			.unwrap()
			.then(() => {
				updateStock(
					{ comicId, newStock: updatedStock },
					{
						onSuccess: () => {
							queryClient.invalidateQueries({ queryKey: ["comics"] });
						},
					}
				);
				toast({
					title: "Comic removed from cart.",
					description: "The comic has been removed from your cart.",
					status: "success",
					duration: 5000,
					isClosable: true,
				});
			})
			.catch(() => {
				toast({
					title: "Error removing from cart.",
					description: "There was an error removing the comic from your cart.",
					status: "error",
					duration: 5000,
					isClosable: true,
				});
			});
	};

	const confirmRemoveFromCart = (comicId: string) => {
		setSelectedComicId(comicId);
		setIsDeleteDialogOpen(true);
	};

	const handleStockChange = async (comicId: string, newQuantity: number) => {
		if (!user) return;

		const existingItem = cartItems.find((item) => item.comicId === comicId);

		if (!existingItem) return;

		if (newQuantity < 1) {
			confirmRemoveFromCart(comicId);
			return;
		}

		const stockDifference = newQuantity - existingItem.quantity;

		const { data: comicData, error: comicError } = await supabase
			.from("comics-sell")
			.select("stock")
			.eq("id", comicId)
			.single();

		if (comicError || !comicData) {
			toast({
				title: "Error updating stock.",
				description: "There was an error updating the stock or insufficient stock available.",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			return;
		}

		const updatedStock = comicData.stock - stockDifference;

		if (updatedStock < 0) {
			toast({
				title: "Insufficient stock",
				description: "You cannot add more of this comic to your cart.",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			return;
		}

		dispatch(updateCartQuantity({ userId: user.id, comicId, quantity: newQuantity }))
			.unwrap()
			.then(() => {
				updateStock(
					{ comicId, newStock: updatedStock },
					{
						onSuccess: () => {
							queryClient.invalidateQueries({ queryKey: ["comics"] });
						},
					}
				);
				toast({
					title: "Cart updated.",
					description: "The quantity has been updated.",
					status: "success",
					duration: 5000,
					isClosable: true,
				});
			})
			.catch((error) => {
				toast({
					title: "Error updating cart.",
					description: error.message,
					status: "error",
					duration: 5000,
					isClosable: true,
				});
			});
	};

	const calculateTotalAmount = () => {
		return cartItems.reduce((total, item) => total + item.quantity * item.price, 0);
	};

	const handleCheckout = async () => {
		if (!user) return;

		const amount = calculateTotalAmount();
		setTotalAmount(amount);

		const response = await fetch("/api/create-order", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ amount, userId: user.id, cartItems }),
		});

		const data = await response.json();

		if (data.error) {
			toast({
				title: "Payment Error",
				description: data.error,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} else {
			setClientSecret(data.clientSecret);
			setOrderData({ amount, items: cartItems, orderId: data.orderId });
			setIsCheckoutOpen(true);
		}
	};

	const handleClearCart = async () => {
		if (!user) return;

		const { error } = await supabase.from("cart").delete().eq("user_id", user.id);

		if (error) {
			toast({
				title: "Error clearing cart",
				description: error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} else {
			dispatch(fetchCart({ userId: user.id }));
			toast({
				title: "Cart cleared successfully",
				description: "All items have been removed from your cart.",
				status: "success",
				duration: 5000,
				isClosable: true,
			});
		}
	};

	// Stripe UI appearance customization
	const appearance: Appearance = {
		theme: "night",
		variables: {
			colorPrimary: "#0570de",
			colorText: "#e0e0e0",
			colorTextSecondary: "#b3b3b3",
			colorDanger: "#ef5350",
			borderRadius: "6px",
		},
		labels: "floating",
	};

	return (
		<>
			<Drawer isOpen={isOpen} placement="right" onClose={onClose} size={{ base: "full", md: "md" }}>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerCloseButton />
					<DrawerHeader>Your Cart</DrawerHeader>
					<DrawerBody>
						{loading ? (
							<Center h="100%">
								<Spinner size="xl" />
							</Center>
						) : error ? (
							<Center h="100%">
								<Alert status="error">
									<AlertIcon />
									{error}
								</Alert>
							</Center>
						) : (
							cartItems.map((item: CartItem) => (
								<Flex
									key={item.comicId}
									boxShadow="0 4px 8px rgba(0,0,0,0.1)"
									rounded="md"
									overflow="hidden"
									p={4}
									alignItems="center"
									justifyContent="space-between"
									mb={4}
								>
									<Image
										src={item.image || "/path/to/default-image.jpg"}
										alt={item.title}
										maxW={{ base: "75px", md: "100px" }}
										objectFit="contain"
									/>
									<Box flex="1" ml={4}>
										<Text fontWeight="bold" fontSize="lg" noOfLines={1}>
											{item.title}
										</Text>
										<Text>Price: ${item.price.toFixed(2)} {item.currency}</Text>
										<Flex alignItems="center">
											<Button
												size="sm"
												onClick={() => handleStockChange(item.comicId, item.quantity - 1)}
												disabled={item.quantity <= 1 || updatingStock}
											>
												-
											</Button>
											<Input
												size="sm"
												value={item.quantity}
												readOnly
												width="50px"
												mx={2}
												textAlign="center"
											/>
											<Button
												size="sm"
												onClick={() => handleStockChange(item.comicId, item.quantity + 1)}
												disabled={item.quantity >= item.stock || updatingStock}
											>
												+
											</Button>
										</Flex>
									</Box>
									<IconButton
										aria-label="Remove from cart"
										icon={<DeleteIcon />}
										colorScheme="red"
										onClick={() => confirmRemoveFromCart(item.comicId)}
									/>
								</Flex>
							))
						)}
					</DrawerBody>
					<DrawerFooter>
						<Box width="100%" p={4}>
							<Flex justifyContent="space-between">
								<Text>Subtotal:</Text>
								<Text>${calculateTotalAmount().toFixed(2)}</Text>
							</Flex>
							<Flex justifyContent="space-between" mt={2} fontWeight="bold">
								<Text>Total:</Text>
								<Text>${calculateTotalAmount().toFixed(2)}</Text>
							</Flex>
							<Button mt={4} colorScheme="blue" width="100%" onClick={handleCheckout}>
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
							Are you sure you want to delete this comic from your cart?
						</AlertDialogBody>
						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
								Cancel
							</Button>
							<Button
								colorScheme="red"
								onClick={() => {
									if (selectedComicId) {
										handleRemoveFromCart(selectedComicId);
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

			{isCheckoutOpen && clientSecret && (
				<Drawer
					isOpen={isCheckoutOpen}
					placement="right"
					onClose={() => setIsCheckoutOpen(false)}
					size={{ base: "full", md: "md" }}
				>
					<DrawerOverlay />
					<DrawerContent>
						<DrawerCloseButton />
						<DrawerHeader>Checkout</DrawerHeader>
						<DrawerBody>
							<Elements stripe={getStripe()} options={{ clientSecret, appearance }}>
								<CheckoutForm
									amount={totalAmount}
									cartItems={cartItems}
									onPaymentSuccess={handleClearCart}
								/>
							</Elements>
						</DrawerBody>
					</DrawerContent>
				</Drawer>
			)}
		</>
	);
};

export default CartDrawer;

