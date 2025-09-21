import { fetchData } from "@/lib/apiClient";
import { Plugin, PluginApiResponse } from "@/lib/plugins/pluginType";

const normalizePluginsResponse = (response: PluginApiResponse): Plugin[] => {
  if (!response.content) {
    return [];
  }

  return response.content.map(
    ({ id, pluginKey, name, groupId, artifactId, description, versions }) => ({
      id,
      pluginKey,
      name,
      groupId: groupId ?? "",
      artifactId: artifactId ?? "",
      description: description ?? "",
      versions:
        versions?.map(
          ({ id: versionId, version, changeLog, configuration }) => ({
            id: versionId,
            version,
            changeLog: changeLog ?? "",
            configuration: configuration ?? "",
          })
        ) ?? [],
    })
  );
};

export const fetchPlugins = async (): Promise<Plugin[]> => {
  const response = await fetchData<PluginApiResponse>("/v1/plugins", {
    cache: "no-store",
  });
  return normalizePluginsResponse(response);
};

export default fetchPlugins;
