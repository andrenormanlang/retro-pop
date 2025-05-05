export type MetronIssue = {
	id: number;
	series: {
		name: string;
		volume: number;
		year_began: number;
	};
	number: string;
	issue: string;
	cover_date: string;
	store_date: string;
	image: string;
	cover_hash: string;
}

export type  MetronResponse = {
	results: MetronIssue[];
	count: number;
	totalCount: number;
	recentCount: number;
	upcomingCount: number;
	totalPages: number;
	currentPage: number;
	pageSize: number;
	next: string | null;
	previous: string | null;
	view: ReleaseView;
}


export type ReleaseView = "recent" | "upcoming";

export type FetchReleasesParams = {
	page: number;
	pageSize: number;
	publisherName?: string;
	seriesName?: string;
	view: ReleaseView;
	query?: string;
}
