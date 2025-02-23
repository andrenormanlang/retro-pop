"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Flex,
} from "@chakra-ui/react";
import { useUser } from "@/contexts/UserContext";
import ImageUpload from "@/components/ImageUpload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Import your reusable RichTextEditor component
import RichTextEditor from "@/components/RichTextEditor";

// Define Zod schema for form validation
const postSchema = z.object({
  content: z.string().min(6, "Content is required"),
  imageUrl: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

const CreatePostPage = (props: { params: Promise<{ id: string; topicId: string }> }) => {
  const params = use(props.params);
  const { id, topicId } = params;
  const { user } = useUser();
  const router = useRouter();
  const toast = useToast();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<PostFormData>({
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
        <Button
          colorScheme="teal"
          onClick={() => router.push(`/forums/${id}/topics/${topicId}`)}
        >
          Back to Posts
        </Button>
      </Flex>
      <Heading mb={4}>Create Post</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.content}>
            <FormLabel>Content</FormLabel>
            <RichTextEditor
              value={watch("content")}
              onChange={(value) => setValue("content", value)}
              style={{ height: "400px" }}
            />
            <FormErrorMessage>
              {errors.content && errors.content.message}
            </FormErrorMessage>
          </FormControl>
          <ImageUpload
            onUpload={(url) => {
              setImageUrl(url);
              setValue("imageUrl", url);
            }}
          />
          <Button colorScheme="teal" type="submit">
            Create Post
          </Button>
        </VStack>
      </form>
    </Container>
  );
};

export default CreatePostPage;
