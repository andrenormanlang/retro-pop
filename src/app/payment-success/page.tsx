// // pages/receipt.tsx

'use client';

// import { useEffect, useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Box, Text, Spinner, Center, List, ListItem, Heading, Stack, Divider, Image, useColorModeValue } from '@chakra-ui/react';

// const ReceiptPage = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const orderId = searchParams.get('orderId');

//   const [order, setOrder] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const bg = useColorModeValue('gray.50', 'gray.800');
//   const textColor = useColorModeValue('black', 'white');
//   const headingColor = useColorModeValue('gray.900', 'gray.100');
//   const totalColor = useColorModeValue('teal.500', 'teal.200');

//   useEffect(() => {
//     const fetchOrderDetails = async () => {
//       if (!orderId) return;

//       try {
//         const response = await fetch(`/api/payment-success?orderId=${orderId}`);
//         const data = await response.json();

//         if (data.error) {
//           setError(data.error);
//         } else {
//           setOrder(data.order);
//         }
//       } catch (err) {
//         setError('Failed to fetch order details');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrderDetails();
//   }, [orderId]);

//   if (loading) {
//     return (
//       <Center height="100vh">
//         <Spinner size="xl" />
//       </Center>
//     );
//   }

//   if (error) {
//     return (
//       <Center height="100vh">
//         <Text color="red.500">{error}</Text>
//       </Center>
//     );
//   }

//   return (
//     <Center>
//       <Box bg={bg} p={8} rounded="md" shadow="md" maxW="md" width="100%">
//         <Heading size="lg" mb={4} textAlign="center" color={headingColor}>Thank you for your purchase, {order.user_name}!</Heading>
//         <Divider mb={4} />
//         <Stack spacing={2} mb={4} color={textColor}>
//           <Text fontWeight="bold">Order ID:</Text>
//           <Text>{order.id}</Text>
//           <Text fontWeight="bold">Currency:</Text>
//           <Text>{order.currency}</Text>
//         </Stack>
//         <Divider my={4} />
//         <Heading size="md" mb={2} color={headingColor}>Items:</Heading>
//         <List spacing={3}>
//           {order.items.map((item: any) => (
//             <ListItem key={item.id} display="flex" alignItems="center" color={textColor}>
//               <Image
//                 src={item.image}
//                 alt={item.title}
//                 boxSize="50px"
//                 objectFit="cover"
//                 mr={4}
//               />
//               <Box>
//                 <Text fontWeight="bold">{item.title}</Text>
//                 <Text>${(item.price / 100).toFixed(2)} x {item.quantity}</Text>
//                 <Text>Total: ${((item.price * item.quantity) / 100).toFixed(2)}</Text>
//               </Box>
//             </ListItem>
//           ))}
//         </List>
//         <Divider my={4} />
//         <Center>
//           <Text fontWeight="bold" fontSize="2xl" color={totalColor}>Total Amount: ${(order.total_amount / 100).toFixed(2)}</Text>
//         </Center>
//       </Box>
//     </Center>
//   );
// };

// export default ReceiptPage;

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Spinner, Text, Button } from '@chakra-ui/react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PaymentSuccess = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const orderId = searchParams.get('orderId');
	const userId = searchParams.get('userId');
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState('');

	useEffect(() => {
	  if (orderId && userId) {
		fetch(`/api/payment-success?orderId=${orderId}&userId=${userId}`)
		  .then((response) => response.json())
		  .then((data) => {
			if (data.error) {
			  setMessage(`Error: ${data.error}`);
			} else {
			  setMessage('Payment succeeded and receipt generated!');

			  // Dispatch a custom event to clear the cart
			  const event = new CustomEvent('paymentSuccess', {
				detail: { userId },
			  });
			  window.dispatchEvent(event);
			}
		  })
		  .catch((error) => {
			setMessage(`Error: ${error.message}`);
		  })
		  .finally(() => {
			setLoading(false);
		  });
	  }
	}, [orderId, userId]);

	if (loading) {
	  return (
		<Box textAlign="center" mt="20">
		  <Spinner size="xl" />
		</Box>
	  );
	}

	return (
	  <Box textAlign="center" mt="20">
		<Text>{message}</Text>
	  </Box>
	);
  };

  export default PaymentSuccess;

