
import { useQuery } from '@tanstack/react-query';

async function fetchIssues(category: string, page: number, pageSize: number) {
  // Build the correct URL based on the category, page, and pageSize
  const url = new URL('/api/issues', window.location.origin);

  url.searchParams.append('page', page.toString());
  url.searchParams.append('pageSize', pageSize.toString());

  // Fetch data from the API
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }

  return response.json();
}

export const useGetComicVineIssues = (category: string, page: number, pageSize: number) => {
  // The query key is an array that includes 'comics', category, and page.
  // The queryFn and options are part of an object passed as the second argument.
  return useQuery({
	  queryFn: async () => fetchIssues(category, page, pageSize),
	  queryKey: ['comics', category, page],


  });
};
