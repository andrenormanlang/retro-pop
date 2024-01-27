import { NextRequest, NextResponse } from 'next/server';

// Function to get a list of issues without a search query
async function getIssuesList(limit: number, offset: number) {
  const apiKey = process.env.COMIC_VINE_API_KEY;
  const url = `https://www.comicvine.com/api/issues/?api_key=${apiKey}&format=json&sort=store_date:desc&limit=${limit}&offset=${offset}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }
  return response.json();
}

// Function to handle search queries with pagination
async function searchIssues(limit: number, offset: number, query: string) {
  const apiKey = process.env.COMIC_VINE_API_KEY;
  const searchUrl = `https://comicvine.gamespot.com/api/search/?api_key=${apiKey}&format=json&sort=name:asc&resources=issue&query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;

  const response = await fetch(searchUrl);
  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }
  return response.json();
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const offset = (page - 1) * limit;
  const searchTerm = url.searchParams.get('query') || '';

  try {
    const issuesList = searchTerm
      ? await searchIssues(limit, offset, searchTerm)
      : await getIssuesList(limit, offset);
    return NextResponse.json(issuesList);
  } catch (error) {
    const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
