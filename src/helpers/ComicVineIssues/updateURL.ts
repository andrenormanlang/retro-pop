// 'use client';
// import { useSearchParams } from 'next/navigation';
// import { useRouter } from 'next/navigation';

// export const updateURL = (page: number, searchTerm?: string) => {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const { replace, pathname } = useRouter();

//   // Update the page and searchTerm parameters
//   const newParams = new URLSearchParams(searchParams);
//   newParams.set('page', page.toString());
//   if (searchTerm) {
//     newParams.set('query', searchTerm);
//   } else {
//     newParams.delete('query');
//   }

//   // Replace the URL with the new parameters
//   replace(`${pathname}?${newParams.toString()}`);
// };
