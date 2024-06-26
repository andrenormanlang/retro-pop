import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import {
  Box,
  Button,
  Center,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { useUser } from "@/contexts/UserContext";

const CheckoutForm = ({ amount, wishlistItems, onPaymentSuccess }: { amount: number, wishlistItems: any[], onPaymentSuccess: (amount: number) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const { user } = useUser();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<{ orderId: number } | null>(null); // Add orderData state

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
	event.preventDefault();
	setLoading(true);

	if (!stripe || !elements) {
	  return;
	}

	const { error: submitError } = await elements.submit();

	if (submitError) {
	  console.error("Error submitting payment form:", submitError);
	  setErrorMessage(submitError.message);
	  toast({
		title: "Payment error",
		description: submitError.message,
		status: "error",
		duration: 5000,
		isClosable: true,
	  });
	  setLoading(false);
	  return;
	}

	// Call your API to create the order and get orderData
	const response = await fetch("/api/create-payment-intent", {
	  method: "POST",
	  headers: {
		"Content-Type": "application/json",
	  },
	  body: JSON.stringify({ amount, userId: user?.id, wishlistItems }),
	});
	const data = await response.json();

	if (data.error) {
	  console.error("Error creating payment intent:", data.error);
	  toast({
		title: "Payment error",
		description: data.error,
		status: "error",
		duration: 5000,
		isClosable: true,
	  });
	  setLoading(false);
	  return;
	}

	setOrderData({ orderId: data.orderId }); // Set orderData with the received orderId

	const { error } = await stripe.confirmPayment({
	  elements,
	  confirmParams: {
		return_url: `${window.location.origin}/payment-success?orderId=${data.orderId}`, // Use orderId from data
	  },
	});

	if (error) {
	  console.error("Error confirming payment:", error);
	  setErrorMessage(error.message);
	  toast({
		title: "Payment error",
		description: error.message,
		status: "error",
		duration: 5000,
		isClosable: true,
	  });
	} else {
	  onPaymentSuccess(amount);
	}

	setLoading(false);
  };

  if (!stripe || !elements) {
    return (
      <Center>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box as="form" onSubmit={handleSubmit} bg="white" p={4} rounded="md" boxShadow="md">
      <PaymentElement />

      {errorMessage && <Text color="red.500" mt={2}>{errorMessage}</Text>}

      <Button
        mt={4}
        colorScheme="blue"
        type="submit"
        isLoading={loading}
        isDisabled={!stripe || loading}
        width="full"
      >
        {!loading ? `Pay $${amount / 100}` : "Processing..."}
      </Button>
    </Box>
  );
};

export default CheckoutForm;
