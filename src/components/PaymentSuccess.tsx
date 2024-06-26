import React from "react";
import {
  Box,
  Text,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";

interface PaymentSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ isOpen, onClose, amount }) => {
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
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
              ${amount}
            </Box>
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default PaymentSuccess;
