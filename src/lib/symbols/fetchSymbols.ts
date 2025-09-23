import { fetchData } from "@/lib/apiClient";
import { GameSymbol, SymbolsResponse } from "@/lib/symbols/symbolType";

const normalizeSymbols = (response: SymbolsResponse): GameSymbol[] => {
  return response.content ?? [];
};

export const fetchSymbols = async (
  configurationId: number
): Promise<GameSymbol[]> => {
  const response = await fetchData<SymbolsResponse>(
    `/v1/symbols?gameConfigurationId=${configurationId}`,
    {
      cache: "no-store",
    }
  );

  return normalizeSymbols(response);
};

export default fetchSymbols;
