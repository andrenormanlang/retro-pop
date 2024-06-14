"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/utils/supabase/client";
import {
	Box,
	Button,
	FormControl,
	FormLabel,
	Input,
	VStack,
	Heading,
	Spinner,
	Alert,
	AlertIcon,
	Center,
	Text,
	Select,
	useToast,
} from "@chakra-ui/react";
import ImageUpload from "./image-upload";
import { v4 as uuidv4 } from "uuid";
import { User } from "@supabase/supabase-js";

// Define validation schema
const validationSchema = z.object({
	image: z.string().optional(),
	title: z.string().min(1, { message: "Title is required" }),
	publisher: z.string().min(1, { message: "Publisher is required" }),
	release_date: z.string().min(1, { message: "Release date is required" }),
	price: z.preprocess((val) => parseFloat(val as string), z.number().positive({ message: "Price must be positive" })),
	pages: z.preprocess((val) => parseInt(val as string), z.number().positive({ message: "Pages must be positive" })), // Add pages
	main_artist: z.string().min(1, { message: "Main artist is required" }),
	main_writer: z.string().min(1, { message: "Main writer is required" }),
	description: z.string().min(1, { message: "Description is required" }),
	currency: z.string().min(1, { message: "Currency is required" }), // Add currency validation
});

type FormData = z.infer<typeof validationSchema>;

export default function ComicForm() {
	const supabase = createClient();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [imageURL, setImageURL] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const toast = useToast();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormData>({
		resolver: zodResolver(validationSchema),
		defaultValues: {
			title: "",
			main_artist: "",
			publisher: "",
			release_date: "",
			description: "",
			price: 0,
			image: "",
			main_writer: "",
			pages: 0, // Add default value for pages
			currency: "", // Add default value for currency
		},
	});

	useEffect(() => {
		// Fetch the current user
		const fetchUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setUser(user);
		};

		fetchUser();
	}, []);

	const onSubmit: SubmitHandler<FormData> = async (data) => {
		if (!user) {
			setError("User not authenticated");
			return;
		}

		if (!imageURL) {
			setError("Image is required");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const id = uuidv4();

			const { error } = await supabase.from("comics-sell").insert([
				{
					id,
					...data,
					image: imageURL,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
					user_id: user.id, // Include the user ID here
				},
			]);

			if (error) throw error;

			toast({
				title: "Comic book posted for sale!",
				description: "Your comic book has been successfully posted for sale.",
				status: "success",
				duration: 5000,
				isClosable: true,
			});
			reset();
			setImageURL(null); // Reset image URL after successful submission
		} catch (error) {
			setError("Error posting comic book!");
		} finally {
			setLoading(false);
		}
	};

	const publishers = [
		"Marvel Comics",
		"DC Comics",
		"Image Comics",
		"Dark Horse Comics",
		"IDW Publishing",
		"Valiant Comics",
		"Dynamite Entertainment",
		"Boom! Studios",
		// Add more publishers as needed
	];

	const currencies = [
		{ value: "BRL", label: "Brazilian Real (BRL)" },
		{ value: "DKK", label: "Danish Krone (DKK)" },
		{ value: "SEK", label: "Swedish Krona (SEK)" },
		{ value: "USD", label: "US Dollar (USD)" },
		{ value: "EUR", label: "Euro (EUR)" },
	];

	
	return (
		<Center>
			<Box p={8} maxWidth={{ base: "90%", md: "400px" }} width="full" boxShadow="md" borderRadius="md">
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
						<FormControl id="image" isInvalid={!!errors.image}>
							<FormLabel>Image</FormLabel>
							<ImageUpload onUpload={(url) => setImageURL(url)} />
							{errors.image && <Text color="red.500">{errors.image.message}</Text>}
						</FormControl>
						<FormControl id="title" isInvalid={!!errors.title}>
							<FormLabel>Title</FormLabel>
							<Input type="text" {...register("title")} />
							{errors.title && <Text color="red.500">{errors.title.message}</Text>}
						</FormControl>
						<FormControl id="publisher" isInvalid={!!errors.publisher}>
							<FormLabel>Publisher</FormLabel>
							<Select placeholder="Select publisher" {...register("publisher")}>
								{publishers.map((publisher) => (
									<option key={publisher} value={publisher}>
										{publisher}
									</option>
								))}
							</Select>
							{errors.publisher && <Text color="red.500">{errors.publisher.message}</Text>}
						</FormControl>
						<FormControl id="release_date" isInvalid={!!errors.release_date}>
							<FormLabel>Release Date</FormLabel>
							<Input type="date" {...register("release_date")} />
							{errors.release_date && <Text color="red.500">{errors.release_date.message}</Text>}
						</FormControl>
						<FormControl id="currency" isInvalid={!!errors.currency}>
							<FormLabel>Currency</FormLabel>
							<Select placeholder="Select currency" {...register("currency")}>
								{currencies.map((currency) => (
									<option key={currency.value} value={currency.value}>
										{currency.label}
									</option>
								))}
							</Select>
							{errors.currency && <Text color="red.500">{errors.currency.message}</Text>}
						</FormControl>
						<FormControl id="price" isInvalid={!!errors.price}>
							<FormLabel>Price</FormLabel>
							<Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
							{errors.price && <Text color="red.500">{errors.price.message}</Text>}
						</FormControl>
						<FormControl id="pages" isInvalid={!!errors.pages}>
							<FormLabel>Number of Pages</FormLabel>
							<Input type="number" {...register("pages", { valueAsNumber: true })} />
							{errors.pages && <Text color="red.500">{errors.pages.message}</Text>}
						</FormControl>
						<FormControl id="main_artist" isInvalid={!!errors.main_artist}>
							<FormLabel>Main Artist</FormLabel>
							<Input type="text" {...register("main_artist")} />
							{errors.main_artist && <Text color="red.500">{errors.main_artist.message}</Text>}
						</FormControl>
						<FormControl id="main_writer" isInvalid={!!errors.main_writer}>
							<FormLabel>Main Writer</FormLabel>
							<Input type="text" {...register("main_writer")} />
							{errors.main_writer && <Text color="red.500">{errors.main_writer.message}</Text>}
						</FormControl>
						<FormControl id="description" isInvalid={!!errors.description}>
							<FormLabel>Description</FormLabel>
							<Input type="text" {...register("description")} />
							{errors.description && <Text color="red.500">{errors.description.message}</Text>}
						</FormControl>
						<Button colorScheme="teal" width="300px" type="submit" isDisabled={loading}>
							{loading ? "Loading ..." : "Post Comic"}
						</Button>
					</VStack>
				)}
			</Box>
		</Center>
	);
}
