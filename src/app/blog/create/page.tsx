"use client";

import React, { useState, useEffect } from "react";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/utils/supabase/client";
import { Button, Center, Container, FormControl, FormLabel, Input, VStack, useToast, Box } from "@chakra-ui/react";
import ImageUpload from "@/components/ImageUpload";
import { useUser } from "@/contexts/UserContext";
import ComicSpinner from "@/helpers/ComicSpinner";
import RichTextEditor from "@/components/RichTextEditor";

// Define the Zod schema
const postSchema = z.object({
	title: z.string().min(10, "Title is required"),
	content: z.string().min(100, "Content is required"),
	imageUrl: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

const CreateBlogPostPage = () => {
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const { user } = useUser();
	const router = useRouter();
	const toast = useToast();
	const supabase = createClient();

	// 1. Create a form instance with react-hook-form
	const methods = useForm<PostFormData>({
		resolver: zodResolver(postSchema),
	});

	// 2. Destructure anything you need from methods
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
		watch,
	} = methods;

	useEffect(() => {
		if (!user) {
			router.push("/login");
		}
	}, [user, router]);

	const onSubmit: SubmitHandler<PostFormData> = async (data) => {
		if (!user) {
			toast({
				title: "Error",
				description: "You must be signed in to create a post.",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			return;
		}

		const authorName = user.username || user.email || "Anonymous";

		setLoading(true);
		const { error } = await supabase.from("blog_posts").insert([
			{
				...data,
				imageUrl,
				author_name: authorName,
				author_id: user.id,
			},
		]);

		setLoading(false);

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
				description: "Post created successfully.",
				status: "success",
				duration: 5000,
				isClosable: true,
			});
			router.push("/blog");
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
		return null;
	}

	return (
		<Container maxW="container.md" py={8}>
			<Button mt={4} mb={4} onClick={() => router.back()}>
				Back
			</Button>

			{/* 3. Wrap your form with FormProvider */}
			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<VStack spacing={4} align="stretch">
						<FormControl isInvalid={!!errors.title}>
							<FormLabel>Title</FormLabel>
							<Input {...register("title")} />
							{errors.title && <p style={{ color: "red" }}>{errors.title.message}</p>}
						</FormControl>

						<ImageUpload
							onUpload={(url) => {
								setImageUrl(url);
								setValue("imageUrl", url);
							}}
						/>

						<FormControl isInvalid={!!errors.content}>
							<FormLabel>Content</FormLabel>
							<Box maxH="500px" overflowY="auto" border="1px solid #ccc" borderRadius="6px">
								<RichTextEditor
									value={watch("content")}
									onChange={(value) => setValue("content", value)}
									style={{ height: "400px" }}
								/>
							</Box>
							{errors.content && <p style={{ color: "red" }}>{errors.content.message}</p>}
						</FormControl>

						<Button colorScheme="teal" type="submit">
							Create Post
						</Button>
					</VStack>
				</form>
			</FormProvider>
		</Container>
	);
};

export default CreateBlogPostPage;
