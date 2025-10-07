import { fetchData } from "@/lib/apiClient";
import { GamePlugin } from "@/lib/game-plugins/gamePluginType";

export interface CreateGamePluginPayload {
  gameConfigurationId: number;
  pluginVersionId: number;
  description?: string;
  configuration?: string;
}

export const createGamePlugin = async (
  payload: CreateGamePluginPayload
): Promise<GamePlugin> => {
  return fetchData<GamePlugin>("/v1/game-plugins", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(payload),
  });
};

export default createGamePlugin;
