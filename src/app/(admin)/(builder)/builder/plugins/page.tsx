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

export default async function PluginsPage() {
    const games = await fetchPlugins();

    return (
        <div>
            <PageBreadcrumb pageTitle="All plugins" />
            <div className="space-y-6">
                <ComponentCard
                    title="Plugins"
                    action={
                        <Link
                            href="/builder/plugins/new"
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600"
                        >
                            New Plugin
                        </Link>
                    }
                >
                    <PluginsTable data={games} />
                </ComponentCard>
            </div>
        </div>
    );
}
