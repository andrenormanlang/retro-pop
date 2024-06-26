import { useQuery } from "@tanstack/react-query";

async function fetchUsers() {
	const response = await fetch("/api/fetch-users");
	if (!response.ok) {
		throw new Error(`API call failed with status: ${response.status}`);
	}
	const data = await response.json();
	console.log(data.users);
	return data.users; // Return the users array directly
}

export const useGetUsers = () => {
	return useQuery({
		queryKey: ["users"],
		queryFn: fetchUsers,
		
	});
};
