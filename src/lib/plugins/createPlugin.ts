import { fetchData } from "@/lib/apiClient";
import { Plugin } from "@/lib/plugins/pluginType";

export interface CreatePluginPayload {
    name: string;
    pluginKey: string;
    version: string;
    configuration?: string;
}

export const createPlugin = async (payload: CreatePluginPayload): Promise<Plugin> => {
    return fetchData<Plugin>("/v1/plugins", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "*/*",
        },
        body: JSON.stringify(payload),
    });
};

export default createPlugin;
