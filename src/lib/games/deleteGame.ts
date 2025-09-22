import { fetchData } from "@/lib/apiClient";

export const deleteGame = async (gameId: number): Promise<void> => {
  await fetchData<void>(`/v1/games/${gameId}`, {
    method: "DELETE",
  });
};

export default deleteGame;
