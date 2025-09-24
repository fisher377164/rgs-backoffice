import { fetchData } from "@/lib/apiClient";
import { Reel, ReelPayload } from "@/lib/reels/reelType";

export const createReel = async (payload: ReelPayload) => {
  return fetchData<Reel>("/v1/reels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};
