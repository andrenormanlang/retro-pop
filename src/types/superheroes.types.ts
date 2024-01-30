export type Superheroes = {
	id: number;
	name: string;
	slug: string;
	powerstats: PowerStats;
	appearance: Appearance;
	biography: Biography;
	work: Work;
	connections: Connections;
	images: Images;
	image: Image;
  }

interface PowerStats {
	intelligence: string;
	strength: string;
	speed: string;
	durability: string;
	power: string;
	combat: string;
  }

  interface Biography {
	fullName: string;
	alterEgos: string;
	aliases: string[];
	placeOfBirth: string;
	firstAppearance: string;
	publisher: string;
	alignment: string;
  }

  interface Appearance {
	gender: string;
	race: string;
	height: string[];
	weight: string[];
	eyeColor: string;
	hairColor: string;
  }

  interface Work {
	occupation: string;
	base: string;
  }

  interface Connections {
	groupAffiliation: string;
	relatives: string;
  }

  interface Images {
	xs: string;
	sm: string;
	md: string;
	lg: string;
  }

  interface Image {
	url: string;
  }
