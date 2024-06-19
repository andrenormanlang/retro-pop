'use client';

import { useToast, FormControl, FormLabel, Input, Button, Box, Text } from '@chakra-ui/react';
import { useState, FormEvent } from "react";
import { z, ZodError } from "zod";
import { User, createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Define a Zod schema for password validation directly
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const UpdatePasswordSchema = z.object({
  password: passwordSchema,
  passwordConfirm: passwordSchema
}).superRefine(({ password, passwordConfirm }, ctx) => {
  if (password !== passwordConfirm) {
    ctx.addIssue({
      code: "custom",
      message: "Passwords do not match",
      path: ["passwordConfirm"]
    });
  }
});

type FormData = z.infer<typeof UpdatePasswordSchema>;

export default function PasswordForm({ user }: { user: User | undefined }) {
  const supabase = createClientComponentClient();
  const toast = useToast();
  const [formData, setFormData] = useState<FormData>({ password: "", passwordConfirm: "" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { password, passwordConfirm } = formData;

    try {
      UpdatePasswordSchema.parse({ password, passwordConfirm });
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

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({
        title: "Error Updating Password",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    setFormData({ password: "", passwordConfirm: "" });
    toast({
      title: "Success",
      description: "Your password was updated successfully.",
      status: "success",
      duration: 9000,
      isClosable: true,
    });
  };

  return (
    <Box width={["90%", "80%", "60%", "50%", "30%"]} p={8} maxWidth="400px" boxShadow="md" borderRadius="md" >
      <Text fontSize="xl" fontWeight="semibold" mb={4}>Update Password</Text>
      <Text mb={4}>Hi {user?.email}, enter your new password below and confirm it.</Text>
      <form onSubmit={handleSubmit}>
        <FormControl isInvalid={formData.password !== ""}>
          <FormLabel htmlFor="password">Password</FormLabel>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </FormControl>
        <FormControl isInvalid={formData.passwordConfirm !== ""} mt={4}>
          <FormLabel htmlFor="passwordConfirm">Confirm Password</FormLabel>
          <Input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            value={formData.passwordConfirm}
            onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
          />
        </FormControl>
        <Button colorScheme="blue" mt={6} type="submit">Update Password</Button>
      </form>
    </Box>
  );
}
