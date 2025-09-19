import { fetchData } from "@/lib/apiClient";
import { Game, GamesApiResponse } from "@/lib/games/gameType";

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
    const response = await fetchData<GamesApiResponse>("/v1/games", {cache: "no-store"});
    return normalizeGamesResponse(response);
};

export default fetchGames;
