export interface Plugin {
    id: number;
    pluginKey: string;
    name: string;
    studioId?: number;
}

export interface PluginApiResponse {
    totalElements: number;
    page: number;
    size: number;
    content?: Plugin[];
}
