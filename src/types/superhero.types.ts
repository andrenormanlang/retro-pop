export type Superhero = {
    response: string;
    id: string;
    name: string;
    powerstats: PowerStats;
    biography: Biography;
    appearance: Appearance;
    work: Work;
    connections: Connections;
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
	'full-name': string;
    alteregos: string;
	'alter-egos': string;
    aliases: string[];
    placeOfBirth: string;
	'place-of-birth': string;
    'first-appearance': string;
    publisher: string;
    alignment: string;
}

interface Appearance {
    gender: string;
    race: string;
    height: string[];
    weight: string[];
    eyeColor: string;
	'eye-color': string;
    hairColor: string;
	'hair-color': string;
}

interface Work {
    occupation: string;
    base: string;
}

interface Connections {
    groupAffiliation: string;
	'group-affiliation': string;
    relatives: string;
}

interface Image {
    url: string;
}
