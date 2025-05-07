export type User = {
	id: string;
	username: string | null;
	full_name: string | null;
	email: string | null;
	avatar_url: string | null;
	created: string | null;
	last_sign_in: string | null;
	is_admin: boolean;
};

export type SortConfig = {
	key: keyof User;
	direction: "ascending" | "descending";
};
