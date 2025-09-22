import { fetchData } from "@/lib/apiClient";
import { Game } from "@/lib/games/gameType";

export const fetchGameById = async (gameId: number): Promise<Game> => {
  return fetchData<Game>(`/v1/games/${gameId}`, {
    cache: "no-store",
  });
};

export default fetchGameById;
