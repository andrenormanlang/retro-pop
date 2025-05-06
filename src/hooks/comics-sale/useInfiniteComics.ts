import { useInfiniteQuery, QueryFunctionContext } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase/client";
import { Comic } from "@/types/comics-store/comic-detail.type";

interface FetchComicsParams extends QueryFunctionContext<[string, string]> {
	pageParam?: number;
}

interface FetchComicsResult {
	comics: Comic[];
	nextPage?: number;
}

const fetchComics = async ({ pageParam = 0, queryKey }: FetchComicsParams): Promise<FetchComicsResult> => {
	const searchQuery = queryKey[1];
	const pageSize = 8;

	const { data, error } = await supabase
		.from("comics-sell")
		.select("*")
		.ilike("title", `%${searchQuery}%`)
		.order("created_at", { ascending: false })
		.range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);

	if (error) {
		throw new Error(error.message);
	}

	return {
		comics: data as Comic[],
		nextPage: data.length === pageSize ? pageParam + 1 : undefined,
	};
};

export const useInfiniteComics = (searchQuery: string) => {
	return useInfiniteQuery<FetchComicsResult, Error>({
		queryKey: ["comics", searchQuery],
		queryFn: fetchComics,
		getNextPageParam: (lastPage) => lastPage.nextPage,
	});
};
