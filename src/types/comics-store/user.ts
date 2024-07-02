export type User = {
	id: string;
	username: string;
	email: string;
	avatar_url?: string;
	created?: string;
	last_sign_in?: string;
	[key: string]: any;  // This line is the index signature
  }


  export type SortConfig = {
	key: keyof User;
	direction: 'ascending' | 'descending';
  }

