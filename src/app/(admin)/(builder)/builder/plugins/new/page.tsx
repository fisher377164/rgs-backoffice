import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";

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
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <Label htmlFor="name">
                                    Name<span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Enter plugin name"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="pluginKey">
                                    Plugin key<span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    id="pluginKey"
                                    name="pluginKey"
                                    placeholder="Enter plugin key"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="version">
                                Version<span className="text-error-500">*</span>
                            </Label>
                            <Input
                                id="version"
                                name="version"
                                placeholder="Enter plugin version"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="configuration">Configuration</Label>
                            <TextArea
                                id="configuration"
                                name="configuration"
                                placeholder="Add plugin configuration"
                                rows={4}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" className="min-w-32 justify-center">
                                Create plugin
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    );
}
