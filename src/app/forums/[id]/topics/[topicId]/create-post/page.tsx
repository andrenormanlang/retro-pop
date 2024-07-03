'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { Box, Button, Container, Heading, Textarea, VStack, useToast } from "@chakra-ui/react";
import { useUser } from "@/contexts/UserContext";

const CreatePostPage = ({ params }: { params: { forumId: string, topicId: string } }) => {
  const { forumId, topicId } = params;
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const { user } = useUser();
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async () => {
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

    const { data, error } = await supabase
      .from("posts")
      .insert([{ topic_id: topicId, content, image_url: image ? URL.createObjectURL(image) : null, created_by: user.id }]);

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
      router.push(`/forums/${forumId}/topics/${topicId}`);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={4}>Create Post</Heading>
      <VStack spacing={4} align="stretch">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          size="sm"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
        />
        <Button colorScheme="teal" onClick={handleSubmit}>
          Create Post
        </Button>
      </VStack>
    </Container>
  );
};

export default CreatePostPage;

