import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Text,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import { supabase } from '@/utils/supabaseClient';

const PaymentSuccess = () => {
  const router = useRouter();
  const { id } = router.query;
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('items')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching order details:', error);
      } else {
        setOrderDetails(data);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  return (
    <Drawer isOpen={true} placement="right" onClose={() => {}} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Payment Success</DrawerHeader>
        <DrawerBody>
          <Box textAlign="center" p={10} bgGradient="linear(to-tr, blue.500, purple.500)" color="white" rounded="md" boxShadow="lg">
            <Text fontSize="4xl" fontWeight="extrabold" mb={2}>
              Thank you!
            </Text>
            <Text fontSize="2xl">You successfully sent</Text>
            <Box bg="white" p={2} rounded="md" color="purple.500" mt={5} fontSize="4xl" fontWeight="bold">
              ${router.query.amount}
            </Box>
            {orderDetails && (
              <Box mt={5}>
                <Text fontSize="lg" fontWeight="bold">Order Details:</Text>
                <ul>
                  {orderDetails.items.map((item: any) => (
                    <li key={item.id}>
                      {item.title} - {item.price} USD
                    </li>
                  ))}
                </ul>
              </Box>
            )}
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default PaymentSuccess;
