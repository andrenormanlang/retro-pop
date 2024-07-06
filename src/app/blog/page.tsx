'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  Text,
  Flex,
  Image,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { BlogPost } from '@/types/blog/blog.type';

const BlogPostList = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchPosts();
    checkAdminStatus();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (data) {
      setPosts(data as BlogPost[]);
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

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
      } else if (data && data.is_admin) {
        setIsAdmin(true);
      }
    }
  };

  const deletePost = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isAdmin) {
      toast({
        title: 'Error',
        description: 'Only admin users can delete blog posts.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchPosts();
    }
  };

  if (loading) {
    return (
      <Container maxW="container.md" py={8}>
        <Center>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="red.500"
            size="xl"
          />
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <Flex justifyContent="space-between" mb={4}>
        {/* <Heading>Blog</Heading> */}
        {isAdmin && <Button onClick={() => router.push('/blog/create')}>New Post</Button>}
      </Flex>
      <VStack spacing={4} align="stretch">
        {posts.map((post) => (
          <Box
            key={post.id}
            p={4}
            shadow="md"
            borderWidth="1px"
            display="flex"
            alignItems="center"
            cursor="pointer"
            _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
            onClick={() => router.push(`/blog/${post.id}`)}
          >
            {post.imageUrl && (
              <Image
                src={post.imageUrl}
                alt={post.title}
                boxSize="150px"
                objectFit="cover"
                mr={4}
              />
            )}
            <Box flex="1">
              <Heading fontSize={'1.5rem'} fontFamily="Bangers, sans-serif" fontWeight="normal">{post.title}</Heading>
              <Text fontSize="sm" color="gray.500">
                {new Date(post.created_at).toLocaleDateString()} {new Date(post.created_at).toLocaleTimeString()}
              </Text>
              <Box mt={4} noOfLines={3} dangerouslySetInnerHTML={{ __html: post.content }} />
              {isAdmin && (
                <Flex mt={4} justifyContent="space-between">
                  <Button onClick={(e) => { e.stopPropagation(); router.push(`/blog/edit/${post.id}`); }}>Edit</Button>
                  <Button onClick={(e) => { e.stopPropagation(); deletePost(post.id); }} colorScheme="red">Delete</Button>
                </Flex>
              )}
            </Box>
          </Box>
        ))}
      </VStack>
    </Container>
  );
};

export default BlogPostList;
