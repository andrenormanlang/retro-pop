import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const authHeader = process.env.METRON_API_AUTH_HEADER;
    if (!authHeader) {
        return new NextResponse("Authorization header is not set", { status: 401 });
    }

    const url = 'https://metron.cloud/api/issue/';

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const data = await response.json();
        if (data.results.length === 0) {
            return new NextResponse("No comic covers found", { status: 404 });
        }

        const randomIndex = Math.floor(Math.random() * data.results.length);
        const randomCover = data.results[randomIndex];

        return NextResponse.json(randomCover);
    } catch (error) {
        // Check if error is an instance of Error and handle accordingly
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Failed to fetch random comic cover:', errorMessage);
        return new NextResponse(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

// import { NextRequest, NextResponse } from 'next/server';
// const comicsApi = require('comicbooks-api');
// async function getRandomCover() {
// 	try {
// 	  // Fetch the latest comics. Assuming page 1 has a good variety.
// 	  // Adjust the pageNumber if needed.
// 	  const latestComics = await comicsApi.getLatestComics(1);

// 	  if (!latestComics || latestComics.length === 0) {
// 		throw new Error('No comics found');
// 	  }

// 	  // Select a random comic from the fetched array
// 	  const randomIndex = Math.floor(Math.random() * latestComics.length);
// 	  const randomComic = latestComics[randomIndex];

// 	  return randomComic;
// 	} catch (error) {
// 	  // Explicitly cast error to Error
// 	  throw new Error(`Failed to fetch random cover: ${(error as Error).message}`);
// 	}
//   }

// export async function GET(request: NextRequest) {
//   try {
//     const randomCover = await getRandomCover();
//     return NextResponse.json(randomCover);
//   } catch (error) {
//     const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
//     return new NextResponse(JSON.stringify({ error: message }), {
//       status: 500,
//       headers: {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*',
//       },
//     });
//   }
// }
