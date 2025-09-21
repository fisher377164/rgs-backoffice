"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { createPluginVersion } from "@/lib/plugins/createPluginVersion";
import { showToast } from "@/lib/toastStore";

interface NewPluginVersionFormProps {
        pluginId: string;
}

type FormValues = {
    version: string;
    changeLog: string;
    configuration: string;
};

type FormField = keyof FormValues;
type RequiredFormField = "version" | "configuration";

const requiredFields: RequiredFormField[] = ["version", "configuration"];

const EditPluginVersionForm = ({pluginId}: NewPluginVersionFormProps) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});

    const handleRequiredInputChange = (field: RequiredFormField) => (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        if (!errors[field]) {
            return;
        }

        if (!event.target.value.trim().length) {
            return;
        }

        setErrors((previousErrors) => {
            const nextErrors = { ...previousErrors };
            delete nextErrors[field];
            return nextErrors;
        });
    };

    const handleConfigurationChange = (value: string) => {
        if (!errors.configuration || !value.trim().length) {
            return;
        }

        setErrors((previousErrors) => {
            const nextErrors = { ...previousErrors };
            delete nextErrors.configuration;
            return nextErrors;
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
            await createPluginVersion(pluginId, {
                version: values.version,
                configuration: values.configuration,
                changeLog: values.changeLog.length ? values.changeLog : undefined,
            });

            showToast({
                variant: "success",
                title: "Plugin version created",
                message: `Version ${values.version} has been created successfully.`,
                hideButtonLabel: "Dismiss",
            });

            router.push(`/builder/plugins/${pluginId}`);
        } catch (error) {
            console.error("Failed to create plugin version", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
                <Label htmlFor="version">
                    Version<span className="text-error-500">*</span>
                </Label>
                <Input
                    id="version"
                    name="version"
                    placeholder="Enter plugin version"
                    required
                    onChange={handleRequiredInputChange("version")}
                    error={Boolean(errors.version)}
                    hint={errors.version}
                />
            </div>
            <div>
                <Label htmlFor="changeLog">Change log</Label>
                <TextArea
                    id="changeLog"
                    name="changeLog"
                    placeholder="Add change log notes"
                    rows={4}
                />
            </div>
            <div>
                <Label htmlFor="configuration">
                    Configuration<span className="text-error-500">*</span>
                </Label>
                <TextArea
                    id="configuration"
                    name="configuration"
                    placeholder="Add plugin configuration"
                    rows={6}
                    onChange={handleConfigurationChange}
                    error={Boolean(errors.configuration)}
                    hint={errors.configuration}
                />
            </div>
            <div className="flex justify-end">
                <Button
                    type="submit"
                    className="min-w-32 justify-center"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creating..." : "Create version"}
                </Button>
            </div>
        </form>
    );
};

export default EditPluginVersionForm;
