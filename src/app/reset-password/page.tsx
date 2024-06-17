import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/router';
import { Box, FormControl, FormLabel, Input, Button, Text, useColorModeValue } from "@chakra-ui/react";
import Link from 'next/link';
import { ReactHTMLElement } from 'react';


export default async function ResetPassword({
	searchParams,
  }: {
	searchParams: { message: string; code: string };
  }) {
  const router = useRouter();

  const resetPassword = async (event) => {
    event!.preventDefault();

    const formData = new FormData(event.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (searchParams.code) {
      const { error } = await supabase.auth.exchangeCodeForSession(searchParams.code);

      if (error) {
        router.push(`/reset-password?message=Unable to reset Password. Link expired!`);
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.log(error);
      router.push(`/reset-password?message=Unable to reset Password. Try again!`);
      return;
    }

    router.push(`/login?message=Your Password has been reset successfully. Sign in.`);
  };

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const formBgColor = useColorModeValue("white", "gray.700");

  return (
    <Box bg={bgColor} minH="100vh" p={4}>
      <Header />

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

          {searchParams?.message && (
            <Text mt={4} p={4} bg="red.500" textAlign="center" fontWeight={600} borderRadius="md">
              {searchParams.message}
            </Text>
          )}
        </form>
      </Box>
    </Box>
  );
}

export async function getServerSideProps(context) {
  const { searchParams } = context.query;
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      searchParams: searchParams || {},
    },
  };
}

