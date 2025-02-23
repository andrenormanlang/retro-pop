"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
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
import "quill/dist/quill.snow.css";
import QuillResizeImage from "quill-resize-image";

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// Import Quill from react-quill for module registration
import { Quill } from "react-quill-new";
Quill.register("modules/resize", QuillResizeImage);

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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

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

    const { error } = await supabase
      .from("blog_posts")
      .update(postData)
      .eq("id", id);

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

  // Configure Quill modules including the toolbar and image resize module
  const quillModules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
    resize: {
      locale: {},
    },
  };

  const quillFormats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "indent",
    "link",
    "image",
    "color",
    "background",
  ];

  return (
    <Container maxW="container.md" py={8}>
      {/* Global styles for the Quill toolbar */}
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #fff;
        }
      `}</style>

      <Box mb={4}>
        <Button onClick={() => router.back()}>Back to Blog</Button>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.title}>
            <FormLabel>Title</FormLabel>
            <Input {...register("title")} />
            {errors.title && (
              <p style={{ color: "red" }}>{errors.title.message}</p>
            )}
          </FormControl>

          {/* Place the image upload component where desired */}
          <ImageUpload
            onUpload={(url) => {
              setValue("imageUrl", url);
              setImageUrl(url);
            }}
          />

          <FormControl isInvalid={!!errors.content}>
            <FormLabel>Content</FormLabel>
            {/* Wrap the editor in a scrollable container so the toolbar can be sticky */}
            <Box
              maxH="500px"
              overflowY="auto"
              border="1px solid #ccc"
              borderRadius="6px"
            >
              <ReactQuill
                value={watch("content")}
                onChange={(value) => setValue("content", value)}
                modules={quillModules}
                formats={quillFormats}
                theme="snow"
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
    </Container>
  );
};

export default EditBlogPost;
