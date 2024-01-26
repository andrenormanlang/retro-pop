const comicsApi = require('comicbooks-api');
import type { ComicCover } from '../types/cbAPI.types'; // Adjust the import path as needed

export default async function getRandomCover() {
	try {
	  // Fetch the latest comics. Assuming page 1 has a good variety.
	  // Adjust the pageNumber if needed.
	  const latestComics: ComicCover[] = await comicsApi.getLatestComics(1);

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
