import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function GET() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Fetch posts from the 'blog_posts' table
    const { data: postsData, error: postsError } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (postsError) throw postsError;

    // Process posts to remove HTML tags and handle images
    const processedPosts = postsData.map(post => {
      // Regex to remove image tags
      const imgRegex = /<img[^>]*>/g;
      let contentWithoutImages = post.content.replace(imgRegex, '');

      // Strip other HTML tags
      contentWithoutImages = contentWithoutImages.replace(/<\/?[^>]+(>|$)/g, "");

      return {
        ...post,
        content: contentWithoutImages,
        images: [], // Ignore images
      };
    });

    return new NextResponse(JSON.stringify(processedPosts), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
