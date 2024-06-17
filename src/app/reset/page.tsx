'use client';

import { supabase } from "@/utils/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";

interface ResetData {
  password: string;
  confirmPassword: string;
}

export default function Reset() {
  const [data, setData] = useState<ResetData>({
    password: '',
    confirmPassword: ''
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const token = searchParams.get("access_token"); // Assuming the token is named access_token

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast({
          title: "Error",
          description: "No token found in URL.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        router.push('/'); // Redirect to home or login if no token is found
      } else {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, router, toast]);

  const confirmPasswords = async () => {
    const { password, confirmPassword } = data;
    if (password !== confirmPassword) return alert(`Your passwords do not match`);

    const { data: resetData, error } = await supabase.auth.updateUser({
      password: data.password,
      
    });

    if (resetData) {
      router.push('/');
    }
    if (error) console.log(error);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <Box maxW="400px" mx="auto" p={4}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box maxW="400px" mx="auto" p={4}>
      <VStack spacing={4}>
        <FormControl id="password" isRequired>
          <FormLabel>Enter your new password</FormLabel>
          <Input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={data.password}
            onChange={handleChange}
            placeholder="New password"
          />
        </FormControl>
        <FormControl id="confirmPassword" isRequired>
          <FormLabel>Confirm your new password</FormLabel>
          <Input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={data.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
          />
        </FormControl>
        <Text
          cursor="pointer"
          textDecoration="underline"
          onClick={() => setShowPassword(!showPassword)}
          fontSize="sm"
        >
          Show passwords
        </Text>
        <Button colorScheme="blue" onClick={confirmPasswords}>
          Confirm
        </Button>
      </VStack>
    </Box>
  );
}
