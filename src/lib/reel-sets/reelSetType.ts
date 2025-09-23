export interface ReelSet {
  id: number;
  gameConfigurationId: number;
  reelSetKey: string;
}

export interface ReelSetsResponse {
  content?: ReelSet[];
  totalElements: number;
  page: number;
  size: number;
}
