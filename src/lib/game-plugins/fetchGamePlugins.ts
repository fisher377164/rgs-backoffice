import { fetchData } from "@/lib/apiClient";
import {
  GamePlugin,
  GamePluginsResponse,
} from "@/lib/game-plugins/gamePluginType";

const normalizeGamePlugins = (response: GamePluginsResponse): GamePlugin[] => {
  return response.content ?? [];
};

export const fetchGamePlugins = async (
  configurationId: number
): Promise<GamePlugin[]> => {
  const response = await fetchData<GamePluginsResponse>(
    `/v1/game-plugins?gameConfigurationId=${configurationId}`,
    {
      cache: "no-store",
    }
  );

  return normalizeGamePlugins(response);
};

export default fetchGamePlugins;
