
import { useQuery } from '@tanstack/react-query';

async function fetchComics(searchTerm: string, page: number, pageSize: number) {
	const url = new URL('/api/comicbooks-api', window.location.origin);

	url.searchParams.append('page', page.toString());
	url.searchParams.append('pageSize', pageSize.toString());

	if (searchTerm) {
	  url.searchParams.append('query', searchTerm);
	}


	const response = await fetch(url.toString());
	if (!response.ok) {
	  throw new Error(`API call failed with status: ${response.status}`);
	}
	return response.json();
  }

export const useGetComicBooksApi = (search: string, page: number, pageSize: number) => {

  return useQuery({
	  queryFn: async () => fetchComics(search, page, pageSize),
	  queryKey: ['comics', search, page],


  });
};
