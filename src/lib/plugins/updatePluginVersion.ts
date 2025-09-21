import { fetchData } from "@/lib/apiClient";
import { PluginVersion } from "@/lib/plugins/pluginType";

export interface UpdatePluginVersionPayload {
    version: string;
    changeLog?: string;
    configuration: string;
}

export const updatePluginVersion = async (
    pluginId: string | number,
    versionId: string | number,
    payload: UpdatePluginVersionPayload,
): Promise<PluginVersion> => {
    return fetchData<PluginVersion>(`/v1/plugins/${pluginId}/versions/${versionId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "*/*",
        },
        body: JSON.stringify(payload),
    });
};

export default updatePluginVersion;
