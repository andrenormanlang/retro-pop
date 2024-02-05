
import { useQuery } from '@tanstack/react-query';

async function fetchSuperheroes(searchTerm: string, page: number, pageSize: number) {
    const url = new URL('/api/superhero', window.location.origin);

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

export const useGetSuperheroes = (searchTerm: string, page: number, pageSize: number) => {
    return useQuery({
		queryFn: () => fetchSuperheroes(searchTerm, page, pageSize),
        queryKey: ['superheroes', searchTerm, page],
	});
};


// This function fetches details of a single superhero
async function fetchSuperhero(searchTerm: string, page: number,superheroId: string) {

  const response = await fetch(`/api/superhero/${superheroId}`);

  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }

  return response.json();
}

// This hook uses the fetchSuperhero function to fetch data
export const useGetSuperhero = (searchTerm: string, page: number, superheroId: string) => {
  return useQuery({
    queryFn: () => fetchSuperhero(searchTerm, page, superheroId),
    queryKey: ['superhero', searchTerm, page, superheroId],
  });
};
