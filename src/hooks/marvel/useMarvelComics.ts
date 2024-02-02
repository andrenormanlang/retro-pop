
import { useQuery } from '@tanstack/react-query';

async function fetchMarvelComics(searchTerm: string, page: number, pageSize: number) {
    const url = new URL('/api/marvel/marvel-comics', window.location.origin);

    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', pageSize.toString());
	

    if (searchTerm) {
        url.searchParams.append('query', searchTerm);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
    }

    return response.json();
}

export const useGetMarvelComics = (searchTerm: string, page: number, pageSize: number) => {
    return useQuery({
		queryFn: () => fetchMarvelComics(searchTerm, page, pageSize),
        queryKey: ['comics', searchTerm, page],
	});
};


// This function fetches details of a single superhero
async function fetchMarvelComic(comicId: string) {

  const response = await fetch(`/api/marvel/marvel-comics/${comicId}`);

  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }

  return response.json();
}

// This hook uses the fetchSuperhero function to fetch data
export const useGetSuperhero = (comicId: string) => {
  return useQuery({
    queryFn: () => fetchMarvelComic(comicId),
    queryKey: ['comic', comicId],
  });
};
