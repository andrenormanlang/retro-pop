// src/pages/confirm.tsx

"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Center,
  Text,
  useColorModeValue,
  Heading,
  VStack,
  Divider,
} from "@chakra-ui/react";

export default function Confirm() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <Center minH="100vh" bg={useColorModeValue("gray.50", "gray.800")}>
      <Box
        p={8}
        maxWidth="400px"
        width="full"
        bg={useColorModeValue("white", "gray.700")}
        boxShadow="lg"
        borderRadius="lg"
      >
        <VStack spacing={4}>
          <Heading as="h1" size="lg" color="teal.600" textAlign="center">
            Confirmation Required
          </Heading>
          <Divider />
          <Text textAlign="center" fontSize="md" color="gray.600">
            {message}
          </Text>
          <Text textAlign="center" fontSize="sm" color="gray.500">
            Please check your email for further instructions.
          </Text>
        </VStack>
      </Box>
    </Center>
  );
}
