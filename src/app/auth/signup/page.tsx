import React, { Suspense } from "react";
import SignupForm from "@/components/auth/SignupServer";
import { Spinner, Center } from "@chakra-ui/react";

export default function Signup() {
  return (
    <Suspense fallback={
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    }>
      <SignupForm />
    </Suspense>
  );
}



// "use client";

// import React, { useEffect, useState, Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { z } from 'zod';
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Box,
//   Heading,
//   FormControl,
//   FormLabel,
//   Input,
//   Button,
//   Text,
//   Center,
//   useColorModeValue,
//   Spinner,
//   useToast,
//   InputGroup,
//   InputRightElement,
//   IconButton,
// } from "@chakra-ui/react";
// import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
// import Link from "next/link";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import { useForm, SubmitHandler } from "react-hook-form";

// const passwordValidation = new RegExp(
//   /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{6,}$/
// );

// const validationSchema = z.object({
//   email: z
//     .string()
//     .min(5, { message: 'Must have at least 5 characters' })
//     .email({ message: 'Must be a valid email' }),
//   password: z
//     .string()
//     .min(6, { message: 'Must have at least 6 characters long' })
//     .regex(passwordValidation, { message: 'Your password must have at least one uppercase letter, one special character, and one number' }),
//   confirmPassword: z.string().min(6, { message: 'Must have at least 6 characters' }),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords must match",
//   path: ["confirmPassword"], // Set the path of the error
// });

// type SchemaProps = z.infer<typeof validationSchema>;

// export default function Signup() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const message = searchParams.get("message");
//   const toast = useToast();
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<SchemaProps>({
//     resolver: zodResolver(validationSchema)
//   });

//   const supabase = createClientComponentClient();

//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

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

//     const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
//       if (event === "SIGNED_IN") {
//         setIsAuthenticated(true);
//         router.push("/");
//       }
//     });

//     // Cleanup subscription on unmount
//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, [router, supabase.auth]);

//   const signUp: SubmitHandler<SchemaProps> = async (data) => {
//     const { email, password } = data;

//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         emailRedirectTo: `${window.location.origin}/api/auth/callback`,
//       },
//     });

//     if (error) {
//       toast({
//         title: "Sign up error",
//         description: error.message,
//         status: "error",
//         duration: 9000,
//         isClosable: true,
//       });
//     } else {
//       toast({
//         title: "Sign up success",
//         description: `Check your email (${email}) to continue sign in process`,
//         status: "success",
//         duration: 9000,
//         isClosable: true,
//       });
//       // router.push(`/auth/confirm?message=Check email(${email}) to continue sign in process`);
//     }
//   };

//   if (loading) {
//     return (
//       <Center>
//         <Spinner size="xl" />
//       </Center>
//     );
//   }

//   if (isAuthenticated) {
//     return router.push(`/auth/login`);
//   }

//   return (
//     <Center>
//       <Box
//         p={8}
//         maxWidth="400px"
//         width="full"
//         // boxShadow="md"
//         // borderRadius="md"
//         // bg={bgBox}
//       >
//         <Heading as="h1" size="lg" mb={6} textAlign="center">
//           Sign Up
//         </Heading>
//         <form onSubmit={handleSubmit(signUp)}>
//           <FormControl id="email" mb={4} isInvalid={!!errors.email}>
//             <FormLabel>Email</FormLabel>
//             <Input type="email" {...register('email', { required: true })} />
//             {errors.email && <Text color="red.500">{errors.email.message}</Text>}
//           </FormControl>
//           <FormControl id="password" mb={4} isInvalid={!!errors.password}>
//             <FormLabel>Password</FormLabel>
//             <InputGroup>
//               <Input
//                 type={showPassword ? 'text' : 'password'}
//                 {...register('password')}
//                 name="password"
//                 required
//               />
//               <InputRightElement>
//                 <IconButton
//                   icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
//                   onClick={() => setShowPassword(!showPassword)}
//                   variant="ghost"
//                   aria-label="Toggle Password Visibility"
//                 />
//               </InputRightElement>
//             </InputGroup>
//             {errors.password && <Text color="red.500">{errors.password.message}</Text>}
//           </FormControl>
//           <FormControl id="confirmPassword" mb={4} isInvalid={!!errors.confirmPassword}>
//             <FormLabel>Confirm Password</FormLabel>
//             <InputGroup>
//               <Input
//                 type={showConfirmPassword ? 'text' : 'password'}
//                 {...register('confirmPassword')}
//                 name="confirmPassword"
//                 required
//               />
//               <InputRightElement>
//                 <IconButton
//                   icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   variant="ghost"
//                   aria-label="Toggle Confirm Password Visibility"
//                 />
//               </InputRightElement>
//             </InputGroup>
//             {errors.confirmPassword && <Text color="red.500">{errors.confirmPassword.message}</Text>}
//           </FormControl>
//           <Button type="submit" colorScheme="teal" width="full" mb={4}>
//             Sign Up
//           </Button>
//           {message && (
//             <Text color="red.500" textAlign="center" mb={4}>
//               {message}
//             </Text>
//           )}
//         </form>
//         <Link href="/auth/login" passHref>
//           <Button type="button" variant="link" colorScheme="teal" width="full">
//             Already have an account? Sign In
//           </Button>
//         </Link>
//       </Box>
//     </Center>
//   );
// }
