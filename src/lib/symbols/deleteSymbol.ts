import { fetchData } from "@/lib/apiClient";

export const deleteSymbol = async (symbolId: number): Promise<void> => {
  await fetchData<void>(`/v1/symbols/${symbolId}`, {
    method: "DELETE",
    headers: {
      accept: "*/*",
    },
  });
};

export default deleteSymbol;
