export type MarvelComics = {
    id: number;
    digitalId: number;
    title: string;
    issueNumber: number;
    variantDescription: string;
    description: string;
    modified: string;
    isbn: string;
    upc: string;
    diamondCode: string;
    ean: string;
    issn: string;
    format: string;
    pageCount: number;
    textObjects: TextObject[];
    resourceURI: string;
    urls: MarvelURL[];
    series: Series;
    variants: Variant[];
    collections: any[];
    collectedIssues: any[];
    dates: DateItem[];
    prices: Price[];
    thumbnail: Image;
    images: Image[];
    creators: Creators;
    characters: Characters;
    stories: Stories;
    events: Events;
};

type TextObject = {
    type: string;
    language: string;
    text: string;
};

type MarvelURL = {
    type: string;
    url: string;
};

type Series = {
    resourceURI: string;
    name: string;
};

type Variant = {
    resourceURI: string;
    name: string;
};

type DateItem = {
    type: string;
    date: string;
};

type Price = {
    type: string;
    price: number;
};

type Image = {
    path: string;
    extension: string;
};

type Creators = {
    available: number;
    collectionURI: string;
    items: CreatorItem[];
    returned: number;
};

type CreatorItem = {
    resourceURI: string;
    name: string;
    role: string;
};

type Characters = {
    available: number;
    collectionURI: string;
    items: CharacterItem[];
    returned: number;
};

type CharacterItem = {
    resourceURI: string;
    name: string;
};

type Stories = {
    available: number;
    collectionURI: string;
    items: StoryItem[];
    returned: number;
};

type StoryItem = {
    resourceURI: string;
    name: string;
    type: string;
};

type Events = {
    available: number;
    collectionURI: string;
    items: any[];
    returned: number;
};
