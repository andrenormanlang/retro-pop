'use client';

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/utils/supabaseClient";
import {
  Box,
  Button,
  Input,
  Spinner,
  Center,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  Container,
  Flex,
  Heading,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ImageUpload from "@/components/ImageUpload";


const validationSchema = z.object({
  title: z.string().min(6, { message: "Title is required" }),
  description: z.string().min(6, { message: "Description is required" }),
  image: z.string().url({ message: "Image URL must be valid" }).optional(),
});

type FormData = z.infer<typeof validationSchema>;

const EditForum = () => {
  const pathname = usePathname();
  const router = useRouter();
  const pathParts = pathname.split("/");
  const id = pathParts.pop();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const [forum, setForum] = useState<any | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
    },
  });

  const fetchForum = useCallback(async () => {
    if (id) {
      try {
        const { data, error } = await supabase.from("forums").select("*").eq("id", id).single();
        if (error) throw error;
        setForum(data);
        reset(data);
      } catch (error: any) {
        setError("Error loading forum data!");
      } finally {
        setLoading(false);
      }
    }
  }, [id, reset]);

  useEffect(() => {
    fetchForum();
  }, [fetchForum]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setLoading(true);
      const { error } = await supabase.from("forums").update(data).eq("id", id);
      if (error) throw error;
      toast({
        title: "Forum updated.",
        description: "The forum has been successfully updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      router.push("/forums");
    } catch (error: any) {
      setError("Error updating the forum!");
      toast({
        title: "Error updating forum.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setValue("image", url);
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Text>Error: {error}</Text>
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" p={4}>
      <Box mb={4}>
        <Button leftIcon={<ArrowBackIcon />} colorScheme="teal" variant="outline" onClick={() => router.push("/forums")}>
          Back to Forums
        </Button>
      </Box>
      <Flex
        direction="column"
        bg="gray.800"
        p={6}
        borderRadius="md"
        borderWidth="1px"
        borderColor="gray.700"
      >
        <VStack as="form" onSubmit={handleSubmit(onSubmit)} align="start" spacing={4} p={4}>
          <Heading>Edit Forum</Heading>
          <FormControl isInvalid={!!errors.title}>
            <FormLabel>Title</FormLabel>
            <Input type="text" {...register("title")} />
            {errors.title && <Text color="red.500">{errors.title.message}</Text>}
          </FormControl>
          <FormControl isInvalid={!!errors.description}>
            <FormLabel>Description</FormLabel>
            <Textarea {...register("description")} />
            {errors.description && <Text color="red.500">{errors.description.message}</Text>}
          </FormControl>
          <FormControl isInvalid={!!errors.image}>
            <FormLabel>Image URL</FormLabel>
            <ImageUpload onUpload={handleImageUpload} />
            {errors.image && <Text color="red.500">{errors.image.message}</Text>}
          </FormControl>
          <Button colorScheme="teal" width="300px" type="submit" isDisabled={loading}>
            {loading ? "Loading ..." : "Update Forum"}
          </Button>
        </VStack>
      </Flex>
    </Container>
  );
};

export default EditForum;

