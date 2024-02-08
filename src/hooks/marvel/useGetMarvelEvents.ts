
import { useQuery } from '@tanstack/react-query';

async function fetchMarvelEvents(searchTerm: string, page: number, pageSize: number) {
    const url = new URL('/api/marvel/marvel-events', window.location.origin);

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

export const useGetMarvelEvents = (searchTerm: string, page: number, pageSize: number) => {
    return useQuery({
		queryFn: () => fetchMarvelEvents(searchTerm, page, pageSize),
        queryKey: ['comics', searchTerm, page],
	});
};


// This function fetches details of a single superhero
async function fetchMarvelEvent(comicId: string) {

  const response = await fetch(`/api/marvel/marvel-events/${comicId}`);

  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }

  return response.json();
}

// This hook uses the fetchSuperhero function to fetch data
export const useGetMarvelEvent = (comicId: string) => {
  return useQuery({
    queryFn: () => fetchMarvelEvent(comicId),
    queryKey: ['comic', comicId],
  });
};
