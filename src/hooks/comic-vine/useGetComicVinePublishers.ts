
import { useQuery } from '@tanstack/react-query';

async function fetchPublishers(searchTerm: string, page: number, pageSize: number) {
	const url = new URL('/api/comic-vine/publishers', window.location.origin);

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

export const useGetComicVinePublishers = (category: string, page: number, pageSize: number) => {

  return useQuery({
	  queryFn: async () => fetchPublishers(category, page, pageSize),
	  queryKey: ['publishers', category, page],

	
  });
};


const fetchPublisher = async (publisherId: string) => {
	const response = await fetch(`/api/comic-vine/publishers/${publisherId}`);
	if (!response.ok) {
	  throw new Error('Network response was not ok');
	}
	return response.json();
  };

  export const useGetComicVinePublisher = (query: string, page: number, publisherId: string) => {
	return useQuery({
		queryFn: async () => fetchPublisher( publisherId),
		queryKey: ['publisher', query, page, publisherId],
	});
  };
