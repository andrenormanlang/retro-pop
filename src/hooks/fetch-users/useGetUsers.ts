import { useQuery } from "@tanstack/react-query";

async function fetchUsers() {
	const response = await fetch("/api/fetch-users");
	if (!response.ok) {
		throw new Error(`API call failed with status: ${response.status}`);
	}
	const data = await response.json();
	if (!data) {
		throw new Error("No data received from the API");
	}
	return data; // Return the entire data array since it's already in the correct format
}

export const useGetUsers = () => {
	return useQuery({
		queryKey: ["users"],
		queryFn: fetchUsers,
		staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
		retry: 2, // Retry failed requests twice
	});
};
