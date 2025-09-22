import { fetchData } from "@/lib/apiClient";
import { GameConfiguration } from "@/lib/game-configurations/gameConfigurationType";

export const fetchGameConfiguration = async (
  configurationId: number
): Promise<GameConfiguration> => {
  return fetchData<GameConfiguration>(
    `/v1/game-configurations/${configurationId}`,
    {
      cache: "no-store",
    }
  );
};

export default fetchGameConfiguration;
