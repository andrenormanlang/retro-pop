
import { useQuery } from '@tanstack/react-query';

async function fetchCharacters(searchTerm: string, page: number, pageSize: number) {
	const url = new URL('/api/comic-vine/characters', window.location.origin);

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

export const useGetComicVineCharacters = (category: string, page: number, pageSize: number) => {

  return useQuery({
	  queryFn: async () => fetchCharacters(category, page, pageSize),
	  queryKey: ['comics', category, page],


  });
};


const fetchCharacter = async (issueId: string) => {
	const response = await fetch(`/api/comic-vine/characters/${issueId}`);
	if (!response.ok) {
	  throw new Error('Network response was not ok');
	}
	return response.json();
  };

  export const useGetComicVineCharacter = (query: string, page: number, issueId: string) => {
	return useQuery({
		queryFn: async () => fetchCharacter( issueId),
		queryKey: ['comic', query, page, issueId],
	});
  };
