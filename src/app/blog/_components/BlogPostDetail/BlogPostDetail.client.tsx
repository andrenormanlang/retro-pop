// BlogPostDetail.client.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Container, Button, Box, Heading, Text, Center, useColorMode } from "@chakra-ui/react";
import { BlogPost } from "@/types/blog/blog.type";

interface BlogPostDetailClientProps {
  post: BlogPost;
}

const BlogPostDetailClient: React.FC<BlogPostDetailClientProps> = ({ post }) => {
  const router = useRouter();
  const { colorMode } = useColorMode();
  const textColor = colorMode === "dark" ? "white" : "black";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options).replace(",", "th,");
  };

  return (
    <Container maxW="container.md" py={8}>
      <Button mt={4} mb={4} onClick={() => router.back()}>
        Back
      </Button>
      <Box
        p={4}
        shadow="md"
        borderWidth="1px"
        color={textColor}
        className="post-content"
      >
        <Heading as="h1" fontFamily="Bangers, sans-serif" fontWeight="normal">
          {post.title}
        </Heading>
        <Text fontSize="sm" color="gray.500" mb={2}>
          {formatDate(post.created_at)}
        </Text>
        <Box mt={4} dangerouslySetInnerHTML={{ __html: post.content }} />
      </Box>

      <style jsx>{`
        .post-content * {
          color: inherit !important;
          background-color: transparent !important;
        }
      `}</style>
    </Container>
  );
};

export default BlogPostDetailClient;
