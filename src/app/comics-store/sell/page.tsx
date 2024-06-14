'use client';

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/utils/supabase/client";
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, Spinner, Alert, AlertIcon, Center, Text } from "@chakra-ui/react";
import ImageUpload from './image-upload';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@supabase/supabase-js';

// Define validation schema
const validationSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  main_artist: z.string().min(1, { message: 'Main artist is required' }),
  publisher: z.string().min(1, { message: 'Publisher is required' }),
  release_date: z.string().min(1, { message: 'Release date is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  price: z.preprocess((val) => parseFloat(val as string), z.number().positive({ message: 'Price must be positive' })),
  image: z.string().optional(),
  main_writer: z.string().min(1, { message: 'Main writer is required' }),
});

type FormData = z.infer<typeof validationSchema>;

export default function ComicForm() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      title: '',
      main_artist: '',
      publisher: '',
      release_date: '',
      description: '',
      price: 0,
      image: '',
      main_writer: '',
    }
  });

  useEffect(() => {
    // Fetch the current user
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const id = uuidv4();

      const { error } = await supabase.from("comics-sell").insert([{
        id,
        ...data,
        image: imageURL,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,  // Include the user ID here
      }]);

      if (error) throw error;
      alert("Comic book posted for sale!");
      reset();
    } catch (error) {
      setError("Error posting comic book!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center>
      <Box
        p={8}
        maxWidth={{ base: "90%", md: "400px" }}
        width="full"
        boxShadow="md"
        borderRadius="md"
      >
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Sell Comic Book
        </Heading>
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}
        {loading ? (
          <Center height="100%">
            <Spinner />
          </Center>
        ) : (
          <VStack spacing={4} as="form" onSubmit={handleSubmit(onSubmit)}>
            <FormControl id="title" isInvalid={!!errors.title}>
              <FormLabel>Title</FormLabel>
              <Input
                type="text"
                {...register("title")}
              />
              {errors.title && <Text color="red.500">{errors.title.message}</Text>}
            </FormControl>
            <FormControl id="main_artist" isInvalid={!!errors.main_artist}>
              <FormLabel>Main Artist</FormLabel>
              <Input
                type="text"
                {...register("main_artist")}
              />
              {errors.main_artist && <Text color="red.500">{errors.main_artist.message}</Text>}
            </FormControl>
            <FormControl id="publisher" isInvalid={!!errors.publisher}>
              <FormLabel>Publisher</FormLabel>
              <Input
                type="text"
                {...register("publisher")}
              />
              {errors.publisher && <Text color="red.500">{errors.publisher.message}</Text>}
            </FormControl>
            <FormControl id="release_date" isInvalid={!!errors.release_date}>
              <FormLabel>Release Date</FormLabel>
              <Input
                type="date"
                {...register("release_date")}
              />
              {errors.release_date && <Text color="red.500">{errors.release_date.message}</Text>}
            </FormControl>
            <FormControl id="description" isInvalid={!!errors.description}>
              <FormLabel>Description</FormLabel>
              <Input
                type="text"
                {...register("description")}
              />
              {errors.description && <Text color="red.500">{errors.description.message}</Text>}
            </FormControl>
            <FormControl id="price" isInvalid={!!errors.price}>
              <FormLabel>Price</FormLabel>
              <Input
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && <Text color="red.500">{errors.price.message}</Text>}
            </FormControl>
            <FormControl id="image">
              <FormLabel>Image</FormLabel>
              <ImageUpload onUpload={(url) => setImageURL(url)} />
              {errors.image && <Text color="red.500">{errors.image.message}</Text>}
            </FormControl>
            <FormControl id="main_writer" isInvalid={!!errors.main_writer}>
              <FormLabel>Main Writer</FormLabel>
              <Input
                type="text"
                {...register("main_writer")}
              />
              {errors.main_writer && <Text color="red.500">{errors.main_writer.message}</Text>}
            </FormControl>
            <Button
              colorScheme="teal"
              width="300px"
              type="submit"
              isDisabled={loading}
            >
              {loading ? 'Loading ...' : 'Post Comic'}
            </Button>
          </VStack>
        )}
      </Box>
    </Center>
  );
}
