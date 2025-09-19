import { fetchData } from "@/lib/apiClient";
import { Plugin, PluginApiResponse } from "@/lib/plugins/pluginType";

const normalizeGamesResponse = (response: PluginApiResponse): Plugin[] => {
     if (response.content) {
        return response.content.map(({id, pluginKey, name, studioId}) => ({
            id,
            pluginKey,
            name,
            studioId,
        }));
    }

    return [];
};

export const fetchPlugins = async (): Promise<Plugin[]> => {
    const response = await fetchData<PluginApiResponse>("/v1/plugins", {cache: "no-store"});
    return normalizeGamesResponse(response);
};

export default fetchPlugins;
