"use client";

import { useRouter } from "next/navigation";
import { Center, Box, Heading, Text, Button } from "@chakra-ui/react";

export default function AuthError() {
  const router = useRouter();

  return (
    <Center minH="100vh" bg="gray.50">
      <Box
        p={8}
        maxWidth="400px"
        width="full"
        bg="white"
        boxShadow="md"
        borderRadius="md"
        textAlign="center"
      >
        <Heading as="h1" size="lg" mb={6} color="red.500">
          Session Expired
        </Heading>
        <Text mb={4}>Your session has expired. Please sign up again to continue.</Text>
        <Button colorScheme="teal" onClick={() => router.push("/signup")}>
          Sign Up
        </Button>
      </Box>
    </Center>
  );
}
