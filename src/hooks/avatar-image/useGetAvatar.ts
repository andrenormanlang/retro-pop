// src/hooks/useGetAvatar.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

async function fetchAvatar(userId: string) {
  const response = await fetch(`/api/avatar-image?userId=${userId}`);
  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }
  const data = await response.json();
  return data.avatarUrl; // Return the avatar URL directly
}

type QueryOptions = UseQueryOptions<string, Error, string, [string, string]>;

export const useGetAvatar = (userId: string) => {
  const queryOptions: QueryOptions = {
    queryKey: ['avatar', userId],
    queryFn: () => fetchAvatar(userId),
    staleTime: 1000 * 60 * 5, // Cache the data for 5 minutes
    enabled: !!userId, // Only run the query if userId is provided
  };

  return useQuery(queryOptions);
};

