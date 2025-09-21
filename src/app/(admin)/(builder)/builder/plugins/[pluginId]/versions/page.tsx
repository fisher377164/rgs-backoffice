import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import ComponentCard from "@/components/common/ComponentCard";
import PluginsTable from "@/components/tables/PluginsTable";
import fetchPlugins from "@/lib/plugins/fetchPlugins";
import Link from "next/link";

export const metadata: Metadata = {
    title: "FiG | All plugins",
    description: "All PlugIns page",
};

interface PluginPageProps {
    params: {
        pluginId: string;
    };
}

export default async function PluginsPage({params}: PluginPageProps) {

    // const pluginId = params.pluginId;


    const plugins = await fetchPlugins();

    return (
        <div>
            <PageBreadcrumb
                pageTitle="Plugins"
                breadcrumbs={[
                    { label: "Builder" },
                    { label: "Plugins" },
                    { label: "Plugins" },
                ]}
            />
            <div className="space-y-6">
                <ComponentCard
                    title="Plugins"
                    action={
                        <Link
                            href="/builder/plugins/new"
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600"
                        >
                            New Plugin version
                        </Link>
                    }
                >
                    <PluginsTable data={plugins} />
                </ComponentCard>
            </div>
        </div>
    );
}
