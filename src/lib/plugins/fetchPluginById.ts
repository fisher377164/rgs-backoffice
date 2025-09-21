import { fetchData } from "@/lib/apiClient";
import { Plugin, PluginVersion } from "@/lib/plugins/pluginType";

interface PluginResponseVersion {
    id: number;
    version: string;
    changeLog?: string | null;
    configuration?: string | null;
}

interface PluginResponse {
    id: number;
    name: string;
    pluginKey: string;
    groupId?: string | null;
    artifactId?: string | null;
    description?: string | null;
    versions?: PluginResponseVersion[] | null;
}

const normalizeVersion = ({ id, version, changeLog, configuration }: PluginResponseVersion): PluginVersion => ({
    id,
    version,
    changeLog: changeLog ?? "",
    configuration: configuration ?? "",
});

const normalizePlugin = ({
    id,
    name,
    pluginKey,
    groupId,
    artifactId,
    description,
    versions,
}: PluginResponse): Plugin => ({
    id,
    name,
    pluginKey,
    groupId: groupId ?? "",
    artifactId: artifactId ?? "",
    description: description ?? "",
    versions: versions?.map(normalizeVersion) ?? [],
});

export const fetchPluginById = async (pluginId: string | number): Promise<Plugin> => {
    const response = await fetchData<PluginResponse>(`/v1/plugins/${pluginId}`, {
        cache: "no-store",
    });

    return normalizePlugin(response);
};

export default fetchPluginById;
