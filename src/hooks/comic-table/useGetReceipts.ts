import { useQuery } from '@tanstack/react-query';

async function fetchReceipts() {
  const response = await fetch('/api/receipts-admin');
  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }
  return response.json();
}

export const useGetReceipts = () => {
  return useQuery({
    queryKey: ['receipts'],
    queryFn: fetchReceipts,
  });
};
