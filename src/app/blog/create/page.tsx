'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/utils/supabase/client';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import ImageUpload from '@/components/ImageUpload';

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Define Zod schema
const postSchema = z.object({
  title: z.string().min(10, 'Title is required'),
  content: z.string().min(100, 'Content is required'),
  imageUrl: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

const CreateBlogPostPage = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  const toast = useToast();
  const supabase = createClient();

  const onSubmit: SubmitHandler<PostFormData> = async (data) => {
    const { error } = await supabase
      .from('blog_posts')
      .insert([{ ...data, imageUrl }]);

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
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={4}>Create Blog Post</Heading>
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
