// src/hooks/fetch-comics/useUpdateStock.ts

// src/hooks/fetch-comics/useUpdateStock.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';

async function updateStock({ comicId, newStock }: { comicId: string, newStock: number }) {
  const response = await fetch('/api/comics-table', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comicId, newStock }),
  });

  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }

  return response.json();
}

export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStock,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['comics'], (oldData: any) => {
        if (!oldData) return [];
        return oldData.map((comic: any) =>
          comic.id === variables.comicId ? { ...comic, stock: variables.newStock } : comic
        );
      });
    },
  });
};
