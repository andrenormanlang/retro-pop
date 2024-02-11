import { useQuery } from "@tanstack/react-query";

async function fetchMarvelCharacters(searchTerm: string, page: number, pageSize: number) {
	const url = new URL("/api/marvel/marvel-characters", window.location.origin);

	url.searchParams.append("page", page.toString());
	url.searchParams.append("limit", pageSize.toString());

	if (searchTerm) {
		url.searchParams.append("query", searchTerm);
	}

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`API call failed with status: ${response.status}`);
	}
	"response", response;
	return response.json();
}

export const useGetMarvelCharacters = (searchTerm: string, page: number, pageSize: number) => {
	return useQuery({
		queryFn: () => fetchMarvelCharacters(searchTerm, page, pageSize),
		queryKey: ["characters", searchTerm, page],
	});
};

// This function fetches details of a single superhero
async function fetchMarvelCharacter(comicId: string) {
	const response = await fetch(`/api/marvel/marvel-characters/${comicId}`);

	if (!response.ok) {
		throw new Error(`API call failed with status: ${response.status}`);
	}

	return response.json();
}

// This hook uses the fetchSuperhero function to fetch data
export const useGetMarvelCharacter = (comicId: string) => {
	return useQuery({
		queryFn: () => fetchMarvelCharacter(comicId),
		queryKey: ["character", comicId],
	});
};
