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

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      router.push("/login?message=Could not authenticate user");
    } else {
      router.push("/"); // Navigate to home page
      window.location.reload(); // Refresh the browser
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
          Sign In
        </Heading>
        <form onSubmit={signIn}>
          <FormControl id="email" mb={4}>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" required />
          </FormControl>
          <FormControl id="password" mb={4}>
            <FormLabel>Password</FormLabel>
            <Input type="password" name="password" required />
          </FormControl>
          <Button type="submit" colorScheme="teal" width="full" mb={4}>
            Sign In
          </Button>
          {message && (
            <Text color="red.500" textAlign="center" mb={4}>
              {message}
            </Text>
          )}
        </form>
        <Link href="/forgot-password" passHref>
          <Button variant="link" colorScheme="teal" width="full" mb={2}>
            Forgotten Password?
          </Button>
        </Link>
        <Link href="/signup" passHref>
          <Button variant="link" colorScheme="teal" width="full">
            Don’t have an Account? Sign Up
          </Button>
        </Link>
      </Box>
    </Center>
  );
}
