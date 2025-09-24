import { fetchData } from "@/lib/apiClient";

export const deleteReel = async (id: number) => {
  await fetchData<void>(`/v1/reels/${id}`, {
    method: "DELETE",
  });
};
