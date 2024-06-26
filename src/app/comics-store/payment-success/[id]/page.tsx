import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text, Spinner, Center, List, ListItem, Heading, Stack, Divider, Image } from '@chakra-ui/react';

const PaymentSuccess = ({ onClose, amount, orderId }: { onClose: () => void; amount: string; orderId: number }) => {
	const router = useRouter();
	const [order, setOrder] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchOrderDetails = async () => {
			if (!orderId) return;

			try {
				const response = await fetch(`/api/payment-success?orderId=${orderId}`);
				const data = await response.json();

				if (data.error) {
					setError(data.error);
				} else {
					setOrder(data.order);
				}
			} catch (err) {
				setError('Failed to fetch order details');
			} finally {
				setLoading(false);
			}
		};

		fetchOrderDetails();
	}, [orderId]);

	if (loading) {
		return (
			<Center height="100vh">
				<Spinner size="xl" />
			</Center>
		);
	}

	if (error) {
		return (
			<Center height="100vh">
				<Text color="red.500">{error}</Text>
			</Center>
		);
	}

	return (
		<Center>
			<Box bg="gray.50" p={8} rounded="md" shadow="md" maxW="md" width="100%">
				<Heading size="lg" mb={4} textAlign="center">Thank you for your purchase, {order.username}!</Heading>
				<Divider mb={4} />
				<Stack spacing={2} mb={4}>
					<Text fontWeight="bold">Order ID:</Text>
					<Text>{order.id}</Text>
					<Text fontWeight="bold">Currency:</Text>
					<Text>{order.currency}</Text>
				</Stack>
				<Divider my={4} />
				<Heading size="md" mb={2}>Items:</Heading>
				<List spacing={3}>
					{order.items.map((item: any) => (
						<ListItem key={item.id} display="flex" alignItems="center">
							<Image
								src={item.image}
								alt={item.title}
								boxSize="50px"
								objectFit="cover"
								mr={4}
							/>
							<Box>
								<Text fontWeight="bold">{item.title}</Text>
								<Text>${(item.price / 100).toFixed(2)} x {item.quantity}</Text>
								<Text>Total: ${(item.price * item.quantity / 100).toFixed(2)}</Text>
							</Box>
						</ListItem>
					))}
				</List>
				<Divider my={4} />
				<Heading size="md" mt={4} textAlign="center" color="teal.500">
					Total Amount: ${amount}
				</Heading>
			</Box>
		</Center>
	);
};

export default PaymentSuccess;

