'use client';

import { useToast, FormControl, FormLabel, Input, Button, Box, Text, Link } from '@chakra-ui/react';
import { FormEvent, useState } from "react";
import { z, ZodError } from 'zod';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const emailSchema = z.string().email("Email is not valid");
const ForgotPasswordSchema = z.object({
  email: emailSchema,
});

type FormData = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const supabase = createClientComponentClient();
  const toast = useToast();
  const [formData, setFormData] = useState<FormData>({ email: "" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      ForgotPasswordSchema.parse(formData);
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

    const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
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
    <Box width={["90%", "80%", "60%", "50%", "30%"]} p={8} maxWidth="400px" boxShadow="md" borderRadius="md" >
      <Text fontSize="xl" fontWeight="semibold" mb={4}>Forgot Password</Text>
      <Text mb={4}>Looks like you´ve forgotten your password</Text>
      <form onSubmit={handleSubmit}>
        <FormControl id="email" isInvalid={!!formData.email}>
          <FormLabel>Email</FormLabel>
          <Input type="email" value={formData.email} onChange={(ev) => setFormData({ ...formData, email: ev.target.value })} />
        </FormControl>
        <Button mt={6} colorScheme="blue" type="submit">Send</Button>
      </form>
      <Text pt={4} textAlign="center">
        Not registered yet? <Link href="/auth/signup" color="blue.500">Create an account</Link>
      </Text>
    </Box>
  );
}
