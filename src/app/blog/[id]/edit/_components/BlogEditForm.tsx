"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Textarea, VStack } from "@chakra-ui/react";

interface Blog {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  is_approved: boolean;
  created_at: string;
  user_id: string;
  image_url: string;
}

interface BlogEditFormProps {
  blog: Blog;
}

export default function BlogEditForm({ blog }: BlogEditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(blog);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your update logic here
    router.push(`/blog/${blog.id}`);
  };

  return (
    <Box maxW="800px" mx="auto" mt={8}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl>
            <FormLabel>Title</FormLabel>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Content</FormLabel>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              minH="200px"
            />
          </FormControl>
          <Button type="submit" colorScheme="blue">
            Update Blog
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
