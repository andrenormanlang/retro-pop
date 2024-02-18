import { Superhero } from "@/types/superhero.types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const SUPERHERO_ACCESS_TOKEN = process.env.SUPERHERO_ACCESS_TOKEN;
  if (!SUPERHERO_ACCESS_TOKEN) {
    return new NextResponse(
      "Superhero API access token is not configured",
      { status: 500 }
    );
  }

  const urlParams = new URL(request.url).searchParams;
  const page = parseInt(urlParams.get("page") || "1", 10);
  const limit = parseInt(urlParams.get("limit") || "20", 10);
  const searchTerm = urlParams.get("query") || "";

  let apiUrl = `https://akabab.github.io/superhero-api/api/all.json`; // Default API URL

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

	let data: Superhero[] = await response.json();

    // Filter superheroes if a search term is provided
    if (searchTerm) {
      const normalizedSearchTerm = searchTerm.toLowerCase();
      data = data.filter((hero: Superhero) =>
        hero.name.toLowerCase().includes(normalizedSearchTerm)
      );
    }

    // Paginate data
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);

    return new NextResponse(
      JSON.stringify({
        superheroes: paginatedData,
        currentPage: page,
        totalPages: Math.ceil(data.length / limit),
        totalCount: data.length,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred";
    return new NextResponse(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
