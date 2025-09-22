export interface GameConfiguration {
  id: number;
  gameId: number;
  name: string;
  configuration?: string | null;
}

export interface GameConfigurationsResponse {
  content: GameConfiguration[];
  totalElements: number;
  page: number;
  size: number;
}
