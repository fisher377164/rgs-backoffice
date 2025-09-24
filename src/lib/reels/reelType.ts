export interface Reel {
  id: number;
  reelSetId: number;
  index: number;
  symbolIds: number[];
}

export interface ReelPayload {
  reelSetId: number;
  index: number;
  symbolIds: number[];
}
