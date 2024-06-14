import { redirect } from 'next/navigation';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Center,
} from "@chakra-ui/react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default async function ForgotPassword({
	searchParams,
  }: {
	searchParams: { message: string };
  }){
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    return redirect('/');
  }

  const confirmReset = async (formData: FormData) => {
    'use server';

    const email = formData.get('email') as string;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    });

    if (error) {
      return redirect('/forgot-password?message=Could not authenticate user');
    }

    return redirect(
      '/confirm?message=Password Reset link has been sent to your email address'
    );
  };

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
          Reset Password
        </Heading>
        <form action={confirmReset}>
          <FormControl id="email" mb={4}>
            <FormLabel>Enter Email Address</FormLabel>
            <Input type="email" name="email" required />
          </FormControl>
          <Button type="submit" colorScheme="teal" width="full" mb={4}>
            Confirm
          </Button>
          {searchParams?.message && (
            <Text color="red.500" textAlign="center" mb={4}>
              {searchParams.message}
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
