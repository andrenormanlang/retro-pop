import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
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
import { redirect } from 'next/navigation';

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
		const supabase = createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(
		  searchParams.code
		);

		if (error) {
		  return redirect(
			`/reset-password?message=Unable to reset Password. Link expired!`
		  );
		}
	  }

	  const { error } = await supabase.auth.updateUser({
		password,
	  });

	  if (error) {
		console.log(error);
		return redirect(
		  `/reset-password?message=Unable to reset Password. Try again!`
		);
	  }

	  redirect(
		`/login?message=Your Password has been reset successfully. Sign in.`
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
        <form action={resetPassword}>
          <FormControl id="password" mb={4}>
            <FormLabel>New Password</FormLabel>
            <Input type="password" name="password" placeholder="••••••••" required />
          </FormControl>
          <FormControl id="confirmPassword" mb={4}>
            <FormLabel>Confirm New Password</FormLabel>
            <Input type="password" name="confirmPassword" placeholder="••••••••" required />
          </FormControl>
          <Button type="submit" colorScheme="teal" width="full" mb={4}>
            Reset
          </Button>
          {searchParams?.message && (
            <Text color="red.500" textAlign="center" mt={4}>
              {searchParams.message}
            </Text>
          )}
        </form>
      </Box>
    </Center>
  );
}
