export interface GamePlugin {
  id: number;
  gameConfigurationId: number;
  pluginId: number;
  description: string;
  configuration: string;
}

export interface GamePluginsResponse {
  content?: GamePlugin[];
  totalElements: number;
  page: number;
  size: number;
}
