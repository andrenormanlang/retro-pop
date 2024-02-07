import { useQuery } from '@tanstack/react-query';
import { CharactersList } from '@/types/characters-list.types';

const fetchCharactersList = async () => {
  const response = await fetch('/api/characters-list');
  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }
  return response.json();
};

const useGetCharactersList = () => {
  return useQuery<CharactersList[], Error>({
    queryKey: ['charactersList'],
    queryFn: fetchCharactersList,
  });
};

export default useGetCharactersList;

