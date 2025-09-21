export interface PluginVersion {
  id: number;
  version: string;
  changeLog: string;
  configuration: string;
}

export interface Plugin {
  id: number;
  pluginKey: string;
  name: string;
  groupId: string;
  artifactId: string;
  description: string;
  versions: PluginVersion[];
}

export interface PluginApiResponse {
  totalElements: number;
  page: number;
  size: number;
  content?: Plugin[];
}
