import { fetchData } from "@/lib/apiClient";

export const deleteGamePlugin = async (id: number): Promise<void> => {
  await fetchData<void>(`/v1/game-plugins/${id}`, {
    method: "DELETE",
    headers: {
      accept: "*/*",
    },
  });
};

export default deleteGamePlugin;
