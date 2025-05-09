import React, { useState } from "react";
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
import { CartItem } from "@/types/comics-store/comic-detail.type";
import { useUser } from "@/contexts/UserContext";


interface CheckoutFormProps {
  amount: number;
  cartItems: CartItem[];
  onPaymentSuccess: (amount: number) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ amount, cartItems, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const { user } = useUser();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const response = await fetch("/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, userId: user?.id, cartItems }),
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

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?orderId=${data.orderId}&userId=${user?.id}`,
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
      await fetch("/api/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: data.orderId, cartItems }),
      });

      onPaymentSuccess(amount);

      // Dispatch custom event
      const paymentSuccessEvent = new CustomEvent('paymentSuccess', {
        detail: {
          userId: user?.id,
          orderId: data.orderId,
        },
      });
      window.dispatchEvent(paymentSuccessEvent);
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
    <Box as="form" onSubmit={handleSubmit} bg="" p={4} rounded="md" boxShadow="md">
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
        {!loading ? `Pay $${(amount) }` : "Processing..."}
      </Button>
    </Box>
  );
};

export default CheckoutForm;
