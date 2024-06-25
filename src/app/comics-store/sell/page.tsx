"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Textarea,
} from "@chakra-ui/react";
import ImageUpload from "./image-upload";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "../../../contexts/UserContext";

// Define validation schema
const validationSchema = z.object({
  image: z.string().optional(),
  title: z.string().min(3, { message: "Title is required" }),
  publisher: z.string().min(2, { message: "Publisher is required" }),
  release_date: z.string().min(1, { message: "Release date is required" }),
  price: z.preprocess((val) => parseFloat(val as string), z.number().positive({ message: "Price is required must be positive" })),
  stock: z.preprocess((val) => parseFloat(val as string), z.number().positive({ message: "Stock is required and must be positive" })),
  pages: z.preprocess((val) => parseInt(val as string), z.number().positive({ message: "Pages are required and must be positive" })), // Add pages
  main_artist: z.string().min(1, { message: "Main artist is required" }),
  main_writer: z.string().min(1, { message: "Main writer is required" }),
  description: z.string().min(20, { message: "Description is required and should be at least 10 characters" }),
  currency: z.string().min(1, { message: "Currency is required" }), // Add currency validation
  genre: z.string().min(1, { message: "Genre is required" }), // Add genre validation
});

type FormData = z.infer<typeof validationSchema>;

export default function ComicForm() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const { user, setUser } = useUser();
  const toast = useToast();
  const router = useRouter();

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
	  stock: 0,
      image: "",
      main_writer: "",
      pages: 0, // Add default value for pages
      currency: "", // Add default value for currency
      genre: "", // Add default value for genre
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      // Fetch the user profile to check if the user is an admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      const approvedStatus = profile.is_admin; // Directly use the is_admin flag from user profile

      setLoading(true);
      const comicId = uuidv4();
      console.log("Submitting data:", {
        id: comicId,
        ...data,
        image: imageURL,
        user_id: user.id,
        is_approved: approvedStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      const { error } = await supabase.from("comics-sell").insert([
        {
          id: comicId,
          ...data,
          image: imageURL,
          user_id: user.id,
          is_approved: approvedStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast({
        title: approvedStatus ? "Comic book posted!" : "Comic book submitted for review!",
        description: approvedStatus ? "Your comic book is now live." : "Your comic book is pending admin approval.",
        status: "success",
        duration: 5000,
        isClosable: true,
		position: "top"
      });
      reset(); // Reset the form fields
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setError("Error submitting comic book: " + errorMessage);
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

  const genres = [
    "Superhero",
    "Science Fiction",
    "Fantasy",
    "Horror",
    "Mystery/Crime",
    "Romance",
    "Comedy/Humor",
    "Drama",
    "Historical",
    "Slice of Life",
    "Adventure",
    "Thriller/Suspense",
    "Western",
    "War/Military",
    "Biographical/Autobiographical",
    "Educational/Non-Fiction",
    "Anthology",
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
            <FormControl id="genre" isInvalid={!!errors.genre}>
              <FormLabel>Genre</FormLabel>
              <Select placeholder="Select genre" {...register("genre")}>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </Select>
              {errors.genre && <Text color="red.500">{errors.genre.message}</Text>}
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
            <FormControl id="stock" isInvalid={!!errors.stock}>
              <FormLabel>Quantity to Sell</FormLabel>
              <Input type="number" {...register("stock", { valueAsNumber: true })} />
              {errors.stock && <Text color="red.500">{errors.stock.message}</Text>}
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
            <FormControl isInvalid={!!errors.description}>
              <FormLabel>Description</FormLabel>
              <Textarea
                {...register("description")}
                placeholder="Enter comic description"
                size="sm"
                rows={5} // Default number of rows, it will expand automatically with input
              />
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
