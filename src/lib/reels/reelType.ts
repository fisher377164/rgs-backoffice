export interface Reel {
  id: number;
  reelSetId: number;
  index: number;
  symbolIds: number[];
}

export interface ReelsResponse {
  content?: Reel[];
  totalElements: number;
  page: number;
  size: number;
}
