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
    newSearchParams.set('page', page.toString());

    // Use the pathname from usePathname hook
    router.push(`${pathname}?${newSearchParams.toString()}`);
  }, [router, pathname]);


  // Set the initial search parameters from the URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('query') || defaultQuery;
    const page = parseInt(searchParams.get('page') || defaultPage.toString(), 10);
    setSearchTerm(query);
    setCurrentPage(page);
  }, [ defaultPage, defaultQuery]);

  return { searchTerm, setSearchTerm, currentPage, setCurrentPage, updateUrl };
};
