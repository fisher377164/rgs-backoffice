import { fetchJson } from "@/lib/apiClient";

export interface Game {
    id: number;
    gameKey: string;
    name: string;
    studioId?: number;
}

type GamesApiResponse = {
    totalElements: number,
    page: number,
    size: number
    content?: Game[];
};

const normalizeGamesResponse = (response: GamesApiResponse): Game[] => {
     if (response.content) {
        return response.content.map(({id, gameKey, name, studioId}) => ({
            id,
            gameKey,
            name,
            studioId,
        }));
    }

    return [];
};

export const fetchGames = async (): Promise<Game[]> => {
    const response = await fetchJson<GamesApiResponse>("/v1/games", {cache: "no-store"});
    return normalizeGamesResponse(response);
};

export default fetchGames;
