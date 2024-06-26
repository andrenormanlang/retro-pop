'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text, Spinner, Center, List, ListItem, Heading, Stack, Divider, useColorModeValue } from '@chakra-ui/react';

const PaymentSuccess = () => {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('gray.50', 'gray.800');
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
    <Center height="100vh" p={4}>
      <Box
        // bg={bgColor}
		bg="gray.500"
        p={8}
        maxWidth="600px"
        width="full"
        boxShadow="lg"
        borderRadius="md"
      >
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Thank you for your purchase
        </Heading>
        <Divider mb={4} />
        <Stack spacing={2} mb={6}>
          <Text fontWeight="bold" textColor="red.500">Order ID:</Text>
          <Text>{order.id}</Text>
          <Text fontWeight="bold">Total Amount:</Text>
          <Text>${(order.total_amount / 100).toFixed(2)}</Text>
          <Text fontWeight="bold">Currency:</Text>
          <Text>{order.currency}</Text>
        </Stack>
        <Divider mb={4} />
        <Heading as="h2" size="md" mb={4}>Items:</Heading>
        <List spacing={3}>
          {order.items.map((item: any) => (
            <ListItem key={item.id} display="flex" justifyContent="space-between">
              <Text>{item.title}</Text>
              <Text>${(item.price / 100).toFixed(2)} x {item.quantity}</Text>
            </ListItem>
          ))}
        </List>
        <Divider mt={4} />
        <Box textAlign="right" mt={4}>
          <Text fontWeight="bold" fontSize="lg">
            Total: ${(order.total_amount / 100).toFixed(2)}
          </Text>
        </Box>
      </Box>
    </Center>
  );
};

export default PaymentSuccess;


