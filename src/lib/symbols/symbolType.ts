export const SYMBOL_TYPES = [
  "HIGH",
  "LOW",
  "SCATTER",
  "MULTIPLIER",
  "WILD",
  "STICKY_WILD",
  "JACKPOT",
  "BONUS",
] as const;

export type SymbolType = (typeof SYMBOL_TYPES)[number];

export interface GameSymbol {
  id: number;
  gameConfigurationId: number;
  name: string;
  description: string | null;
  type: SymbolType;
}

export interface SymbolsResponse {
  content?: GameSymbol[];
  totalElements: number;
  page: number;
  size: number;
}
