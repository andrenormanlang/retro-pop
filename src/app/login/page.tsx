"use client";

// import { supabase } from "@/utils/supabaseClient";
import { supabase } from "@/utils/supabaseReset";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
	useToast,
	VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface FormData {
	email: string;
	password: string;
}

export default function Login() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const message = searchParams.get("message");

	const [data, setData] = useState<FormData>({
		email: "",
		password: "",
	});
	const [resetPassword, setResetPassword] = useState(false);
	const [success, setSuccess] = useState(false);
	const toast = useToast();

	const supabaseLogin = createClient();

	// const supabase = createClient();

	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);

	const bgCenter = useColorModeValue("gray.50", "gray.800");
	const bgBox = useColorModeValue("white", "gray.700");

	useEffect(() => {
		const checkUser = async () => {
			const {
				data: { user },
			} = await supabaseLogin.auth.getUser();

			if (user) {
				setIsAuthenticated(true);
				router.push("/");
			} else {
				setLoading(false);
			}
		};

		checkUser();

		const { data: authListener } = supabaseLogin.auth.onAuthStateChange((event, session) => {
			if (event === "SIGNED_IN") {
				setIsAuthenticated(true);
				router.refresh(); // Refresh the browser
				// router.push("/");
				// window.location.reload();
			}
		});

		// Cleanup subscription on unmount
		return () => {
			authListener.subscription.unsubscribe();
		};
	}, [router, supabaseLogin.auth]);

	const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		const { data, error } = await supabaseLogin.auth.signInWithPassword({ email, password });

		if (error) {
			router.push("/login?message=Could not authenticate user");
		} else {
			if (data.session) {
				localStorage.setItem("supabase_token", data.session.access_token);
			}
			setIsAuthenticated(true);
			router.refresh(); // Refresh the browser
			router.push("/");
			window.location.reload();
		}
	};

	if (loading) {
		return (
			<Center minH="">
				<Spinner size="xl" />
			</Center>
		);
	}

	if (isAuthenticated) {
		return null; // Do not render anything if the user is authenticated
	}

	const sendResetPassword = async () => {
		try {
			const { data: resetData, error } = await supabase.auth.resetPasswordForEmail(data.email, {
				redirectTo: `${window.location.href}reset`,
			});

			console.log(resetData);
			console.log(error);

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
		<Center>
			<Box p={8} maxWidth="400px" width="full" boxShadow="md" borderRadius="md">
				<Heading as="h1" size="lg" mb={6} textAlign="center">
					Sign In
				</Heading>
				<form onSubmit={signIn}>
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
					{message && (
						<Text color="red.500" textAlign="center" mb={4}>
							{message}
						</Text>
					)}
				</form>
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
				<Button
					mt={4}
					variant="link"
					colorScheme="teal"
					cursor="pointer"
					width="full"
					onClick={() => setResetPassword(!resetPassword)}
				>
					{resetPassword ? "Login" : "Reset my password"}
				</Button>
				<Link href="/signup" passHref>
					<Button variant="link" colorScheme="teal" width="full">
						Don’t have an Account? Sign Up
					</Button>
				</Link>
			</Box>
		</Center>
	);
}
