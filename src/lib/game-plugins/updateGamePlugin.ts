import { fetchData } from "@/lib/apiClient";
import { GamePlugin } from "@/lib/game-plugins/gamePluginType";

export interface UpdateGamePluginPayload {
  description?: string;
  configuration?: string;
}

export const updateGamePlugin = async (
  id: number,
  payload: UpdateGamePluginPayload
): Promise<GamePlugin> => {
  return fetchData<GamePlugin>(`/v1/game-plugins/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(payload),
  });
};

export default updateGamePlugin;
