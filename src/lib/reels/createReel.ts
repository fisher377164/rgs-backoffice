import { fetchData } from "@/lib/apiClient";
import { Reel } from "@/lib/reels/reelType";

export interface CreateReelPayload {
  reelSetId: number;
  index: number;
  symbolIds: number[];
}

export const createReel = async (
  payload: CreateReelPayload
): Promise<Reel> => {
  return fetchData<Reel>("/v1/reels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export default createReel;
