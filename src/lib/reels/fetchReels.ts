import { Reel } from "@/lib/reels/reelType";
import { fetchData } from "@/lib/apiClient";

interface ReelsResponse {
  content: Reel[];
  totalElements: number;
  page: number;
  size: number;
}

export const fetchReels = async (reelSetId: number) => {
  const params = new URLSearchParams({ reelSetId: String(reelSetId) });

  const { content } = await fetchData<ReelsResponse>(`/v1/reels?${params.toString()}`);

  return Array.isArray(content) ? content : [];
};
