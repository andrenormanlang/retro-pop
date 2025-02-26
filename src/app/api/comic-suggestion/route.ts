import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// You'll need to sign up for a free Comic Vine API key
// https://comicvine.gamespot.com/api/
const COMIC_VINE_API_KEY = process.env.COMIC_VINE_API_KEY || "your-api-key-here";

// List of comic genres to randomize suggestions
const genres = [
  "superhero",
  "sci-fi",
  "fantasy",
  "horror",
  "crime",
  "slice of life",
  "manga",
  "indie",
  "graphic novel",
  "action",
  "adventure",
];

// Reliable image sources as fallbacks
const fallbackImages = {
  superhero: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?q=80&w=300&auto=format&fit=crop",
  "sci-fi": "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?q=80&w=300&auto=format&fit=crop",
  fantasy: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=300&auto=format&fit=crop",
  horror: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=300&auto=format&fit=crop",
  crime: "https://images.unsplash.com/photo-1453873623425-04e3213d56e5?q=80&w=300&auto=format&fit=crop",
  "slice of life": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=300&auto=format&fit=crop",
  manga: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300&auto=format&fit=crop",
  indie: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?q=80&w=300&auto=format&fit=crop",
  "graphic novel": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300&auto=format&fit=crop",
  action: "https://images.unsplash.com/photo-1535970793482-07de93762dc4?q=80&w=300&auto=format&fit=crop",
  adventure: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=300&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1553545204-4f7d339aa06a?q=80&w=300&auto=format&fit=crop",
};

export async function GET(request: NextRequest) {
  try {
    // Get random genre and random seed
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    const randomSeed = Math.floor(Math.random() * 1000);

    const prompt = `
      Suggest a popular ${randomGenre} comic book to read.
      Make sure this is different from previous suggestions.
      Use random seed: ${randomSeed} to ensure variety.
      Provide a brief description and a link to read more.

      IMPORTANT: The title should be a specific, well-known comic series that I can easily find online.
      Include the publisher (like Marvel, DC, Image, etc.) in the description.

      Return the response in this JSON format only, no additional text:
      {
        "title": "string",
        "description": "string",
        "link": "string"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean the response and parse it as JSON
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const suggestion = JSON.parse(cleanedText);

    try {
      // Search for the comic using Comic Vine API
      const searchQuery = encodeURIComponent(suggestion.title);
      const apiUrl = `https://comicvine.gamespot.com/api/search/?api_key=${COMIC_VINE_API_KEY}&format=json&query=${searchQuery}&resources=volume&field_list=name,image,site_detail_url&limit=1`;

      const apiResponse = await fetch(apiUrl);
      if (!apiResponse.ok) throw new Error('API request failed');

      const apiData = await apiResponse.json();

      if (apiData.results && apiData.results.length > 0) {
        const comic = apiData.results[0];

        // Comic Vine returns image data in a specific format
        if (comic.image && comic.image.super_url) {
          suggestion.imageUrl = comic.image.super_url;
        }

        // Use the Comic Vine detail URL if available
        if (comic.site_detail_url) {
          suggestion.link = comic.site_detail_url;
        }
      } else {
        throw new Error('No results found');
      }
    } catch (apiError) {
      console.error('Error fetching from Comic Vine API:', apiError);
      // Use genre-specific fallback image if API call fails
      suggestion.imageUrl = fallbackImages[randomGenre] || fallbackImages["default"];
    }

    // If we still don't have an image URL, use the fallback
    if (!suggestion.imageUrl) {
      suggestion.imageUrl = fallbackImages[randomGenre] || fallbackImages["default"];
    }

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Error generating comic suggestion:", error);
    return NextResponse.json({ error: "Failed to generate suggestion" }, { status: 500 });
  }
}
