"use client";

import React, { useEffect, useState } from "react";
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
  Spinner,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const supabase = createClient();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast(); // Initialize the useToast hook

  const bgCenter = useColorModeValue("gray.50", "gray.800");
  const bgBox = useColorModeValue("white", "gray.700");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        router.push("/");
      } else {
        setLoading(false);
      }
    };
    checkUser();

	const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
		if (event === "SIGNED_IN") {
		  setIsAuthenticated(true);
		  router.refresh(); // Refresh the browser
		  // router.push("/");
		  // window.location.reload();
		}
	  });

	  // Cleanup subscription on unmount
	  return () => {
		authListener.subscription.unsubscribe();
	  };
  }, [router, supabase.auth]);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top"
      });
      router.push("/auth/login?message=Could not authenticate user");
    } else {
      setIsAuthenticated(true);
      router.refresh(); // Refresh the browser
      toast({
        title: "Logged In Successfully",
        description: "You have successfully logged in.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top"
      });
      router.push("/");
	//   window.location.reload();
    }
  };

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (isAuthenticated) {
	window.location.reload();
    return null; // Do not render anything if the user is authenticated
  }

  return (
    <Center>
      <Box
        p={8}
        maxWidth="400px"
        width="full"
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
        <Link href="/auth/forgot-password" passHref>
          <Button variant="link" colorScheme="teal" width="full" mb={2}>
            Forgotten Password?
          </Button>
        </Link>
        <Link href="/auth/signup" passHref>
          <Button variant="link" colorScheme="teal" width="full">
            Don’t have an Account? Sign Up
          </Button>
        </Link>
      </Box>
    </Center>
  );
}
