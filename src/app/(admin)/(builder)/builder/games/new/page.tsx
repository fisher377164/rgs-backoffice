import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import NewGameForm from "./NewGameForm";

export const metadata: Metadata = {
    title: "FiG | Builder | New game",
    description: "Build new game",
};

export default async function NewPluginPage() {

    return (
        <div>
            <PageBreadcrumb
                pageTitle="New game"
                breadcrumbs={[
                    { label: "Builder" },
                    { label: "All Builded Games", href: "/builder/games" },
                    { label: "New game" },
                ]}
            />
            <div className="space-y-6">
                <ComponentCard title="New game">
                    <NewGameForm />
                </ComponentCard>
            </div>
        </div>
    );
}
