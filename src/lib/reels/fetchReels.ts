import { fetchData } from "@/lib/apiClient";
import { Reel, ReelsResponse } from "@/lib/reels/reelType";

const normalizeReels = (response: ReelsResponse): Reel[] => {
  return (response.content ?? [])
    .filter((reel): reel is Reel => reel != null)
    .sort((a, b) => a.index - b.index);
};

interface FetchReelsParams {
  reelSetId: number;
  page?: number;
  size?: number;
}

export const fetchReels = async ({
  reelSetId,
  page = 0,
  size = 10,
}: FetchReelsParams): Promise<ReelsResponse> => {
  const response = await fetchData<ReelsResponse>(
    `/v1/reels?reelSetId=${reelSetId}&page=${page}&size=${size}`,
    {
      cache: "no-store",
    }
  );

  return {
    ...response,
    content: normalizeReels(response),
  };
};

export default fetchReels;
