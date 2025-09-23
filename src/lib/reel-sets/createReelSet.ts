import { fetchData } from "@/lib/apiClient";
import { ReelSet } from "@/lib/reel-sets/reelSetType";

export interface CreateReelSetPayload {
  gameConfigurationId: number;
  reelSetKey: string;
}

export const createReelSet = async (
  payload: CreateReelSetPayload
): Promise<ReelSet> => {
  return fetchData<ReelSet>("/v1/reel-sets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(payload),
  });
};

export default createReelSet;
