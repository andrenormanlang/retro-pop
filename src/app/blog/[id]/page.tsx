'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Box, Container, Heading, useToast, Button, Spinner, Center, Text } from '@chakra-ui/react';
import { BlogPost } from '@/types/blog/blog.type';

const BlogPostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
    if (data) {
      setPost(data as BlogPost);
    } else {
      toast({
        title: 'Error',
        description: error?.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options).replace(',', 'th,');
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
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
      <Box p={4} shadow="md" borderWidth="1px">
        <Button mt={4} mb={4} onClick={() => router.back()}>
          Back
        </Button>
        <Heading as="h1" fontFamily="Bangers, sans-serif" fontWeight="normal">
          {post.title}
        </Heading>
        <Text fontSize="sm" color="gray.500" mb={2}>
          {formatDate(post.created_at)}
        </Text>
        <Box mt={4} dangerouslySetInnerHTML={{ __html: post.content }} />
      </Box>
    </Container>
  );
};

export default BlogPostDetail;
