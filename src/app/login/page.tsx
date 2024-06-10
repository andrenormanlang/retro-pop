"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { FormControl, FormLabel, Input, Button, VStack, Box, Heading, Text } from "@chakra-ui/react";
import { login, signup } from './action';
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const formDataObj = new FormData();
    formDataObj.append('email', formData.email);
    formDataObj.append('password', formData.password);
    const { error } = await login(formDataObj);
    if (error) {
      setError(error.message);
    } else {
      router.push('/account');
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const formDataObj = new FormData();
    formDataObj.append('email', formData.email);
    formDataObj.append('password', formData.password);
    const { error } = await signup(formDataObj);
    if (error) {
      setError(error.message);
    } else {
      router.push('/account');
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      bg="gray.50"
      p={6}
    >
      <Box
        w={{ base: "100%", md: "400px" }}
        p={8}
        bg="white"
        boxShadow="md"
        borderRadius="md"
      >
        <Heading as="h1" size="lg" textAlign="center" mb={6}>
          Login
        </Heading>
        {error && <Text color="red.500">{error}</Text>}
        <VStack as="form" spacing={4}>
          <FormControl id="email">
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <Input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </FormControl>
          <Button
            colorScheme="blue"
            width="full"
            type="submit"
            onClick={handleLogin}
          >
            Log in
          </Button>
          <Button
            variant="outline"
            width="full"
            onClick={handleSignup}
          >
            Sign up
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
