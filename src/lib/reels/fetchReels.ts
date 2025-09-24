import { Reel } from "@/lib/reels/reelType";
import { fetchData } from "@/lib/apiClient";

export const fetchReels = async (reelSetId: number) => {
  const params = new URLSearchParams({ reelSetId: String(reelSetId) });

  return fetchData<Reel[]>(`/v1/reels?${params.toString()}`);
};
