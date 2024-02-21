export type ComicVine = {
    id: number;
    name: string | null;
    issue_number: string;
	store_date: string;
    image: {
      original_url: string;
    };
    volume: {
      name: string;
    };
	publisher: {
		name: string;
	};
    cover_date: string;
    // Include any other properties as per the API response
    deck: string | null; // Add the deck field
    description: string | null; // Add the description field
  };


  export type ComicVineIssue = {
	id?: number;
	name?: string;
	issue_number?: string;
	aliases?: string | null;
	api_detail_url?: string;
	character_credits?: CharacterCredit[];
	concept_credits?: ConceptCredit[];
	cover_date?: string;
	date_added?: string;
	date_last_updated?: string;
	deck?: string | null;
	description?: string | null;
	image?: ComicImage;
	store_date?: string;
	volume?: {
	  api_detail_url?: string;
	  id?: number;
	  name?: string;
	  site_detail_url?: string;
	};
	person_credits?: PersonCredit[];
  };


  type ComicImage = {
	icon_url: string;
	medium_url: string;
	screen_url: string;
	screen_large_url: string;
	small_url: string;
	super_url: string;
	thumb_url: string;
	tiny_url: string;
	original_url: string;
	image_tags: string;
  };

 export type CharacterCredit = {
	api_detail_url: string;
	id: number;
	name: string;
	site_detail_url: string;
	image: {
	  original_url: string;
	};
  };
 export type VolumeCredit = {
	api_detail_url: string;
	id: number;
	name: string;
	site_detail_url: string;
	image: {
	  original_url: string;
	};
  };

 export type ConceptCredit = {
	api_detail_url: string;
	id: number;
	name: string;
	site_detail_url: string;
  };

 export type PersonCredit = {
	api_detail_url: string;
	id: number;
	name: string;
	role: string;
	site_detail_url: string;
	image: {
	  original_url: string;
	};
  };

export type SearchQuery = {
	[key: string]: number | string;
  	page: number;
  	query: string;
}

export type Publishers = {
	alias: string | null;
	api_detail_url: string;
	date_added: string;
	date_last_updated: string;
	deck: string | null;
	id: number;
	image: {
	  icon_url: string;
	  medium_url: string;
	  screen_url: string;
	  screen_large_url: string;
	  small_url: string;
	  super_url: string;
	  thumb_url: string;
	  tiny_url: string;
	  original_url: string;
	  image_tags: string;
	};
	location_address: string;
	location_city: string;
	location_state: string;
	name: string;
	site_detail_url: string;
}

export type Publisher = {
	aliases: string;
	api_detail_url: string;
	characters: CharacterCredit[];
	deck: string;
	description: string;
	id: number;
	volumes: VolumeCredit[];
	location_address: string;
	location_city: string;
	location_state: string;
}

