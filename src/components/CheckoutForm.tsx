"use client";

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

const CheckoutForm = ({ amount, onPaymentSuccess }: { amount: number, onPaymentSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const { error: submitError } = await elements.submit();

    if (submitError) {
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

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      toast({
        title: "Payment error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      onPaymentSuccess();
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

