import { fetchData } from "@/lib/apiClient";
import { GameConfiguration } from "@/lib/game-configurations/gameConfigurationType";

export interface UpdateGameConfigurationPayload {
  name: string;
  configuration?: string;
}

export const updateGameConfiguration = async (
  configurationId: number,
  payload: UpdateGameConfigurationPayload
): Promise<GameConfiguration> => {
  return fetchData<GameConfiguration>(`/v1/game-configurations/${configurationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(payload),
  });
};

export default updateGameConfiguration;
