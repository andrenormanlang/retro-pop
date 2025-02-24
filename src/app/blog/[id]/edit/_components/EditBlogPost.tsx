"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, type PostFormData } from "@/lib/validations/blog";
import { createClient } from "@/utils/supabase/client";
import { Box, Button, Container, FormControl, FormLabel, Input, VStack, useToast } from "@chakra-ui/react";
import ImageUpload from "@/components/ImageUpload";

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

interface EditBlogPostProps {
  initialBlog: PostFormData;
}

export default function EditBlogPost({ initialBlog }: EditBlogPostProps) {
  const router = useRouter();
  const toast = useToast();
  const supabase = createClient();

  const methods = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: initialBlog
  });

  return (
    <Container maxW="container.md" py={8}>
      <FormProvider {...methods}>
        <form>
          {/* Your form content here */}
        </form>
      </FormProvider>
    </Container>
  );
}
