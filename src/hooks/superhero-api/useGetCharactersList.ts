'use client'

// import { CharactersList } from '@/types/characters-list.types';
// import { useState, useEffect } from 'react';


// const useGetCharactersList = () => {
//   const [characters, setCharacters] = useState<CharactersList[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<Error | null>(null);

//   useEffect(() => {
//     const fetchCharacters = async () => {
//       setIsLoading(true);
//       try {
//         // Replace '/api/characters' with your API route if different
//         const response = await fetch('/api/characters-list');
//         if (!response.ok) {
//           throw new Error(`API call failed with status: ${response.status}`);
//         }
//         const data = await response.json();
//         setCharacters(data.data); // Assuming the response has a 'data' field with the characters array
//       } catch (e) {
//         if (e instanceof Error) {
//           setError(e);
//         } else {
//           setError(new Error('An unexpected error occurred'));
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCharacters();
//   }, []); // The empty array ensures this effect runs only once when the component mounts

//   return { characters, isLoading, error };
// };

// export default useGetCharactersList;

import { useQuery } from '@tanstack/react-query';
import { CharactersApiResponse } from '@/types/characters-list.types';

// This function is an example, replace it with your actual API call
const fetchCharacters = async (): Promise<CharactersApiResponse> => {
    const response = await fetch('/api/characters');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

export const useGetCharactersList = () => {
    return useQuery<CharactersApiResponse, Error>({
        queryKey: ['getCharactersList'],
        queryFn: fetchCharacters,
    });
};
