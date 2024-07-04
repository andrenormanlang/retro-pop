'use client';

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import {
  Box,
  Button,
  Container,
  Heading,
  Textarea,
  VStack,
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Flex,
} from "@chakra-ui/react";
import { useUser } from "@/contexts/UserContext";
import ImageUpload from "@/components/ImageUpload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define Zod schema
const postSchema = z.object({
  content: z.string().min(6, "Content is required"),
  imageUrl: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

const CreatePostPage = ({ params }: { params: { id: string; topicId: string } }) => {
  const { id, topicId } = params; // Using id instead of forumId
  const { user } = useUser();
  const router = useRouter();
  const toast = useToast();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  const onSubmit = async (data: PostFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You need to be signed in to create a post.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const { data: postData, error } = await supabase
      .from("posts")
      .insert([{ topic_id: topicId, content: data.content, image_url: imageUrl, created_by: user.id }]);

    if (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Success",
        description: "Post created successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      router.push(`/forums/${id}/topics/${topicId}`);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Flex justifyContent="space-between" mb={4}>
        <Button colorScheme="teal" onClick={() => router.push(`/forums/${id}/topics/${topicId}`)}>
          Back to Posts
        </Button>
      </Flex>
      <Heading mb={4}>Create Post</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.content}>
            <FormLabel>Content</FormLabel>
            <Textarea
              {...register("content")}
              placeholder="Content"
              size="sm"
            />
            <FormErrorMessage>{errors.content && errors.content.message}</FormErrorMessage>
          </FormControl>
          <ImageUpload onUpload={(url) => {
            setImageUrl(url);
            setValue("imageUrl", url);
          }} />
          <Button colorScheme="teal" type="submit">
            Create Post
          </Button>
        </VStack>
      </form>
    </Container>
  );
};

export default CreatePostPage;
