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
    cover_date: string;
    // Include any other properties as per the API response
    deck: string | null; // Add the deck field
    description: string | null; // Add the description field
  };


  export type ComicVineIssue = {
	id: number;
	name: string;
	issue_number: string;
	aliases: string | null;
	api_detail_url: string;
	character_credits: CharacterCredit[];
	concept_credits: ConceptCredit[];
	cover_date: string;
	date_added: string;
	date_last_updated: string;
	deck: string | null;
	description: string | null;
	image: ComicImage;
	store_date: string;
	volume: {
	  api_detail_url: string;
	  id: number;
	  name: string;
	  site_detail_url: string;
	};
	person_credits: PersonCredit[]; // Add this line
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

  type CharacterCredit = {
	api_detail_url: string;
	id: number;
	name: string;
	site_detail_url: string;
	image: {
	  original_url: string;
	};
  };

  type ConceptCredit = {
	api_detail_url: string;
	id: number;
	name: string;
	site_detail_url: string;
  };

  type PersonCredit = {
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
