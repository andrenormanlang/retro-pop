"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
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
  Spinner,
} from "@chakra-ui/react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useForm, SubmitHandler } from "react-hook-form";

const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
);

const validationSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Must have at least 1 character' })
    .email({ message: 'Must be a valid email' }),
  password: z
    .string()
    .min(1, { message: 'Must have at least 1 character' })
    .regex(passwordValidation, { message: 'Your password is not valid' }),
  confirmPassword: z.string().min(1, { message: 'Must have at least 1 character' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"], // Set the path of the error
});

type SchemaProps = z.infer<typeof validationSchema>;

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchemaProps>({
    resolver: zodResolver(validationSchema)
  });

  const supabase = createClient();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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
        router.push("/");
      }
    });

    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const signUp: SubmitHandler<SchemaProps> = async (data) => {
    const { email, password } = data;

    console.log('Signing up with email:', email);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      router.push("/signup?message=Could not authenticate user");
    } else {
      router.push(`/confirm?message=Check email(${email}) to continue sign in process`);
    }
  };

  if (loading) {
    return (
      <Center>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (isAuthenticated) {
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
        bg={bgBox}
      >
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Sign Up
        </Heading>
        <form onSubmit={handleSubmit(signUp)}>
          <FormControl id="email" mb={4} isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input type="email" {...register('email', { required: true })} />
            {errors.email && <Text color="red.500">{errors.email.message}</Text>}
          </FormControl>
          <FormControl id="password" mb={4} isInvalid={!!errors.password}>
            <FormLabel>Password</FormLabel>
            <Input type="password" {...register('password')} name="password" required />
            {errors.password && <Text color="red.500">{errors.password.message}</Text>}
          </FormControl>
          <FormControl id="confirmPassword" mb={4} isInvalid={!!errors.confirmPassword}>
            <FormLabel>Confirm Password</FormLabel>
            <Input type="password" {...register('confirmPassword')} name="confirmPassword" required />
            {errors.confirmPassword && <Text color="red.500">{errors.confirmPassword.message}</Text>}
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
          <Button type="button" variant="link" colorScheme="teal" width="full">
            Already have an account? Sign In
          </Button>
        </Link>
      </Box>
    </Center>
  );
}
