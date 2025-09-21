"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { createPlugin } from "@/lib/plugins/createPlugin";
import { showToast } from "@/lib/toastStore";

interface NewPluginVersionFormProps {
        pluginId: string;
}

const NewPluginVersionForm = ({pluginId}: NewPluginVersionFormProps) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const form = event.currentTarget;
        const formData = new FormData(form);

        const name = String(formData.get("name") ?? "").trim();
        const pluginKey = String(formData.get("pluginKey") ?? "").trim();
        const version = String(formData.get("version") ?? "").trim();
        const configurationValue = formData.get("configuration");
        const configuration =
            configurationValue !== null ? String(configurationValue).trim() : undefined;

        setIsSubmitting(true);

        try {
            await createPlugin({
                name,
                pluginKey,
                version,
                configuration: configuration?.length ? configuration : undefined,
            });

            showToast({
                variant: "success",
                title: "Plugin created",
                message: `${name} has been created successfully.`,
                hideButtonLabel: "Dismiss",
            });

            router.push(`/builder/plugins/${pluginId}/versions`);
        } catch (error) {
            // Errors are handled by the API client, so we just log for debugging purposes.
            console.error("Failed to create plugin", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                    <Label htmlFor="name">
                        Name<span className="text-error-500">*</span>
                    </Label>
                    <Input id="name" name="name" placeholder="Enter plugin name" required />
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
                <Button
                    type="submit"
                    className="min-w-32 justify-center"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creating..." : "Create plugin"}
                </Button>
            </div>
        </form>
    );
};

export default NewPluginVersionForm;
