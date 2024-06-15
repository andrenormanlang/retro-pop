// src/types/comic.ts

export type Comic = {
	id: string;
	user_id: string;
	created_at: string;
	image: string;
	title: string;
	genre: string;
	release_date: string;
	pages: number;
	publisher: string;
	main_artist: string;
	main_writer: string;
	description: string;
	price: number;
	currency: string;
  }
