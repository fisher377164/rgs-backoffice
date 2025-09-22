"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { GameConfiguration } from "@/lib/game-configurations/gameConfigurationType";
import { updateGameConfiguration } from "@/lib/game-configurations/updateGameConfiguration";
import { showToast } from "@/lib/toastStore";

type FormField = "name" | "configuration";

interface EditGameConfigurationFormProps {
  configuration: GameConfiguration;
}

const EditGameConfigurationForm = ({
  configuration,
}: EditGameConfigurationFormProps) => {
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
    const configurationValue = String(formData.get("configuration") ?? "").trim();

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
      await updateGameConfiguration(configuration.id, {
        name,
        configuration: configurationValue.length
          ? configurationValue
          : undefined,
      });

      showToast({
        variant: "success",
        title: "Game configuration updated",
        message: `${name} has been updated successfully.`,
        hideButtonLabel: "Dismiss",
      });

      router.push(`/builder/games/${configuration.gameId}`);
      router.refresh();
    } catch (error) {
      console.error(
        `Failed to update game configuration ${configuration.id}`,
        error
      );
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
          defaultValue={configuration.name}
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
          defaultValue={configuration.configuration ?? ""}
          placeholder="Add configuration"
          onChange={handleTextAreaChange("configuration")}
          error={Boolean(errors.configuration)}
          hint={errors.configuration}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/builder/games/${configuration.gameId}`)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EditGameConfigurationForm;
