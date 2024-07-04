"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import {
  Box,
  Spinner,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
  Center,
  Container,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Tooltip,
  useToast,
  Flex,
} from "@chakra-ui/react";
import { Forum, Params, Topic } from "@/types/forum/forum.type";
import { useUser } from "@/contexts/UserContext";
import { DeleteIcon } from "@chakra-ui/icons";
import { getRelativeTime } from "@/helpers/getRelativeTime";

const ForumPage = ({ params }: Params) => {
  const { id } = params;
  const [forum, setForum] = useState<Forum | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const cardText = useColorModeValue("gray.800", "white");
  const cardHover = useColorModeValue("gray.100", "gray.600");
  const cardBorder = useColorModeValue("gray.200", "gray.500");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
        if (error) {
          console.error("Error fetching profile:", error.message);
          return;
        }
        if (data && data.is_admin) {
          setIsAdmin(true);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchForum = async () => {
      const { data, error } = await supabase
        .from("forums")
        .select("*")
        .eq("id", id)
        .single();
      if (error) console.error("Error fetching forum:", error);
      else setForum(data);
    };

    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from("topics")
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq("forum_id", id);
      if (error) {
        console.error("Error fetching topics:", error);
      } else {
        const enrichedTopics = await Promise.all(
          data.map(async (topic) => {
            const { data: postsSnapshot, error: postsError } = await supabase
              .from("posts")
              .select("*, profiles (username)")
              .eq("topic_id", topic.id);

            if (postsError) {
              console.error("Error fetching posts:", postsError);
              return topic;
            }

            const postCountsTemp = postsSnapshot?.length || 0;
            const voiceCountsTemp = new Set(
              postsSnapshot?.map((post) => post.profiles?.username).filter((username) => username)
            ).size;
            const lastPostTime = postsSnapshot?.length
              ? getRelativeTime(postsSnapshot[postsSnapshot.length - 1].created_at)
              : "No posts";

            return {
              ...topic,
              postCount: postCountsTemp,
              voiceCount: voiceCountsTemp,
              lastPostTime,
            };
          })
        );
        setTopics(enrichedTopics);
      }
      setLoading(false);
    };

    if (id) {
      fetchForum();
      fetchTopics();
    }
  }, [id]);

  const handleDelete = async (topicId: string) => {
    const { error } = await supabase
      .from("topics")
      .delete()
      .eq("id", topicId);
    if (error) console.error("Error deleting topic:", error);
    else {
      // Refresh topics
      setTopics((prevTopics) => prevTopics.filter((topic) => topic.id !== topicId));
    }
  };

  const handleCreateTopic = () => {
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
    router.push(`/forums/${id}/create-topic`);
  };

  if (loading)
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    );

  if (!forum) return <Text>Forum not found</Text>;

  return (
    <Container maxW="container.lg" py={8}>
      <Heading mb={4} textAlign="center">
        {forum.title}
      </Heading>
      <Text mb={8} textAlign="center">
        {forum.description}
      </Text>
      <Flex justify="space-between" mb={4}>
        <Button colorScheme="teal" onClick={() => router.push(`/forums`)}>
          Back to Forums
        </Button>
        <Button colorScheme="teal" onClick={handleCreateTopic}>
          Create Topic
        </Button>
      </Flex>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Topic</Th>
              <Th>Author</Th>
              <Th>Created At</Th>
              <Th>Voices</Th>
              <Th>Posts</Th>
              <Th>Freshness</Th>
              {isAdmin && <Th>Delete</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {topics.map((topic) => (
              <Tr key={topic.id}>
                <Td>
                  <Tooltip label={topic.description} fontSize="md">
                    <Text
                      as="a"
                      href={`/forums/${forum.id}/topics/${topic.id}`}
                      fontWeight="bold"
                      _hover={{ textDecoration: "underline" }}
                    >
                      {topic.title}
                    </Text>
                  </Tooltip>
                </Td>
                <Td>
                  <HStack spacing={3}>
                    {topic.profiles && (
                      <>
                        <Avatar size="sm" src={topic.profiles.avatar_url} />
                        <Text>{topic.profiles.username}</Text>
                      </>
                    )}
                  </HStack>
                </Td>
                <Td>{new Date(topic.created_at).toLocaleDateString()}</Td>
                <Td>{topic.voiceCount}</Td>
                <Td>{topic.postCount}</Td>
                <Td>{topic.lastPostTime}</Td>
                {isAdmin && (
                  <Td>
                    <Button colorScheme="red" size="sm" onClick={() => handleDelete(topic.id)}>
                      <DeleteIcon />
                    </Button>
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Container>
  );
};

export default ForumPage;

