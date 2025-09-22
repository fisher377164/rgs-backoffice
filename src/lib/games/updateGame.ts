import { fetchData } from "@/lib/apiClient";
import { Game } from "@/lib/games/gameType";

export interface UpdateGamePayload {
  gameKey: string;
  name: string;
}

export const updateGame = async (
  gameId: number,
  payload: UpdateGamePayload
): Promise<Game> => {
  return fetchData<Game>(`/v1/games/${gameId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(payload),
  });
};

export default updateGame;
