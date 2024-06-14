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

  // Extract the email part from the message if it follows the format you expect
  const emailRegex = /Check email\((.+?)\)/;
  const emailMatch = message?.match(emailRegex);
  const email = emailMatch ? emailMatch[1] : "";

  return (
    <Center bg={useColorModeValue("gray.50", "gray.800")}>
      <Box
        p={8}
        maxWidth="400px"
        width="full"
        bg={useColorModeValue("white", "black.800")}
        boxShadow="lg"
        borderRadius="lg"
      >
        <VStack spacing={4}>
          <Heading as="h1" size="lg" color="green.600" textAlign="center">
            Confirmation Required
          </Heading>
          <Divider />
          <Text textAlign="center" fontSize="md" color="green.600">
            Check your email <span style={{ fontWeight: 'bold' }}>{email}</span> to continue the sign-in process
          </Text>
          <Text textAlign="center" fontSize="sm" color="red.500">
            Please check your email for further instructions.
          </Text>
        </VStack>
      </Box>
    </Center>
  );
}

