// API Route using comicbooks-api
import { NextRequest, NextResponse } from 'next/server';
const comicsApi = require('comicbooks-api');
async function getRandomCover() {
	try {
	  // Fetch the latest comics. Assuming page 1 has a good variety.
	  // Adjust the pageNumber if needed.
	  const latestComics = await comicsApi.getLatestComics(1);

	  if (!latestComics || latestComics.length === 0) {
		throw new Error('No comics found');
	  }

	  // Select a random comic from the fetched array
	  const randomIndex = Math.floor(Math.random() * latestComics.length);
	  const randomComic = latestComics[randomIndex];

	  return randomComic;
	} catch (error) {
	  // Explicitly cast error to Error
	  throw new Error(`Failed to fetch random cover: ${(error as Error).message}`);
	}
  }

export async function GET(request: NextRequest) {
  try {
    const randomCover = await getRandomCover();
    return NextResponse.json(randomCover);
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
