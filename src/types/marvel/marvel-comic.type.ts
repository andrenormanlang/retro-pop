type ComicIssue = {
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
    urls: MarvelComicURL[];
    series: ComicSeries;
    variants: ComicVariant[];
    collections: ComicCollection[];
    collectedIssues: any[];
    dates: ComicDate[];
    prices: ComicPrice[];
    thumbnail: ComicImage;
    images: ComicImage[];
    creators: ComicCreators;
    characters: ComicCharacters;
    stories: ComicStories;
    events: ComicEvents;
};

type TextObject = {
    type: string;
    language: string;
    text: string;
};

type MarvelComicURL = {
    type: string;
    url: string;
};

type ComicSeries = {
    resourceURI: string;
    name: string;
};

type ComicVariant = {
    resourceURI: string;
    name: string;
};

type ComicCollection = {
    resourceURI: string;
    name: string;
};

type ComicDate = {
    type: string;
    date: string;
};

type ComicPrice = {
    type: string;
    price: number;
};

type ComicImage = {
    path: string;
    extension: string;
};

type ComicCreators = {
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

type ComicCharacters = {
    available: number;
    collectionURI: string;
    items: CharacterItem[];
    returned: number;
};

type CharacterItem = {
    resourceURI: string;
    name: string;
};

type ComicStories = {
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

type ComicEvents = {
    available: number;
    collectionURI: string;
    items: any[]; 
    returned: number;
};
