"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { createPlugin } from "@/lib/plugins/createPlugin";
import { showToast } from "@/lib/toastStore";

type FormValues = {
    name: string;
    pluginKey: string;
    groupId: string;
    artifactId: string;
    description: string;
    version: string;
    changeLog: string;
    configuration: string;
};

type FormField = keyof FormValues;

type RequiredFormField = "name" | "pluginKey" | "groupId" | "artifactId" | "version";

const requiredFields: RequiredFormField[] = [
    "name",
    "pluginKey",
    "groupId",
    "artifactId",
    "version",
];

const EditPluginForm = () => {
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
            version: String(formData.get("version") ?? "").trim(),
            changeLog: String(formData.get("changeLog") ?? "").trim(),
            configuration: String(formData.get("configuration") ?? "").trim(),
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
            await createPlugin({
                name: values.name,
                pluginKey: values.pluginKey,
                groupId: values.groupId,
                artifactId: values.artifactId,
                version: values.version,
                description: values.description.length ? values.description : undefined,
                changeLog: values.changeLog.length ? values.changeLog : undefined,
                configuration: values.configuration.length ? values.configuration : undefined,
            });

            showToast({
                variant: "success",
                title: "Plugin created",
                message: `${values.name} has been created successfully.`,
                hideButtonLabel: "Dismiss",
            });

            router.push("/builder/plugins");
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
                    <Input
                        id="name"
                        name="name"
                        placeholder="Enter plugin name"
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
                />
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
                    onChange={handleInputChange("version")}
                    error={Boolean(errors.version)}
                    hint={errors.version}
                />
            </div>
            <div>
                <Label htmlFor="changeLog">Change log</Label>
                <TextArea
                    id="changeLog"
                    name="changeLog"
                    placeholder="Describe the changes in this version"
                    rows={4}
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

export default EditPluginForm;
