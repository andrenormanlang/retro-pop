// import { redirect } from "next/navigation";
// import { headers } from "next/headers";
// import { Box, Heading, FormControl, FormLabel, Input, Button, Text, Center, useColorModeValue } from "@chakra-ui/react";
// import Link from "next/link";
// import { createClient } from "@/utils/supabase/server"; // Make sure this points to the server supabase client

// export default async function ForgotPassword({ searchParams }: { searchParams: { message: string } }) {
// 	const supabase = createClient();

// 	const {
// 		data: { session },
// 	} = await supabase.auth.getSession();

// 	if (session) {
// 		return redirect("/");
// 	}

// 	//   const confirmReset = async (formData: FormData) => {
// 	//     'use server';

// 	//     const supabase = createClient();

// 	//     const headersList = headers();
// 	//     const email = formData.get('email') as string;
// 	//     const origin = headersList.get('origin');

// 	//     if (!origin) {
// 	//       return redirect('/forgot-password?message=Could not determine origin');
// 	//     }

// 	//     const { error } = await supabase.auth.resetPasswordForEmail(email, {
// 	//       redirectTo: `${origin}/reset-password`,
// 	//     });

// 	//     if (error) {
// 	//       return redirect('/forgot-password?message=Could not authenticate user');
// 	//     }

// 	//     return redirect(
// 	//       '/confirm?message=Password Reset link has been sent to your email address'
// 	//     );
// 	//   };

// 	const confirmReset = async (formData: FormData) => {
// 		"use server";

// 		const origin = headers().get("origin");
// 		const email = formData.get("email") as string;
// 		const supabase = createClient();

// 		const { error } = await supabase.auth.resetPasswordForEmail(email, {
// 			redirectTo: `${origin}/reset-password`,
// 		});

// 		if (error) {
// 			return redirect("/forgot-password?message=Could not authenticate user");
// 		}

// 		return redirect("/confirm?message=Password Reset link has been sent to your email address");
// 	};

// 	return (
// 		<Center>
// 			<Box p={8} maxWidth="400px" width="full" boxShadow="md" borderRadius="md">
// 				<Heading as="h1" size="lg" mb={6} textAlign="center">
// 					Reset Password
// 				</Heading>
// 				<form action={confirmReset}>
// 					<FormControl id="email" mb={4}>
// 						<FormLabel>Enter Email Address</FormLabel>
// 						<Input type="email" name="email" required />
// 					</FormControl>
// 					<Button type="submit" colorScheme="teal" width="full" mb={4}>
// 						Confirm
// 					</Button>
// 					{searchParams?.message && (
// 						<Text color="red.500" textAlign="center" mb={4}>
// 							{searchParams.message}
// 						</Text>
// 					)}
// 				</form>
// 				<Link href="/login" passHref>
// 					<Button variant="link" colorScheme="teal" width="full">
// 						Remember your password? Sign in
// 					</Button>
// 				</Link>
// 			</Box>
// 		</Center>
// 	);
// }

'use client';

import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";

interface FormData {
  email: string;
  password: string;
}

export default function ForgotPassword() {
  const [data, setData] = useState<FormData>({
    email: '',
    password: ''
  });

  const [resetPassword, setResetPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const toast = useToast();

  const sendResetPassword = async () => {
    try {
      const { data: resetData, error } = await supabase
        .auth
        .resetPasswordForEmail(data.email, {
          redirectTo: `${window.location.href}reset`
        //   redirectTo: `/reset`
        });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast({
        title: "Success!",
        description: "Check your email to reset your password.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box maxW="400px" mx="auto" p={4}>
      {resetPassword ? (
        <VStack spacing={4}>
          <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </FormControl>
          {success && (
            <Text bg="green.100" color="green.600" p={2} borderRadius="md">
              Success! Check your email to reset your password.
            </Text>
          )}
          <Button colorScheme="blue" onClick={sendResetPassword}>
            Reset my password
          </Button>
        </VStack>
      ) : null}
      <Text
        mt={4}
        cursor="pointer"
        textDecoration="underline"
        onClick={() => setResetPassword(!resetPassword)}
      >
        {resetPassword ? 'Login' : 'Reset my password'}
      </Text>
    </Box>
  );
}
