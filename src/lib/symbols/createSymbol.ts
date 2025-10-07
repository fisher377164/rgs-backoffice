import { fetchData } from "@/lib/apiClient";
import { GameSymbol, SymbolType } from "@/lib/symbols/symbolType";

export interface CreateSymbolPayload {
  gameConfigurationId: number;
  symbolId: number;
  name: string;
  description?: string;
  type: SymbolType;
}

export const createSymbol = async (
  payload: CreateSymbolPayload
): Promise<GameSymbol> => {
  return fetchData<GameSymbol>("/v1/symbols", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(payload),
  });
};

export default createSymbol;
