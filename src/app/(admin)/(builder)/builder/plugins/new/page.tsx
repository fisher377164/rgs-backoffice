import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import NewPluginForm from "./NewPluginForm";

export const metadata: Metadata = {
    title: "FiG | New plugin",
    description: "New Plugin page",
};

export default async function NewPluginPage() {
    return (
        <div>
            <PageBreadcrumb
                pageTitle="New plugin"
                breadcrumbs={[
                    { label: "Builder" },
                    { label: "Plugins", href: "/builder/plugins" },
                    { label: "New plugin" },
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
