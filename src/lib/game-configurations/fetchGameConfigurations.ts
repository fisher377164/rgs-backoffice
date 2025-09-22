import { fetchData } from "@/lib/apiClient";
import {
  GameConfiguration,
  GameConfigurationsResponse,
} from "@/lib/game-configurations/gameConfigurationType";

const normalizeResponse = (
  response: GameConfigurationsResponse
): GameConfiguration[] => {
  return response.content ?? [];
};

export const fetchGameConfigurations = async (
  gameId: number
): Promise<GameConfiguration[]> => {
  const response = await fetchData<GameConfigurationsResponse>(
    `/v1/game-configurations?gameId=${gameId}`,
    {
      cache: "no-store",
    }
  );

  return normalizeResponse(response);
};

export default fetchGameConfigurations;
