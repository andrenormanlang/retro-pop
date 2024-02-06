export type CharactersList = {
    ID: number;
    CharacterName: string
};

export type CharactersApiResponse = {
    data: CharactersList[];
    status: string; // Include other properties that the API might be returning
};
