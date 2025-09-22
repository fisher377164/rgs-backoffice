import { fetchData } from "@/lib/apiClient";
import { GameConfiguration } from "@/lib/game-configurations/gameConfigurationType";

export interface CreateGameConfigurationPayload {
  gameId: number;
  name: string;
  configuration?: string;
}

export const createGameConfiguration = async (
  payload: CreateGameConfigurationPayload
): Promise<GameConfiguration> => {
  return fetchData<GameConfiguration>("/v1/game-configurations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(payload),
  });
};

export default createGameConfiguration;
