export interface Game {
    id: number;
    gameKey: string;
    name: string;
    studioId?: number;
}

export interface GamesApiResponse {
    totalElements: number;
    page: number;
    size: number;
    content?: Game[];
}
