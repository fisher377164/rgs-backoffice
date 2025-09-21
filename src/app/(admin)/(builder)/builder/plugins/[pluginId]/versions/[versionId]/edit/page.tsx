import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { ApiError } from "@/lib/apiClient";
import fetchPluginById from "@/lib/plugins/fetchPluginById";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import EditPluginVersionForm from "./EditPluginVersionForm";

export const metadata: Metadata = {
    title: "FiG | Edit plugin version",
    description: "Edit plugin version page",
};

interface PluginVersionPageProps {
    params: Promise<{
        pluginId: string;
        versionId: string;
    }>;
}

export default async function EditPluginVersionPage({ params }: PluginVersionPageProps) {
    const { pluginId, versionId } = await params;

    try {
        const plugin = await fetchPluginById(pluginId);
        const pluginVersion = plugin.versions.find(
            (version) => String(version.id) === versionId,
        );

        if (!pluginVersion) {
            notFound();
        }

        return (
            <div>
                <PageBreadcrumb
                    pageTitle={`Edit version ${pluginVersion.version}`}
                    breadcrumbs={[
                        { label: "Builder" },
                        { label: "Plugins", href: "/builder/plugins" },
                        { label: plugin.name, href: `/builder/plugins/${plugin.id}` },
                        { label: `Edit version ${pluginVersion.version}` },
                    ]}
                />
                <div className="space-y-6">
                    <ComponentCard title={`Edit version ${pluginVersion.version}`}>
                        <EditPluginVersionForm
                            pluginId={String(plugin.id)}
                            pluginVersion={pluginVersion}
                        />
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
