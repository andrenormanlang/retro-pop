import { useMutation, useQueryClient, UseMutationResult, UseMutationOptions } from '@tanstack/react-query';

interface UpdateStockVariables {
  comicId: string;
  newStock: number;
}

async function updateStock({ comicId, newStock }: UpdateStockVariables): Promise<any> {
  const response = await fetch('/api/update-stock', {
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

export const useUpdateStock = (): UseMutationResult<any, unknown, UpdateStockVariables, unknown> => {
  const queryClient = useQueryClient();

  return useMutation<any, unknown, UpdateStockVariables>({
    mutationFn: updateStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comics'] });
    },
  });
};



