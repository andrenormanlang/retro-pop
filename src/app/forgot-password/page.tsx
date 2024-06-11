// src/pages/forgot-password.tsx

"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Center,
  useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const confirmReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      router.push("/forgot-password?message=Could not authenticate user");
    } else {
      router.push(
        "/confirm?message=Password Reset link has been sent to your email address"
      );
    }
  };

  return (
    <Center minH="100vh" bg={useColorModeValue("gray.50", "gray.800")}>
      <Box
        p={8}
        maxWidth="400px"
        width="full"
        bg={useColorModeValue("white", "gray.700")}
        boxShadow="md"
        borderRadius="md"
      >
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Reset Password
        </Heading>
        <form onSubmit={confirmReset}>
          <FormControl id="email" mb={4}>
            <FormLabel>Enter Email Address</FormLabel>
            <Input type="email" name="email" required />
          </FormControl>
          <Button type="submit" colorScheme="teal" width="full" mb={4}>
            Confirm
          </Button>
          {message && (
            <Text color="red.500" textAlign="center" mb={4}>
              {message}
            </Text>
          )}
        </form>
        <Link href="/login" passHref>
          <Button variant="link" colorScheme="teal" width="full">
            Remember your password? Sign in
          </Button>
        </Link>
      </Box>
    </Center>
  );
}
