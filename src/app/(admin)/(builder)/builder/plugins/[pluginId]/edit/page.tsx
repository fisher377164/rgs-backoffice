import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { ApiError } from "@/lib/apiClient";
import fetchPluginById from "@/lib/plugins/fetchPluginById";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import EditPluginForm from "./EditPluginForm";

export const metadata: Metadata = {
    title: "FiG | Edit plugin",
    description: "Edit plugin page",
};

interface EditPluginPageProps {
    params: Promise<{
        pluginId: string;
    }>;
}

export default async function EditPluginPage({ params }: EditPluginPageProps) {
    const { pluginId } = await params;

    try {
        const plugin = await fetchPluginById(pluginId);

        return (
            <div>
                <PageBreadcrumb
                    pageTitle={`Edit plugin: ${plugin.name}`}
                    breadcrumbs={[
                        { label: "Builder" },
                        { label: "Plugins", href: "/builder/plugins" },
                        { label: plugin.name, href: `/builder/plugins/${plugin.id}` },
                        { label: "Edit plugin" },
                    ]}
                />
                <div className="space-y-6">
                    <ComponentCard title="Edit plugin">
                        <EditPluginForm plugin={plugin} />
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
