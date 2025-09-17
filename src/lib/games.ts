import { fetchJson } from "@/lib/apiClient";

export interface Game {
  id: number;
  key: string;
  name: string;
}

type GamesApiResponse = Game[] | { data?: Game[] };

const normalizeGamesResponse = (response: GamesApiResponse): Game[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return response.data ?? [];
};

export const fetchGames = async (): Promise<Game[]> => {
  const response = await fetchJson<GamesApiResponse>("/v1/games", { cache: "no-store" });
  return normalizeGamesResponse(response);
};

export default fetchGames;
