// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   Box,
//   Heading,
//   FormControl,
//   FormLabel,
//   Input,
//   Button,
//   Text,
//   Center,
//   Spinner,
//   useColorModeValue,
//   useToast,
// } from "@chakra-ui/react";
// import Link from "next/link";
// import { createClient } from "@/utils/supabase/client";

// export default function Login() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const message = searchParams.get("message");

//   const supabase = createClient();

//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const toast = useToast(); // Initialize the useToast hook

//   const bgCenter = useColorModeValue("gray.50", "gray.800");
//   const bgBox = useColorModeValue("white", "gray.700");

//   useEffect(() => {
//     const checkUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         setIsAuthenticated(true);
//         router.push("/");
//       } else {
//         setLoading(false);
//       }
//     };
//     checkUser();

// 	const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
// 		if (event === "SIGNED_IN") {
// 		  setIsAuthenticated(true);
// 		  router.refresh(); // Refresh the browser
// 		  // router.push("/");
// 		  // window.location.reload();
// 		}
// 	  });

// 	  // Cleanup subscription on unmount
// 	  return () => {
// 		authListener.subscription.unsubscribe();
// 	  };
//   }, [router, supabase.auth]);

//   const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     const formData = new FormData(event.currentTarget);
//     const email = formData.get("email") as string;
//     const password = formData.get("password") as string;

//     const { data, error } = await supabase.auth.signInWithPassword({ email, password });

//     if (error) {
//       toast({
//         title: "Authentication Failed",
//         description: error.message,
//         status: "error",
//         duration: 9000,
//         isClosable: true,
//         position: "top"
//       });
//       router.push("/auth/login?message=Could not authenticate user");
//     } else {
//       setIsAuthenticated(true);
//       router.refresh(); // Refresh the browser
//       toast({
//         title: "Logged In Successfully",
//         description: "You have successfully logged in.",
//         status: "success",
//         duration: 5000,
//         isClosable: true,
//         position: "top"
//       });
//       router.push("/");
// 	//   window.location.reload();
//     }
//   };

//   if (loading) {
//     return (
//       <Center minH="100vh">
//         <Spinner size="xl" />
//       </Center>
//     );
//   }

//   if (isAuthenticated) {
// 	window.location.reload();
//     return null; // Do not render anything if the user is authenticated
//   }

//   return (
//     <Center>
//       <Box
//         p={8}
//         maxWidth="400px"
//         width="full"
//         boxShadow="md"
//         borderRadius="md"
//       >
//         <Heading as="h1" size="lg" mb={6} textAlign="center">
//           Sign In
//         </Heading>
//         <form onSubmit={signIn}>
//           <FormControl id="email" mb={4}>
//             <FormLabel>Email</FormLabel>
//             <Input type="email" name="email" required />
//           </FormControl>
//           <FormControl id="password" mb={4}>
//             <FormLabel>Password</FormLabel>
//             <Input type="password" name="password" required />
//           </FormControl>
//           <Button type="submit" colorScheme="teal" width="full" mb={4}>
//             Sign In
//           </Button>
//           {message && (
//             <Text color="red.500" textAlign="center" mb={4}>
//               {message}
//             </Text>
//           )}
//         </form>
//         <Link href="/auth/forgot-password" passHref>
//           <Button variant="link" colorScheme="teal" width="full" mb={2}>
//             Forgotten Password?
//           </Button>
//         </Link>
// <Link href="/auth/signup" passHref>
//   <Button variant="link" colorScheme="teal" width="full">
//     Don’t have an Account? Sign Up
//   </Button>
// </Link>
//       </Box>
//     </Center>
//   );
// }

"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	Box,
	Heading,
	FormControl,
	FormLabel,
	Input,
	Button,
	Text,
	Center,
	Spinner,
	useColorModeValue,
	useToast,
} from "@chakra-ui/react";
import { User } from "@supabase/supabase-js"; // Import the User type

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null); // Use User | null type
	const [loading, setLoading] = useState(true);
	const toast = useToast();

	const supabase = createClient();

	useEffect(() => {
		async function getUser() {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setUser(user);
			setLoading(false);
		}

		getUser();
	}, []);

	const handleSignUp = async () => {
		const res = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${location.origin}/auth/callback`,
			},
		});
		setUser(res.data.user);
		router.push("/"); // Navigate to the homepage
		setTimeout(() => window.location.reload(), 1000);
		setEmail("");
		setPassword("");
	};

	const handleSignIn = async () => {
		const res = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (res.error) {
			toast({
				title: "Authentication Failed",
				description: res.error.message,
				status: "error",
				duration: 9000,
				isClosable: true,
				position: "top",
			});
		} else {
			setUser(res.data.user);
			router.push("/"); // Navigate to the homepage
			setTimeout(() => window.location.reload(), 1000); // Refresh after navigation
			setEmail("");
			setPassword("");
			toast({
				title: "Logged In Successfully",
				description: "You have successfully logged in.",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
		}
	};

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.refresh();
		setUser(null);
	};

	if (loading) {
		return (
			<Center minH="100vh">
				<Spinner size="xl" />
			</Center>
		);
	}

	if (user) {
		return (
			<Center>
				<Box p={8} maxWidth="400px" width="full" boxShadow="md" borderRadius="md" textAlign="center">
					<Heading as="h1" size="lg" mb={6}>
						You are already logged in
					</Heading>
					<Button onClick={handleLogout} colorScheme="red" width="full">
						Logout
					</Button>
				</Box>
			</Center>
		);
	}

	return (
		<Center>
			<Box p={8} maxWidth="400px" width="full" boxShadow="md" borderRadius="md">
				<Heading as="h1" size="lg" mb={6} textAlign="center">
					Sign In
				</Heading>
				<FormControl id="email" mb={4}>
					<FormLabel>Email</FormLabel>
					<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
				</FormControl>
				<FormControl id="password" mb={4}>
					<FormLabel>Password</FormLabel>
					<Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
				</FormControl>
				{/* <Button
                    onClick={handleSignUp}
                    colorScheme="blue"
                    width="full"
                    mb={4}
                >
                    Sign Up
                </Button> */}
				<Button onClick={handleSignIn} colorScheme="teal" width="full">
					Sign In
				</Button>
				<Link href="/auth/signup" passHref>
					<Button variant="link" colorScheme="teal" width="full" mt={4}>
						Don’t have an Account? Sign Up
					</Button>
				</Link>
			</Box>
		</Center>
	);
}
