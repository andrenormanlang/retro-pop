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
    alteregos: string;
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

interface Image {
    url: string;
}
