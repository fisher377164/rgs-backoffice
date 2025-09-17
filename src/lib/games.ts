import { fetchJson } from "@/lib/apiClient";

export interface Game {
  id: number;
  key: string;
  name: string;
  studioId?: number;
}

type GamesApiResponse =
  | Game[]
  | { data?: Game[] }
  | {
      content?: {
        id: number;
        gameId: string;
        name: string;
        studioId: number;
      }[];
    };

const normalizeGamesResponse = (response: GamesApiResponse): Game[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if ("content" in response && Array.isArray(response.content)) {
    return response.content.map(({ id, gameId, name, studioId }) => ({
      id,
      key: gameId,
      name,
      studioId,
    }));
  }

  if ("data" in response && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

export const fetchGames = async (): Promise<Game[]> => {
  const response = await fetchJson<GamesApiResponse>("/v1/games", { cache: "no-store" });
  return normalizeGamesResponse(response);
};

export default fetchGames;
