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
	HStack,
	Image,
	useToast,
} from "@chakra-ui/react";
import { Params, Post } from "@/types/forum/forum.type";
import { useUser } from "@/contexts/UserContext";

const PostPage = ({ params }: Params) => {
	const { id, topicId } = params;
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const { user } = useUser();
	const router = useRouter();
	const toast = useToast();

	useEffect(() => {
		const fetchPosts = async () => {
			const { data, error } = await supabase
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
			if (error) console.error("Error fetching posts:", error);
			else setPosts(data);
		};

		if (topicId) {
			fetchPosts();
			setLoading(false);
		}
	}, [topicId]);

	const bg = useColorModeValue("white", "gray.700");
	const color = useColorModeValue("gray.800", "white");
	const hoverBg = useColorModeValue("gray.100", "gray.600");
	const borderColor = useColorModeValue("gray.200", "gray.500");

	const handleCreatePost = () => {
		if (user) {
			router.push(`/forums/${id}/topics/${topicId}/create-post`);
		} else {
			toast({
				title: "Access denied.",
				description: "You need to be signed in to create a post.",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		}
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
				Posts
			</Heading>
			<HStack spacing={4} mb={8}>
				<Button colorScheme="teal" onClick={() => router.push(`/forums/${id}`)}>
					Back to Topics
				</Button>
				<Button colorScheme="teal" onClick={handleCreatePost}>
					Create Post
				</Button>
			</HStack>
			<VStack spacing={8}>
				{posts.map((post) => (
					<Box
						key={post.id}
						p={5}
						shadow="md"
						borderWidth="1px"
						borderRadius="md"
						overflow="hidden"
						bg={bg}
						color={color}
						_hover={{ shadow: "xl", bg: hoverBg }}
						borderColor={borderColor}
						transition="all 0.3s ease-in-out"
					>
						<HStack spacing={3} mb={4}>
							<Avatar size="sm" src={post.profiles.avatar_url} />
							<Text>{post.profiles.username}</Text>
							<Text>{new Date(post.created_at).toLocaleString()}</Text>
						</HStack>
						<Text mb={4}>{post.content}</Text>
						{post.image_url && <Image src={post.image_url} alt="Post image" />}
					</Box>
				))}
			</VStack>
		</Container>
	);
};

export default PostPage;
