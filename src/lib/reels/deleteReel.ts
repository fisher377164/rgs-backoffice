import { fetchData } from "@/lib/apiClient";

export const deleteReel = async (reelId: number): Promise<void> => {
  await fetchData<void>(`/v1/reels/${reelId}`, {
    method: "DELETE",
  });
};

export default deleteReel;
