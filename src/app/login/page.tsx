import {
	Box,
	Heading,
	FormControl,
	FormLabel,
	Input,
	Button,
	Center,
	Text,
	useColorModeValue,
  } from "@chakra-ui/react";
  import { createClient } from '@/utils/supabase/server';
  import Link from 'next/link';
  import { redirect } from 'next/navigation';

  export default async function Login({
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

	const signIn = async (formData: FormData) => {
	  'use server';

	  const email = formData.get('email') as string;
	  const password = formData.get('password') as string;
	  const supabase = createClient();

	  const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	  });

	  if (error) {
		return redirect('/login?message=Could not authenticate user');
	  }

	  return redirect('/');
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
			Sign In
		  </Heading>
		  <form action={signIn}>
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

			{searchParams?.message && (
			  <Text mt={4} p={4} bg="gray.100" textAlign="center" borderRadius="md">
				{searchParams.message}
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

