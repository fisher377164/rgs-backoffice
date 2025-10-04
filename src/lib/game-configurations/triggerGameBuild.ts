import { fetchData } from "@/lib/apiClient";

export const triggerGameBuild = async (configurationId: number): Promise<void> => {
  if (!Number.isInteger(configurationId) || configurationId <= 0) {
    throw new Error("A valid configuration identifier is required");
  }

  await fetchData<void>(`/v1/trigger-game-build/${configurationId}`, {
    method: "POST",
    headers: {
      accept: "*/*",
    },
  });
};

export default triggerGameBuild;
