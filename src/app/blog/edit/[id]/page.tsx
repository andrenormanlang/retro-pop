"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/utils/supabase/client";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Center,
  Spinner,
} from "@chakra-ui/react";
import ImageUpload from "@/components/ImageUpload";
import RichTextEditor from "@/components/RichTextEditor";

// Define Zod schema for form validation
const postSchema = z.object({
  title: z.string().min(10, "Title is required"),
  content: z.string().min(100, "Content is required"),
  imageUrl: z.string().optional(),
});
type PostFormData = z.infer<typeof postSchema>;

const EditBlogPost = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const supabase = createClient();
  const router = useRouter();
  const toast = useToast();

  // Create the form methods object.
  const methods = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });
  // Destructure needed methods.
  const { register, setValue, formState: { errors }, watch } = methods;

  const [isAdmin, setIsAdmin] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPostData(id);
      checkAdmin();
    }
  }, [id]);

  const fetchPostData = async (postId: string) => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (data) {
      setValue("title", data.title);
      setValue("content", data.content);
      setValue("imageUrl", data.imageUrl);
      setImageUrl(data.imageUrl);
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

  const checkAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Error fetching profile data.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (data?.is_admin) {
      setIsAdmin(true);
    } else {
      toast({
        title: "Error",
        description: "Only admin users can edit blog posts.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      router.push(`/blog/${id}`);
    }
  };

  const onSubmit: SubmitHandler<PostFormData> = async (data) => {
    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Only admin users can edit blog posts.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const postData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("blog_posts").update(postData).eq("id", id);

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
        description: "Blog post updated successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      router.push(`/blog`);
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="red.500" />
      </Center>
    );
  }

	console.log(methods,);

  return (
    <Container maxW="container.md" py={8}>
      {/* <style jsx global>{`
        .ql-toolbar.ql-snow {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #fff;
        }
      `}</style> */}

      <Box mb={4}>
        <Button onClick={() => router.back()}>Back to Blog</Button>
      </Box>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.title}>
              <FormLabel>Title</FormLabel>
              <Input {...register("title")} />
              {errors.title && (
                <p style={{ color: "red" }}>{errors.title.message}</p>
              )}
            </FormControl>

            <ImageUpload
              onUpload={(url) => {
                setValue("imageUrl", url);
                setImageUrl(url);
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
              {errors.content && (
                <p style={{ color: "red" }}>{errors.content.message}</p>
              )}
            </FormControl>

            <Button type="submit">Save</Button>
          </VStack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default EditBlogPost;
