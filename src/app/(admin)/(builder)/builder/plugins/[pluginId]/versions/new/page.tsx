import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import NewPluginForm from "./NewPluginForm";

export const metadata: Metadata = {
    title: "FiG | New plugin version",
    description: "New Plugin version page",
};


interface PluginVersionPageProps {
    params: {
        pluginId: string;
    };
}

export default async function NewPluginVersionPage({params}: PluginVersionPageProps) {
    const pluginId = params.pluginId;

    return (
        <div>
            <PageBreadcrumb
                pageTitle="New plugin version"
                breadcrumbs={[
                    { label: "Builder" },
                    { label: "Plugins", href: "/builder/plugins" },
                    { label: `Plugin ${pluginId}`, href: `/builder/plugins/${pluginId}` },
                ]}
            />
            <div className="space-y-6">
                <ComponentCard title="Plugins">
                    <NewPluginForm />
                </ComponentCard>
            </div>
        </div>
    );
}
