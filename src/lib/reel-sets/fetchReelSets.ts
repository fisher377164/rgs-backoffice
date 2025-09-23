import { fetchData } from "@/lib/apiClient";
import { ReelSet, ReelSetsResponse } from "@/lib/reel-sets/reelSetType";

const normalizeReelSets = (response: ReelSetsResponse): ReelSet[] => {
  return response.content ?? [];
};

export const fetchReelSets = async (
  configurationId: number
): Promise<ReelSet[]> => {
  const response = await fetchData<ReelSetsResponse>(
    `/v1/reel-sets?gameConfigurationId=${configurationId}`,
    {
      cache: "no-store",
    }
  );

  return normalizeReelSets(response);
};

export default fetchReelSets;
