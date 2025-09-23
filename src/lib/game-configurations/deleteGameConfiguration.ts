import { fetchData } from "@/lib/apiClient";

export const deleteGameConfiguration = async (
  configurationId: number
): Promise<void> => {
  await fetchData<void>(`/v1/game-configurations/${configurationId}`, {
    method: "DELETE",
  });
};

export default deleteGameConfiguration;
