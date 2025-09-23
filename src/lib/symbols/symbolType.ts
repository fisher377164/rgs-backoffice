export interface GameSymbol {
  id: number;
  gameConfigurationId: number;
  name: string;
  description: string;
  type: string;
}

export interface SymbolsResponse {
  content?: GameSymbol[];
  totalElements: number;
  page: number;
  size: number;
}
