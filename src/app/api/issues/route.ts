import { NextRequest, NextResponse } from 'next/server';

async function getIssuesList(limit: number, offset: number) {
  const apiKey = process.env.COMIC_VINE_API_KEY;
  const url = `https://www.comicvine.com/api/issues/?api_key=${apiKey}&format=json&sort=store_date:desc&limit=${limit}&offset=${offset}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }
  return response.json();
}

export async function GET(request: NextRequest) {
  // NextRequest doesn't have a query method, use URLSearchParams
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const offset = (page - 1) * limit;

  try {
    const issuesList = await getIssuesList(limit, offset);
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
