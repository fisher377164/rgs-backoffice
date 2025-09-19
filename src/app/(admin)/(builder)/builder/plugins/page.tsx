import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import ComponentCard from "@/components/common/ComponentCard";
import PluginsTable from "@/components/tables/PluginsTable";
import fetchPlugins from "@/lib/plugins/fetchPlugins";

export const metadata: Metadata = {
    title: "FiG | All plugins",
    description: "All PlugIns page",
};

export default async function PluginsPage() {
    // TODO: FIX IT
    const games = await fetchPlugins();

    return (
        <div>
            <PageBreadcrumb pageTitle="All plugins" />
            <div className="space-y-6">
                <ComponentCard title="Plugins">
                    <PluginsTable data={games} />
                </ComponentCard>
            </div>
        </div>
    );
}
