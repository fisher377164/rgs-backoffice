"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { createGameConfiguration } from "@/lib/game-configurations/createGameConfiguration";
import { showToast } from "@/lib/toastStore";

type FormField = "name" | "configuration";

interface NewGameConfigurationFormProps {
  gameId: number;
}

const NewGameConfigurationForm = ({ gameId }: NewGameConfigurationFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});

  const clearErrorIfNeeded = (field: FormField, value: string) => {
    if (!errors[field]) {
      return;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue.length) {
      return;
    }

    setErrors((previousErrors) => {
      const updated = { ...previousErrors };
      delete updated[field];
      return updated;
    });
  };

  const handleInputChange = (field: FormField) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    clearErrorIfNeeded(field, event.target.value);
  };

  const handleTextAreaChange = (field: FormField) => (value: string) => {
    clearErrorIfNeeded(field, value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "").trim();
    const configuration = String(formData.get("configuration") ?? "").trim();

    const validationErrors: Partial<Record<FormField, string>> = {};

    if (!name.length) {
      validationErrors.name = "This field is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await createGameConfiguration({
        gameId,
        name,
        configuration: configuration.length ? configuration : undefined,
      });

      showToast({
        variant: "success",
        title: "Game configuration created",
        message: `${name} has been created successfully.`,
        hideButtonLabel: "Dismiss",
      });

      router.push(`/builder/games/${gameId}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to create game configuration", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="max-w-md">
        <Label htmlFor="name">
          Name<span className="text-error-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter configuration name"
          required
          onChange={handleInputChange("name")}
          error={Boolean(errors.name)}
          hint={errors.name}
        />
      </div>
      <div>
        <Label htmlFor="configuration">Configuration</Label>
        <TextArea
          id="configuration"
          name="configuration"
          rows={6}
          placeholder="Add configuration"
          onChange={handleTextAreaChange("configuration")}
          error={Boolean(errors.configuration)}
          hint={errors.configuration}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create configuration"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/builder/games/${gameId}`)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default NewGameConfigurationForm;
