import { useMutation, useQueryClient } from '@tanstack/react-query';

async function updateComics({ comicId, newStock, newPrice }: { comicId: string, newStock: number, newPrice: number }) {
  const response = await fetch('/api/comics-admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comicId, newStock, newPrice }),
  });

  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }

  return response.json();
}

export const useUpdateComics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateComics,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['comics'], (oldData: any) => {
        if (!oldData) return [];
        return oldData.map((comic: any) =>
          comic.id === variables.comicId ? { ...comic, stock: variables.newStock, price: variables.newPrice } : comic
        );
      });
    },
  });
};
