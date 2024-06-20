// src/hooks/fetch-comics/useGetComics.ts

import { useQuery } from '@tanstack/react-query';

async function fetchComics() {
  const response = await fetch('/api/comics-table');
  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }
  return response.json();
}

export const useGetComics = () => {
  return useQuery({
    queryKey: ['comics'],
    queryFn: fetchComics,
  });
};

