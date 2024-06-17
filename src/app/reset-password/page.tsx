import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Box, FormControl, FormLabel, Input, Button, Text, useColorModeValue } from "@chakra-ui/react";
import Link from 'next/link';

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: { message: string; code: string };
}) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return redirect('/');
  }

  const resetPassword = async (formData: FormData) => {
    'use server';

    const password = formData.get('password') as string;
    const supabase = createClient();

    if (searchParams.code) {
      const { error } = await supabase.auth.exchangeCodeForSession(searchParams.code);

      if (error) {
        return redirect(`/reset-password?message=Unable to reset Password. Link expired!`);
      }
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.log(error);
      return redirect(`/reset-password?message=Unable to reset Password. Try again!`);
    }

    redirect(`/login?message=Your Password has been reset successfully. Sign in.`);
  };


  return (
    <Box  p={4}>


      <Box w="full" maxW="md" mx="auto" mt={4}  p={8} rounded="md" boxShadow="lg">
        <form action={resetPassword}>
          <FormControl id="password" mb={6}>
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              name="password"
            //   placeholder="••••••••"
              required
              bg="grey.200"
              _placeholder={{ color: 'gray.500' }}
            />
          </FormControl>

          <FormControl id="confirmPassword" mb={6}>
            <FormLabel>Confirm New Password</FormLabel>
            <Input
              type="password"
              name="confirmPassword"
            //   placeholder="••••••••"
              required
              bg="grey.200"
              _placeholder={{ color: 'gray.500' }}
            />
          </FormControl>

          <Button type="submit" colorScheme="green" mb={2} w="full">
            Reset
          </Button>

          {searchParams?.message && (
            <Text mt={4} p={4} bg="gray.100" textAlign="center" borderRadius="md">
              {searchParams.message}
            </Text>
          )}
        </form>
      </Box>
    </Box>
  );
}


