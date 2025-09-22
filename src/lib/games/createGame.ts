import { fetchData } from "@/lib/apiClient";
import { Game } from "@/lib/games/gameType";

export interface CreateGamePayload {
  gameKey: string;
  name: string;
  studioId: number;
}

export const createGame = async (payload: CreateGamePayload): Promise<Game> => {
  return fetchData<Game>("/v1/games", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(payload),
  });
};

export default createGame;
