"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { createGame } from "@/lib/games/createGame";
import { showToast } from "@/lib/toastStore";

type FormValues = {
  name: string;
  gameKey: string;
  studioId: string;
};

type FormField = keyof FormValues;

const REQUIRED_FIELDS: FormField[] = ["name", "gameKey", "studioId"];

const DEFAULT_STUDIO_ID = "1";

const NewGameForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});

  const initialValues = useMemo<FormValues>(
    () => ({
      name: "",
      gameKey: "",
      studioId: DEFAULT_STUDIO_ID,
    }),
    []
  );

  const handleInputChange = (field: FormField) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (!errors[field]) {
      return;
    }

    const trimmedValue = event.target.value.trim();
    if (!trimmedValue.length) {
      return;
    }

    setErrors((previousErrors) => {
      const updated = { ...previousErrors };
      delete updated[field];
      return updated;
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
      gameKey: String(formData.get("gameKey") ?? "").trim(),
      studioId: String(formData.get("studioId") ?? "").trim(),
    };

    const validationErrors: Partial<Record<FormField, string>> = {};

    REQUIRED_FIELDS.forEach((field) => {
      if (!values[field].length) {
        validationErrors[field] = "This field is required.";
      }
    });

    const studioIdNumber = Number(values.studioId);
    if (!Number.isInteger(studioIdNumber) || studioIdNumber <= 0) {
      validationErrors.studioId = "Studio ID must be a positive number.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await createGame({
        name: values.name,
        gameKey: values.gameKey,
        studioId: studioIdNumber,
      });

      showToast({
        variant: "success",
        title: "Game created",
        message: `${values.name} has been created successfully.`,
        hideButtonLabel: "Dismiss",
      });

      router.push("/builder/games");
    } catch (error) {
      console.error("Failed to create game", error);
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
            placeholder="Enter game name"
            required
            onChange={handleInputChange("name")}
            error={Boolean(errors.name)}
            hint={errors.name}
          />
        </div>
        <div>
          <Label htmlFor="gameKey">
            Game key<span className="text-error-500">*</span>
          </Label>
          <Input
            id="gameKey"
            name="gameKey"
            placeholder="Enter game key"
            required
            onChange={handleInputChange("gameKey")}
            error={Boolean(errors.gameKey)}
            hint={errors.gameKey}
          />
        </div>
      </div>
      <div className="max-w-md">
        <Label htmlFor="studioId">
          Studio ID<span className="text-error-500">*</span>
        </Label>
        <Input
          id="studioId"
          name="studioId"
          defaultValue={initialValues.studioId}
          readOnly
          onChange={handleInputChange("studioId")}
          error={Boolean(errors.studioId)}
          hint={errors.studioId}
        />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          The studio is pre-selected for now and will be taken from authentication data in the future.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create game"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/builder/games")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default NewGameForm;
