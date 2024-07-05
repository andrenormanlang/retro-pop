'use client';

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
  HStack,
  Image,
  useToast,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { Params, Post } from "@/types/forum/forum.type";
import { useUser } from "@/contexts/UserContext";
import { format } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";

const PostPage = ({ params }: { params: Params['params'] }) => {
  const { id, topicId } = params;
  const [posts, setPosts] = useState<Post[]>([]);
  const [topicTitle, setTopicTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchPostsAndTopic = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles (
            username,
            avatar_url
          )
        `
        )
        .eq("topic_id", topicId);

      if (postsError) {
        console.error("Error fetching posts:", postsError);
        setLoading(false);
        return;
      }

      const { data: topicData, error: topicError } = await supabase
        .from("topics")
        .select("title")
        .eq("id", topicId)
        .single();

      if (topicError) {
        console.error("Error fetching topic:", topicError);
        setLoading(false);
        return;
      }

      setPosts(postsData);
      setTopicTitle(topicData.title);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (topicId) {
      fetchPostsAndTopic();
    }
  }, [topicId]);

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

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      const { error } = await supabase.from("posts").delete().eq("id", postToDelete);
      if (error) throw error;
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postToDelete));
      toast({
        title: "Post deleted.",
        description: "The post has been deleted successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the post.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setPostToDelete(null);
      onClose();
    }
  };

  const openDeleteModal = (postId: string) => {
    setPostToDelete(postId);
    onOpen();
  };

  const bg = useColorModeValue("white", "gray.700");
  const color = useColorModeValue("gray.800", "white");
  const hoverBg = useColorModeValue("gray.100", "gray.600");
  const borderColor = useColorModeValue("gray.200", "gray.500");
  const avatarBg = useColorModeValue("gray.100", "gray.800");

  const handleCreatePost = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You need to be signed in to create a post.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    router.push(`/forums/${id}/topics/${topicId}/create-post`);
  };

  if (loading)
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    );

  return (
    <Container maxW="container.lg" py={8}>
      <Heading mb={4} textAlign="center">
        {topicTitle || "Posts"}
      </Heading>
      <Flex justifyContent="space-between" mb={8}>
        <Button colorScheme="teal" onClick={() => router.push(`/forums/${id}`)}>
          Back to Topics
        </Button>
        <Button colorScheme="teal" onClick={handleCreatePost}>
          Create Post
        </Button>
      </Flex>
      <VStack spacing={4} width="100%">
        {posts.map((post) => (
          <Flex
            key={post.id}
            p={0}
            shadow="md"
            borderWidth="1px"
            borderRadius="md"
            overflow="hidden"
            bg={bg}
            color={color}
            _hover={{ shadow: "xl", bg: hoverBg }}
            borderColor={borderColor}
            transition="all 0.3s ease-in-out"
            width="100%"
            alignItems="stretch"
          >
            <Box
              width="120px"
              textAlign="center"
              bg={avatarBg}
              p={4}
              borderRadius="md"
              marginRight={4}
              alignSelf="stretch"
            >
              <Avatar size="lg" src={post.profiles.avatar_url} mb={4} />
              <Text fontWeight="bold">{post.profiles.username}</Text>
              <Text color="gray.500">{post.profiles.is_admin ? "Admin" : "Member"}</Text>
            </Box>
            <Box flex="1" p={2}>
              <Text fontSize="sm" color="gray.500">
                {format(new Date(post.created_at), 'MMM d, yyyy, h:mm:ss a')}
              </Text>
              <Box mt={2} mb={2}>
                <Text dangerouslySetInnerHTML={{ __html: post.content }} />
              </Box>
              {post.image_url && <Image src={post.image_url} alt="Post image" maxWidth={{ base: "100%", md: "350px" }} />}
            </Box>
            {isAdmin && (
              <Button
                ml={2}
                colorScheme="red"
                onClick={() => openDeleteModal(post.id)}
                alignSelf="flex-start"
              >
                <DeleteIcon />
              </Button>
            )}
          </Flex>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this post?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleDeletePost}>
              Yes, Delete
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default PostPage;


