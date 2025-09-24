import { fetchData } from "@/lib/apiClient";
import { Reel } from "@/lib/reels/reelType";

export interface UpdateReelPayload {
  index: number;
  symbolIds: number[];
}

export const updateReel = async (
  reelId: number,
  payload: UpdateReelPayload
): Promise<Reel> => {
  return fetchData<Reel>(`/v1/reels/${reelId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export default updateReel;
