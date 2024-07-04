'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import {
  Box,
  Button,
  Input,
  Spinner,
  Center,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  Container,
  Heading,
  useToast,
  useColorModeValue,
  FormErrorMessage,
  Flex,
} from "@chakra-ui/react";
import { useUser } from "@/contexts/UserContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define Zod schema
const topicSchema = z.object({
  title: z.string().min(6, "Title is required"),
  description: z.string().min(6, "Description is required"),
});

type TopicFormData = z.infer<typeof topicSchema>;

interface CreateTopicProps {
  params: {
    id: string;
  };
}

const CreateTopic: React.FC<CreateTopicProps> = ({ params }) => {
  const { id } = params;
  const router = useRouter();
  const { user } = useUser();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
  });

  const cardBg = useColorModeValue('white', 'gray.700');
  const cardText = useColorModeValue('gray.800', 'white');
  const cardHover = useColorModeValue('gray.100', 'gray.600');

  const onSubmit = async (data: TopicFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You need to be signed in to create a topic.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("topics").insert([{ forum_id: id, ...data, created_by: user.id }]);
      if (error) throw error;

      toast({
        title: "Topic created.",
        description: "Your topic has been created successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      router.push(`/forums/${id}`);
    } catch (error) {
      console.error("Error creating topic:", error);
      toast({
        title: "Error",
        description: "There was an error creating the topic.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Flex justifyContent="space-between" mb={4}>
        <Button colorScheme="teal" onClick={() => router.push(`/forums/${id}`)}>
          Back to Topics
        </Button>
      </Flex>
      <Box
        bg={cardBg}
        p={8}
        borderRadius="md"
        boxShadow="md"
        color={cardText}
      >
        <Heading as="h1" size="lg" textAlign="center" mb={6}>
          Create a New Topic
        </Heading>
        {loading ? (
          <Center height="50vh">
            <Spinner size="xl" />
          </Center>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4}>
              <FormControl id="title" isInvalid={!!errors.title}>
                <FormLabel>Title</FormLabel>
                <Input
                  {...register("title")}
                  placeholder="Enter topic title"
                />
                <FormErrorMessage>{errors.title && errors.title.message}</FormErrorMessage>
              </FormControl>
              <FormControl id="description" isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  {...register("description")}
                  placeholder="Enter topic description"
                />
                <FormErrorMessage>{errors.description && errors.description.message}</FormErrorMessage>
              </FormControl>
              <Button
                colorScheme="teal"
                width="full"
                type="submit"
                _hover={{ bg: cardHover }}
              >
                Create Topic
              </Button>
            </VStack>
          </form>
        )}
      </Box>
    </Container>
  );
};

export default CreateTopic;
