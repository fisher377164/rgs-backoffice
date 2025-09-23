import { fetchData } from "@/lib/apiClient";

export const deleteReelSet = async (id: number): Promise<void> => {
  await fetchData<void>(`/v1/reel-sets/${id}`, {
    method: "DELETE",
    headers: {
      accept: "*/*",
    },
  });
};

export default deleteReelSet;
