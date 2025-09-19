import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export const metadata: Metadata = {
    title: "FiG | New plugin",
    description: "New Plugin page",
};

export default async function NewPluginPage() {

    return (
        <div>
            <PageBreadcrumb pageTitle="New plugin" />
            <div className="space-y-6">
                <ComponentCard title="Plugins">
                    <div>Content</div>
                </ComponentCard>
            </div>
        </div>
    );
}
