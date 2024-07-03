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
  Text,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  Container,
  Heading,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";

interface CreateTopicProps {
  params: {
    id: string;
  };
}

const CreateTopic: React.FC<CreateTopicProps> = ({ params }) => {
  const { id } = params;
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.700');
  const cardText = useColorModeValue('gray.800', 'white');
  const cardHover = useColorModeValue('gray.100', 'gray.600');

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.from("topics").insert([{ forum_id: id, title, description }]);
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
          <VStack spacing={4}>
            <FormControl id="title" isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter topic title"
              />
            </FormControl>
            <FormControl id="description" isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter topic description"
              />
            </FormControl>
            <Button
              colorScheme="teal"
              width="full"
              onClick={handleSubmit}
              _hover={{ bg: cardHover }}
            >
              Create Topic
            </Button>
          </VStack>
        )}
      </Box>
    </Container>
  );
};

export default CreateTopic;
