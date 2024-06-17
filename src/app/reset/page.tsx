'use client';

import { supabase} from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
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
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const confirmPasswords = async () => {
    const { password, confirmPassword } = data;
    if (password !== confirmPassword) return alert(`Your passwords are incorrect`);

    const { data: resetData, error } = await supabase
      .auth
      .updateUser({
        password: data.password
      });

    if (resetData) {
      router.push('/')
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
