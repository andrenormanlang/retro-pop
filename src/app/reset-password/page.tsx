'use client'

import { supabase } from '@/utils/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, FormControl, FormLabel, Input, Button, Text, useColorModeValue } from "@chakra-ui/react";
import Link from 'next/link';

import { useState } from 'react';

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState(searchParams.get('message') || '');
  const code = searchParams.get('code');

  const resetPassword = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }


    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        setMessage('Unable to reset Password. Link expired!');
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.log(error);
      setMessage('Unable to reset Password. Try again!');
      return;
    }

    setMessage('Your Password has been reset successfully. Sign in.');
    router.push(`/login?message=Your Password has been reset successfully. Sign in.`);
  };

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const formBgColor = useColorModeValue("white", "gray.700");

  return (
    <Box  p={4}>


      <Link href="/" passHref>
        <Button as="a" colorScheme="teal" variant="outline" mb={4}>
          Home
        </Button>
      </Link>

      <Box w="full" maxW="md" mx="auto" mt={4} bg={formBgColor} p={8} rounded="md" boxShadow="lg">
        <form onSubmit={resetPassword}>
          <FormControl id="password" mb={6}>
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              bg="white"
              _placeholder={{ color: 'gray.500' }}
            />
          </FormControl>

          <FormControl id="confirmPassword" mb={6}>
            <FormLabel>Confirm New Password</FormLabel>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              required
              bg="white"
              _placeholder={{ color: 'gray.500' }}
            />
          </FormControl>

          <Button type="submit" colorScheme="green" mb={2} w="full">
            Reset
          </Button>

          {message && (
            <Text mt={4} p={4} bg="red.500" textAlign="center" fontWeight={600} borderRadius="md">
              {message}
            </Text>
          )}
        </form>
      </Box>
    </Box>
  );
}
