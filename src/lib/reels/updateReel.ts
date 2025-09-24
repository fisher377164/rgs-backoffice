import { fetchData } from "@/lib/apiClient";
import { Reel, ReelPayload } from "@/lib/reels/reelType";

export const updateReel = async (id: number, payload: ReelPayload) => {
  return fetchData<Reel>(`/v1/reels/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};
