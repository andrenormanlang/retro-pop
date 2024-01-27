export type ComicIssue = {
    id: number;
    series: {
        name: string;
        volume: number;
        year_began: number;
    };
    number: string;
    issue: string;
    cover_date: string;
    image: string;
    cover_hash: string;
    modified: string;
};

export type ComicIssuesResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: ComicIssue[];
};
