import Link from 'next/link';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

import { Box, FormControl, FormLabel, Input, Button, Text, useColorModeValue } from "@chakra-ui/react";

export default async function ForgotPassword({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return redirect('/');
  }

  const confirmReset = async (formData: FormData) => {
    'use server';

    const origin = headers().get('origin');
    const email = formData.get('email') as string;
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      return redirect('/forgot-password?message=Could not authenticate user');
    }

    return redirect(
      '/confirm?message=Password Reset link has been sent to your email address'
    );
  };


  return (
    <Box>
      <Box w="full" maxW="md" mx="auto" mt={4} p={8} rounded="md" boxShadow="lg">
        <form action={confirmReset}>
          <FormControl id="email" mb={6}>
            <FormLabel>Enter Email Address</FormLabel>
            <Input
              name="email"
              placeholder="you@example.com"
              required
              bg="gray.500"
              _placeholder={{ color: 'gray.500' }}
            />
          </FormControl>

          <Button type="submit" colorScheme="green" mb={2} w="full">
            Confirm
          </Button>

          {searchParams?.message && (
            <Text mt={4} p={4} bg="gray.100" textAlign="center" borderRadius="md">
              {searchParams.message}
            </Text>
          )}
        </form>

        <Link href="/login" passHref>
          <Button as="a" variant="link" colorScheme="teal" mt={4} display="block" textAlign="center">
            Remember your password? Sign in
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
