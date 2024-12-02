// components/BlogPostList.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
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
	Center,
	IconButton,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { BlogPost } from "@/types/blog/blog.type";
import ComicSpinner from "@/helpers/ComicSpinner";
import { useUser } from "@/contexts/UserContext";

const BlogPostList = () => {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const toast = useToast();
	const { user } = useUser(); // Get user from context
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		fetchPosts();
		if (user) {
			checkAdminStatus(user.id);
		}

		// Set up real-time subscription
		const subscription = supabase
			.channel("public:blog_posts")
			.on("postgres_changes", { event: "*", schema: "public", table: "blog_posts" }, handleRealTimeUpdate)
			.subscribe();

		// Cleanup on unmount
		return () => {
			supabase.removeChannel(subscription);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	const handleRealTimeUpdate = (payload: any) => {
		const newPost: BlogPost = payload.new;
		const oldPost: BlogPost = payload.old;

		switch (payload.eventType) {
			case "INSERT":
				setPosts((prevPosts) => [newPost, ...prevPosts]);
				break;
			case "UPDATE":
				setPosts((prevPosts) => prevPosts.map((post) => (post.id === newPost.id ? newPost : post)));
				break;
			case "DELETE":
				setPosts((prevPosts) => prevPosts.filter((post) => post.id !== oldPost.id));
				break;
			default:
				break;
		}
	};

	const fetchPosts = async () => {
		setLoading(true);
		const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });

		if (data) {
			setPosts(data as BlogPost[]);
		} else {
			toast({
				title: "Error",
				description: error?.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		}
		setLoading(false);
	};

	const checkAdminStatus = async (userId: string) => {
		const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();

		if (error) {
			console.error("Error checking admin status:", error);
		} else if (data && data.is_admin) {
			setIsAdmin(true);
		}
	};

	const deletePost = async (id: string) => {
		if (!user || !isAdmin) {
			toast({
				title: "Error",
				description: "Only admin users can delete blog posts.",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			return;
		}

		const { error } = await supabase.from("blog_posts").delete().eq("id", id);
		if (error) {
			toast({
				title: "Error",
				description: error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} else {
			toast({
				title: "Success",
				description: "Blog post deleted successfully.",
				status: "success",
				duration: 5000,
				isClosable: true,
			});
			// No need to call fetchPosts due to real-time subscription
		}
	};

	if (loading) {
		return (
			<Center h="100vh">
				<ComicSpinner />
			</Center>
		);
	}

	return (
		<Container maxW="container.md" py={8}>
			<Flex justifyContent="space-between" mb={4}>
				{/* <Heading>Blog</Heading> */}
				{isAdmin && <Button onClick={() => router.push("/blog/create")}>New Post</Button>}
			</Flex>
			<VStack spacing={4} align="stretch">
				{posts.map((post) => (
					<Box
						key={post.id}
						p={4}
						shadow="md"
						borderWidth="1px"
						display="flex"
						flexDirection={{ base: "column", md: "row" }}
						alignItems="center"
						_hover={{
							transform: "scale(1.05)",
							transition: "transform 0.3s",
							cursor: "pointer",
						}}
						onClick={() => router.push(`/blog/${post.id}`)}
					>
						{post.imageUrl && (
							<Image
								src={post.imageUrl}
								alt={post.title}
								boxSize={{ base: "100%", md: "150px" }}
								objectFit="cover"
								mb={{ base: 4, md: 0 }}
								mr={{ md: 4 }}
							/>
						)}
						<Box flex="1" textAlign={{ base: "left", md: "left" }}>
							<Heading fontSize={"1.5rem"} fontFamily="Bangers, sans-serif" fontWeight="normal">
								{post.title}
							</Heading>
							<Text fontSize="sm" color="gray.500" mb={2}>
								{new Intl.DateTimeFormat("en-US", {
									day: "numeric",
									month: "long",
									year: "numeric",
								}).format(new Date(post.created_at))}
							</Text>
							<Box noOfLines={3} dangerouslySetInnerHTML={{ __html: post.content }} />
							<Flex mt={4} justifyContent={{ base: "center", md: "flex-start" }}>
								{isAdmin && (
									<>
										<IconButton
											icon={<EditIcon />}
											onClick={(e) => {
												e.stopPropagation();
												router.push(`/blog/edit/${post.id}`);
											}}
											aria-label="Edit Post"
											mr={2}
										/>
										<IconButton
											icon={<DeleteIcon />}
											onClick={(e) => {
												e.stopPropagation();
												deletePost(post.id);
											}}
											aria-label="Delete Post"
											colorScheme="red"
										/>
									</>
								)}
							</Flex>
						</Box>
					</Box>
				))}
			</VStack>
		</Container>
	);
};

export default BlogPostList;
