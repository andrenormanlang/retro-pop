'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/utils/supabase/client';
import {
  Button,
  Center,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import ImageUpload from '@/components/ImageUpload';
import { useUser } from '@/contexts/UserContext';  // Import the user context
import ComicSpinner from '@/helpers/ComicSpinner';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Updated Zod schema (removed author_name as it will be set automatically)
const postSchema = z.object({
  title: z.string().min(10, 'Title is required'),
  content: z.string().min(100, 'Content is required'),
  imageUrl: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

const CreateBlogPostPage = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();  // Get user from context
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });
  const router = useRouter();
  const toast = useToast();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      // Redirect to login page if user is not signed in
      router.push('/login');
    }
  }, [user, router]);

  const onSubmit: SubmitHandler<PostFormData> = async (data) => {
    if (!user) {
        toast({
            title: 'Error',
            description: 'You must be signed in to create a post.',
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
        return;
    }

    const authorName = user.username || user.email || "Anonymous"; // Ensure author_name is never null

    setLoading(true);
    const { error } = await supabase
        .from('blog_posts')
        .insert([{
            ...data,
            imageUrl,
            author_name: authorName,
            author_id: user.id
        }]);

    setLoading(false);

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
            description: 'Post created successfully.',
            status: 'success',
            duration: 5000,
            isClosable: true,
        });
        router.push('/blog');
    }
};


  if (loading) {
    return (
      <Center h="100vh">
        <ComicSpinner />
      </Center>
    );
  }

  if (!user) {
    return null; // or a loading spinner, as the useEffect will redirect
  }

  return (
    <Container maxW="container.md" py={8}>
      <Button mt={4} mb={4} onClick={() => router.back()}>
        Back
      </Button>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.title}>
            <FormLabel>Title</FormLabel>
            <Input {...register('title')} />
            {errors.title && <p>{errors.title.message}</p>}
          </FormControl>
          <FormControl isInvalid={!!errors.content}>
            <FormLabel>Content</FormLabel>
            <ReactQuill
              value={watch('content')}
              onChange={(value) => setValue('content', value)}
              modules={{
                toolbar: [
                  [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                  [{ size: [] }],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
                  ['link', 'image'],
                  [{ 'color': [] }, { 'background': [] }],
                  ['clean'],
                ],
              }}
              formats={[
                'header', 'font', 'size',
                'bold', 'italic', 'underline', 'strike', 'blockquote',
                'list', 'bullet', 'indent',
                'link', 'image',
                'color', 'background',
              ]}
            />
            {errors.content && <p>{errors.content.message}</p>}
          </FormControl>
          <ImageUpload onUpload={(url) => {
            setImageUrl(url);
            setValue('imageUrl', url);
          }} />
          <Button colorScheme="teal" type="submit">
            Create Post
          </Button>
        </VStack>
      </form>
    </Container>
  );
};

export default CreateBlogPostPage;
