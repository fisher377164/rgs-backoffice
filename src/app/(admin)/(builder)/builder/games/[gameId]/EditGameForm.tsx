"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Game } from "@/lib/games/gameType";
import { updateGame } from "@/lib/games/updateGame";
import { showToast } from "@/lib/toastStore";

type FormField = "name" | "gameKey";

interface EditGameFormProps {
  game: Game;
}

const EditGameForm = ({ game }: EditGameFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});

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

    const name = String(formData.get("name") ?? "").trim();
    const gameKey = String(formData.get("gameKey") ?? "").trim();

    const validationErrors: Partial<Record<FormField, string>> = {};

    if (!name.length) {
      validationErrors.name = "This field is required.";
    }

    if (!gameKey.length) {
      validationErrors.gameKey = "This field is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await updateGame(game.id, {
        name,
        gameKey,
      });

      showToast({
        variant: "success",
        title: "Game updated",
        message: `${name} has been updated successfully.`,
        hideButtonLabel: "Dismiss",
      });

      router.push(`/builder/games/${game.id}`);
      router.refresh();
    } catch (error) {
      console.error(`Failed to update game ${game.id}`, error);
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
            defaultValue={game.name}
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
            defaultValue={game.gameKey}
            placeholder="Enter game key"
            required
            onChange={handleInputChange("gameKey")}
            error={Boolean(errors.gameKey)}
            hint={errors.gameKey}
          />
        </div>
      </div>
      <div>
        <Label>Studio ID</Label>
        <Input readOnly value={game.studioId ?? "—"} />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/builder/games/${game.id}`)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EditGameForm;
