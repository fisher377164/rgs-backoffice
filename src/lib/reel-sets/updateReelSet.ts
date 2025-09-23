import { fetchData } from "@/lib/apiClient";
import { ReelSet } from "@/lib/reel-sets/reelSetType";

export interface UpdateReelSetPayload {
  gameConfigurationId: number;
  reelSetKey: string;
}

export const updateReelSet = async (
  id: number,
  payload: UpdateReelSetPayload
): Promise<ReelSet> => {
  return fetchData<ReelSet>(`/v1/reel-sets/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(payload),
  });
};

export default updateReelSet;
