export type MetronIssueDetail = {
	id: number;
	publisher: {
		id: number;
		name: string;
	};
	imprint: {
		id: number;
		name: string;
	} | null;
	series: {
		id: number;
		name: string;
		sort_name: string;
		volume: number;
		year_began: number;
		series_type: {
			id: number;
			name: string;
		};
		genres: Array<{
			id: number;
			name: string;
		}>;
	};
	number: string;
	alt_number: string;
	title: string;
	name: string[];
	cover_date: string;
	store_date: string;
	price: string;
	rating: {
		id: number;
		name: string;
	};
	sku: string;
	isbn: string;
	upc: string;
	page: number;
	desc: string;
	image: string;
	cover_hash: string;
	arcs: any[];
	credits: Array<{
		id: number;
		creator: string;
		role: Array<{
			id: number;
			name: string;
		}>;
	}>;
	characters: Array<{
		id: number;
		name: string;
		modified: string;
	}>;
	teams: any[];
	resource_url: string;
}
