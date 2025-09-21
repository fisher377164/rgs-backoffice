import { fetchData } from "@/lib/apiClient";
import { PluginVersion } from "@/lib/plugins/pluginType";

export interface CreatePluginVersionPayload {
    version: string;
    changeLog?: string;
    configuration: string;
}

export const createPluginVersion = async (
    pluginId: string | number,
    payload: CreatePluginVersionPayload,
): Promise<PluginVersion> => {
    return fetchData<PluginVersion>(`/v1/plugins/${pluginId}/versions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "*/*",
        },
        body: JSON.stringify(payload),
    });
};

export default createPluginVersion;
