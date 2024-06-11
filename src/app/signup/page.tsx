// src/pages/signup.tsx

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

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const signUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      router.push("/signup?message=Passwords do not match");
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      router.push("/signup?message=Could not authenticate user");
    } else {
      router.push(`/confirm?message=Check email(${email}) to continue sign in process`);
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
          Sign Up
        </Heading>
        <form onSubmit={signUp}>
          <FormControl id="email" mb={4}>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" required />
          </FormControl>
          <FormControl id="password" mb={4}>
            <FormLabel>Password</FormLabel>
            <Input type="password" name="password" required />
          </FormControl>
          <FormControl id="confirmPassword" mb={4}>
            <FormLabel>Confirm Password</FormLabel>
            <Input type="password" name="confirmPassword" required />
          </FormControl>
          <Button type="submit" colorScheme="teal" width="full" mb={4}>
            Sign Up
          </Button>
          {message && (
            <Text color="red.500" textAlign="center" mb={4}>
              {message}
            </Text>
          )}
        </form>
        <Link href="/login" passHref>
          <Button variant="link" colorScheme="teal" width="full">
            Already have an account? Sign In
          </Button>
        </Link>
      </Box>
    </Center>
  );
}
