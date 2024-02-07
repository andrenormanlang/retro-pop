import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const publicKey = process.env.MARVEL_PUBLIC_KEY;
  const privateKey = process.env.MARVEL_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return new NextResponse('Marvel API keys not configured', { status: 500 });
  }

  const urlParams = new URL(request.url).searchParams;
  const page = parseInt(urlParams.get('page') || '1', 10);
  const limit = parseInt(urlParams.get('limit') || '20', 10);
  const searchTerm = urlParams.get('query') || '';

  // Generate a timestamp and hash for the API request
  const ts = new Date().getTime().toString();
  const hash = crypto.createHash('md5').update(ts + privateKey + publicKey).digest('hex');

  let apiUrl = `https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&apikey=${publicKey}&hash=${hash}&limit=${limit}`;

  if (searchTerm) {
    apiUrl += `&name=${encodeURIComponent(searchTerm)}`;
  } else {
    // Calculate the offset based on the page number
    const offset = (page - 1) * limit;
    apiUrl += `&offset=${offset}`;
  }

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Marvel API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    return new NextResponse(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
