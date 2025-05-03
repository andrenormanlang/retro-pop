import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const useSearchParameters = (defaultPage = 1, defaultQuery = "") => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState(defaultQuery);
  const [currentPage, setCurrentPage] = useState(defaultPage);

  // Update the URL with the new search parameters
  const updateUrl = useCallback((term: string, page: number) => {
    const newSearchParams = new URLSearchParams();
    if (term) newSearchParams.set('query', term);
    // Ensure page is a valid number
    const validPage = !isNaN(page) && page > 0 ? page : defaultPage;
    newSearchParams.set('page', validPage.toString());

    // Use the pathname from usePathname hook
    router.push(`${pathname}?${newSearchParams.toString()}`);
  }, [router, pathname, defaultPage]);

  // Set the initial search parameters from the URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('query') || defaultQuery;
    const pageParam = searchParams.get('page');
    // Ensure page is a valid number
    const page = pageParam ? parseInt(pageParam, 10) : defaultPage;
    const validPage = !isNaN(page) && page > 0 ? page : defaultPage;

    setSearchTerm(query);
    setCurrentPage(validPage);
  }, [defaultPage, defaultQuery]);

  return { searchTerm, setSearchTerm, currentPage, setCurrentPage, updateUrl };
};
