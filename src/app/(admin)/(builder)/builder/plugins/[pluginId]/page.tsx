import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import PluginVersionsTable from "@/components/tables/PluginVersionsTable";
import { ApiError } from "@/lib/apiClient";
import fetchPluginById from "@/lib/plugins/fetchPluginById";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "FiG | Plugin details",
    description: "Plugin details page",
};

interface PluginPageProps {
    params: {
        pluginId: string;
    };
}

export default async function PluginPage({params}: PluginPageProps) {
    const { pluginId } = params;

    try {
        const plugin = await fetchPluginById(pluginId);

        return (
            <div>
                <PageBreadcrumb
                    pageTitle={`Plugin: ${plugin.name}`}
                    breadcrumbs={[
                        { label: "Builder" },
                        { label: "Plugins", href: "/builder/plugins" },
                        { label: plugin.name },
                    ]}
                />
                <div className="space-y-6">
                    <ComponentCard title="Plugin details">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plugin ID</p>
                                <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">{plugin.id}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plugin key</p>
                                <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">{plugin.pluginKey}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Group ID</p>
                                <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">{plugin.groupId || "—"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Artifact ID</p>
                                <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">{plugin.artifactId || "—"}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                {plugin.description ? plugin.description : "No description provided."}
                            </p>
                        </div>
                    </ComponentCard>
                    <ComponentCard title="Versions">
                        <PluginVersionsTable versions={plugin.versions} pluginId={plugin.id} />
                    </ComponentCard>
                </div>
            </div>
        );
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            notFound();
        }

        throw error;
    }
}
