"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Box,
  Container,
  Heading,
  useToast,
  Button,
  Center,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { BlogPost } from "@/types/blog/blog.type";
import ComicSpinner from "@/helpers/ComicSpinner";

const BlogPostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();
  const supabase = createClient();

  // Get the current theme (dark or light)
  const { colorMode } = useColorMode();
  // Choose text color based on theme
  const textColor = colorMode === "dark" ? "white" : "black";

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setPost(data as BlogPost);
    } else {
      toast({
        title: "Error",
        description: error?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

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

  if (loading) {
    return (
      <Center h="100vh">
        <ComicSpinner />
      </Center>
    );
  }

  if (!post) {
    return (
      <Container maxW="container.md" py={8}>
        <p>Post not found</p>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <Button mt={4} mb={4} onClick={() => router.back()}>
        Back
      </Button>
      {/*
        We set color={textColor} on the container
        and apply a "post-content" class for styling
      */}
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

        {/* Render the post HTML */}
        <Box mt={4} dangerouslySetInnerHTML={{ __html: post.content }} />
      </Box>

      {/*
        Force any inline color or background
        to be overridden by the parent's color
      */}
      <style jsx>{`
        .post-content * {
          color: inherit !important;
          background-color: transparent !important;
        }
      `}</style>
    </Container>
  );
};

export default BlogPostDetail;
