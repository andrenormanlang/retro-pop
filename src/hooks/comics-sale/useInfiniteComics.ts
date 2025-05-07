import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase/client";
import { Comic } from "@/types/comics-store/comic-detail.type";

interface FetchComicsResult {
	comics: Comic[];
	nextPage?: number;
}

const fetchComics = async ({
	pageParam = 0,
	queryKey,
}: {
	pageParam?: number;
	queryKey: [string, string];
}): Promise<FetchComicsResult> => {
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
	return useInfiniteQuery({
		queryKey: ["comics", searchQuery] as const,
		queryFn: fetchComics,
		getNextPageParam: (lastPage) => lastPage.nextPage,
		initialPageParam: 0,
	});
};
