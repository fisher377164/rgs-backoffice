"use client";

import { useState } from "react";

import Button from "@/components/ui/button/Button";
import { triggerGameBuild } from "@/lib/game-configurations/triggerGameBuild";
import { showToast } from "@/lib/toastStore";

interface TriggerGameBuildButtonProps {
  configurationId: number;
  configurationName: string;
}

const TriggerGameBuildButton = ({
  configurationId,
  configurationName,
}: TriggerGameBuildButtonProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await triggerGameBuild(configurationId);

      showToast({
        variant: "success",
        title: "Build triggered",
        message: `${configurationName} build has been triggered successfully.`,
        hideButtonLabel: "Dismiss",
      });
    } catch (error) {
      console.error(
        `Failed to trigger build for configuration ${configurationId}`,
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button type="button" onClick={handleClick} disabled={isSubmitting}>
      {isSubmitting ? "Triggering..." : "Validate & Build"}
    </Button>
  );
};

export default TriggerGameBuildButton;
