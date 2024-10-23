'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { z, ZodError } from "zod";
import { useDispatch } from 'react-redux';
import { setAccessToken } from '@/store/authSlice';

const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const validationSchema = z.object({
  email: z.string().email("Must be a valid email"),
  password: passwordSchema,
});

interface LoginProps {
  message?: string;
}

export default function LoginServer({ message }: LoginProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const supabase = createClient();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

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
        router.refresh();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { email, password } = formData;

    try {
      validationSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof ZodError) {
        err.errors.forEach((error) => {
          toast({
            title: "Validation Error",
            description: error.message,
            status: "error",
            duration: 9000,
            isClosable: true,
          });
        });
        return;
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      router.push("/auth/login?message=Could not authenticate user");
    } else {
      dispatch(setAccessToken(data.session.access_token));
      setIsAuthenticated(true);
      router.refresh();
      toast({
        title: "Logged In Successfully",
        description: "You have successfully logged in.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      router.push("/");
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
    return null;
  }

  return (
    <Center bg={bgCenter} minH="100vh">
      <Box
        p={8}
        maxWidth="400px"
        width="full"
        boxShadow="md"
        borderRadius="md"
        bg={bgBox}
      >
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Sign In
        </Heading>
        <form onSubmit={signIn}>
          <FormControl id="email" mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormControl>
          <FormControl id="password" mb={4}>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <InputRightElement>
                <IconButton
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowPassword(!showPassword)}
                  variant="ghost"
                  aria-label="Toggle Password Visibility"
                />
              </InputRightElement>
            </InputGroup>
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
