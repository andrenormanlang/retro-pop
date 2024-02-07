export type CharactersList = {
    ID: number;
    CharacterName: string
};
export type Character = {
    ID: number;
    CharacterName: string
};



export type CharactersApiResponse = {
    data: CharactersList[];
    status: string;
	ID: number;
    CharacterName: string // Include other properties that the API might be returning
};
