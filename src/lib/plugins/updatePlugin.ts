import { fetchData } from "@/lib/apiClient";
import { Plugin } from "@/lib/plugins/pluginType";

export interface UpdatePluginPayload {
    name: string;
    pluginKey: string;
    groupId: string;
    artifactId: string;
    description?: string;
}

export const updatePlugin = async (
    pluginId: string | number,
    payload: UpdatePluginPayload,
): Promise<Plugin> => {
    return fetchData<Plugin>(`/v1/plugins/${pluginId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            accept: "*/*",
        },
        body: JSON.stringify(payload),
    });
};

export default updatePlugin;
