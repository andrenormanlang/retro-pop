
import { useQuery } from '@tanstack/react-query';

async function fetchIssues(searchTerm: string, page: number, pageSize: number) {
	const url = new URL('/api/comic-vine/issues', window.location.origin);

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

export const useGetComicVineIssues = (category: string, page: number, pageSize: number) => {

  return useQuery({
	  queryFn: async () => fetchIssues(category, page, pageSize),
	  queryKey: ['comics', category, page],


  });
};


const fetchIssue = async (issueId: string) => {
	const response = await fetch(`/api/comic-vine/issues/${issueId}`);
	if (!response.ok) {
	  throw new Error('Network response was not ok');
	}
	return response.json();
  };

  export const useGetComicVineIssue = (query: string, page: number, issueId: string) => {
	return useQuery({
		queryFn: async () => fetchIssue( issueId),
		queryKey: ['comic', query, page, issueId],
	});
  };
