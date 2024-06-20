import { useQuery } from '@tanstack/react-query';

async function fetchUsers() {
  const url = new URL('/api/fetch-users', window.location.origin);
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }
  const data = await response.json();
  return data.users; // Return the users array directly
}

export const useGetUsers = () => {
  return useQuery({
    queryFn: fetchUsers,
    queryKey: ['users'],
  });
};
