import { fetchData } from "@/lib/apiClient";
import { GameSymbol, SymbolType } from "@/lib/symbols/symbolType";

export interface UpdateSymbolPayload {
  symbolId: number;
  name: string;
  description?: string;
  type: SymbolType;
}

export const updateSymbol = async (
  symbolId: number,
  payload: UpdateSymbolPayload
): Promise<GameSymbol> => {
  return fetchData<GameSymbol>(`/v1/symbols/${symbolId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(payload),
  });
};

export default updateSymbol;
