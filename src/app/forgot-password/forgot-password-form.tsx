'use client';

import { useToast, FormControl, FormLabel, Input, Button, Box, Text, Link } from '@chakra-ui/react';
import { ZodError, z } from 'zod';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FormEvent, useState } from "react";

export const email = (name = "Email") => require(name).email(`${name} is not valid`);
export const ForgotPasswordSchema = z.object({
  email: email(),
});

type FormData = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const supabase = createClientComponentClient();
  const toast = useToast();
  const [formData, setFormData] = useState<FormData>({ email: "" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { email } = formData;

    try {
      ForgotPasswordSchema.parse({ email });
    } catch (err) {
      if (err instanceof ZodError) {
        err.errors.forEach((error) => {
          toast({
            title: "Validation Error",
            description: error.message,
            status: "error",
            duration: 9000,
            isClosable: true,
          });
        });
        return;
      }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    setFormData({ email: "" });
    toast({
      title: "Success",
      description: "Please check your email for a password reset link to log into the website.",
      status: "success",
      duration: 9000,
      isClosable: true,
    });
  };

  return (
    <Box width={["90%", "80%", "60%", "50%", "30%"]} p={6} rounded="lg">
      <Text fontSize="4xl" fontWeight="semibold" mb={4}>Forgot Password</Text>
      <Text mb={4}>Looks like you´ve forgotten your password</Text>
      <form onSubmit={handleSubmit}>
        <FormControl isInvalid={!!formData.email}>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(ev) => setFormData({ ...formData, email: ev.target.value })}
          />
        </FormControl>
        <Button mt={6} colorScheme="blue" type="submit">Send</Button>
      </form>
      <Text pt={4} textAlign="center">
        Not registered yet?{" "}
        <Link href="/auth/signup" color="blue.500">Create an account</Link>
      </Text>
    </Box>
  );
}
