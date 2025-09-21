"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { updatePlugin } from "@/lib/plugins/updatePlugin";
import { Plugin } from "@/lib/plugins/pluginType";
import { showToast } from "@/lib/toastStore";

interface EditPluginFormProps {
    plugin: Plugin;
}

type FormValues = {
    name: string;
    pluginKey: string;
    groupId: string;
    artifactId: string;
    description: string;
};

type FormField = keyof FormValues;

type RequiredFormField = "name" | "pluginKey" | "groupId" | "artifactId";

const requiredFields: RequiredFormField[] = [
    "name",
    "pluginKey",
    "groupId",
    "artifactId",
];

const EditPluginForm = ({ plugin }: EditPluginFormProps) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});

    const handleInputChange = (field: RequiredFormField) => (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        if (!errors[field]) {
            return;
        }

        const trimmedValue = event.target.value.trim();

        if (!trimmedValue.length) {
            return;
        }

        setErrors((previousErrors) => {
            const updatedErrors = { ...previousErrors };
            delete updatedErrors[field];
            return updatedErrors;
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const form = event.currentTarget;
        const formData = new FormData(form);

        const values: FormValues = {
            name: String(formData.get("name") ?? "").trim(),
            pluginKey: String(formData.get("pluginKey") ?? "").trim(),
            groupId: String(formData.get("groupId") ?? "").trim(),
            artifactId: String(formData.get("artifactId") ?? "").trim(),
            description: String(formData.get("description") ?? "").trim(),
        };

        const validationErrors: Partial<Record<FormField, string>> = {};

        requiredFields.forEach((field) => {
            if (!values[field].length) {
                validationErrors[field] = "This field is required.";
            }
        });

        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            await updatePlugin(plugin.id, {
                name: values.name,
                pluginKey: values.pluginKey,
                groupId: values.groupId,
                artifactId: values.artifactId,
                description: values.description.length ? values.description : undefined,
            });

            showToast({
                variant: "success",
                title: "Plugin updated",
                message: `${values.name} has been updated successfully.`,
                hideButtonLabel: "Dismiss",
            });

            router.push(`/builder/plugins/${plugin.id}`);
        } catch (error) {
            console.error("Failed to update plugin", error);
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
                    <Input
                        id="name"
                        name="name"
                        placeholder="Enter plugin name"
                        defaultValue={plugin.name}
                        required
                        onChange={handleInputChange("name")}
                        error={Boolean(errors.name)}
                        hint={errors.name}
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
                        defaultValue={plugin.pluginKey}
                        required
                        onChange={handleInputChange("pluginKey")}
                        error={Boolean(errors.pluginKey)}
                        hint={errors.pluginKey}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                    <Label htmlFor="groupId">
                        Group ID<span className="text-error-500">*</span>
                    </Label>
                    <Input
                        id="groupId"
                        name="groupId"
                        placeholder="Enter group ID"
                        defaultValue={plugin.groupId}
                        required
                        onChange={handleInputChange("groupId")}
                        error={Boolean(errors.groupId)}
                        hint={errors.groupId}
                    />
                </div>
                <div>
                    <Label htmlFor="artifactId">
                        Artifact ID<span className="text-error-500">*</span>
                    </Label>
                    <Input
                        id="artifactId"
                        name="artifactId"
                        placeholder="Enter artifact ID"
                        defaultValue={plugin.artifactId}
                        required
                        onChange={handleInputChange("artifactId")}
                        error={Boolean(errors.artifactId)}
                        hint={errors.artifactId}
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <TextArea
                    id="description"
                    name="description"
                    placeholder="Add plugin description"
                    rows={3}
                    defaultValue={plugin.description}
                />
            </div>
            <div className="flex justify-end">
                <Button
                    type="submit"
                    className="min-w-32 justify-center"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Saving..." : "Save changes"}
                </Button>
            </div>
        </form>
    );
};

export default EditPluginForm;
