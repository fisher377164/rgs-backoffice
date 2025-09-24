"use client";

import { ChangeEvent, FormEvent, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import ConfigurableTable, {
  TableConfig,
} from "@/components/tables/ConfigurableTable";
import Button from "@/components/ui/button/Button";
import { createReelSet } from "@/lib/reel-sets/createReelSet";
import { deleteReelSet } from "@/lib/reel-sets/deleteReelSet";
import { ReelSet } from "@/lib/reel-sets/reelSetType";
import { updateReelSet } from "@/lib/reel-sets/updateReelSet";
import { showToast } from "@/lib/toastStore";

interface ReelSetsCardProps {
  configurationId: number;
  reelSets: ReelSet[];
}

type FormErrors = Partial<Record<"reelSetKey", string>>;

const ReelSetsCard = ({ configurationId, reelSets }: ReelSetsCardProps) => {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);

  const [editingReelSet, setEditingReelSet] = useState<ReelSet | null>(null);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const handleToggleCreate = () => {
    setIsCreateOpen((previous) => {
      const next = !previous;
      if (next) {
        setEditingReelSet(null);
      }
      return next;
    });
    setCreateErrors({});
  };

  const handleCreateInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (createErrors.reelSetKey && event.target.value.trim().length > 0) {
      setCreateErrors({});
    }
  };

  const handleEditInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (editErrors.reelSetKey && event.target.value.trim().length > 0) {
      setEditErrors({});
    }
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isCreateSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const reelSetKey = String(formData.get("reelSetKey") ?? "").trim();

    if (!reelSetKey.length) {
      setCreateErrors({ reelSetKey: "This field is required." });
      return;
    }

    setIsCreateSubmitting(true);

    try {
      await createReelSet({
        gameConfigurationId: configurationId,
        reelSetKey,
      });

      showToast({
        variant: "success",
        title: "Reel set created",
        message: `${reelSetKey} has been created successfully.`,
        hideButtonLabel: "Dismiss",
      });

      form.reset();
      setIsCreateOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to create reel set", error);
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingReelSet || isEditSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const reelSetKey = String(formData.get("reelSetKey") ?? "").trim();

    if (!reelSetKey.length) {
      setEditErrors({ reelSetKey: "This field is required." });
      return;
    }

    setIsEditSubmitting(true);

    try {
      await updateReelSet(editingReelSet.id, {
        gameConfigurationId: configurationId,
        reelSetKey,
      });

      showToast({
        variant: "success",
        title: "Reel set updated",
        message: `${reelSetKey} has been updated successfully.`,
        hideButtonLabel: "Dismiss",
      });

      setEditingReelSet(null);
      router.refresh();
    } catch (error) {
      console.error(`Failed to update reel set ${editingReelSet.id}`, error);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleCancelCreate = () => {
    setIsCreateOpen(false);
    setCreateErrors({});
  };

  const handleCancelEdit = () => {
    setEditingReelSet(null);
    setEditErrors({});
  };

  const handleEditReelSet = useCallback((reelSet: ReelSet) => {
    setEditingReelSet(reelSet);
    setEditErrors({});
    setIsCreateOpen(false);
  }, []);

  const handleDeleteReelSet = useCallback(
    async (reelSet: ReelSet) => {
      const confirmed = window.confirm("If user sure to delete?");
      if (!confirmed) {
        return;
      }

      try {
        await deleteReelSet(reelSet.id);

        showToast({
          variant: "success",
          title: "Reel set deleted",
          message: `${reelSet.reelSetKey} has been removed successfully.`,
          hideButtonLabel: "Dismiss",
        });

        if (editingReelSet?.id === reelSet.id) {
          setEditingReelSet(null);
        }

        router.refresh();
      } catch (error) {
        console.error(`Failed to delete reel set ${reelSet.id}`, error);
      }
    },
    [editingReelSet, router]
  );

  const tableConfig = useMemo<TableConfig<ReelSet>>(
    () => ({
      enablePagination: false,
      enableSearch: false,
      enableSorting: false,
      getRowKey: (row) => row.id,
      fields: [
        {
          key: "id",
          label: "ID",
          dataKey: "id",
        },
        {
          key: "reelSetKey",
          label: "Reel set key",
          dataKey: "reelSetKey",
        },
      ],
      actions: {
        align: "end",
        edit: {
          label: "Edit",
          onClick: handleEditReelSet,
        },
        remove: {
          label: "Delete",
          onClick: handleDeleteReelSet,
          buttonProps: {
            className: "text-error-600",
          },
        },
      },
    }),
    [handleDeleteReelSet, handleEditReelSet]
  );

  return (
    <ComponentCard
      title="Reel sets"
      action={
        <Button type="button" size="sm" onClick={handleToggleCreate}>
          {isCreateOpen ? "Hide form" : "Add reel set"}
        </Button>
      }
    >
      <div className="space-y-6">
        {isCreateOpen && (
          <form key="create" className="space-y-4" onSubmit={handleCreateSubmit} noValidate>
            <div>
              <Label htmlFor="new-reel-set-key">
                Reel set key<span className="text-error-500">*</span>
              </Label>
              <Input
                id="new-reel-set-key"
                name="reelSetKey"
                placeholder="Enter reel set key"
                required
                onChange={handleCreateInputChange}
                error={Boolean(createErrors.reelSetKey)}
                hint={createErrors.reelSetKey}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isCreateSubmitting}>
                {isCreateSubmitting ? "Submitting..." : "Submit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelCreate}
                disabled={isCreateSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {editingReelSet && (
          <form
            key={editingReelSet.id}
            className="space-y-4"
            onSubmit={handleEditSubmit}
            noValidate
          >
            <div>
              <Label htmlFor="edit-reel-set-key">
                Reel set key<span className="text-error-500">*</span>
              </Label>
              <Input
                id="edit-reel-set-key"
                name="reelSetKey"
                defaultValue={editingReelSet.reelSetKey}
                placeholder="Enter reel set key"
                required
                onChange={handleEditInputChange}
                error={Boolean(editErrors.reelSetKey)}
                hint={editErrors.reelSetKey}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isEditSubmitting}>
                {isEditSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isEditSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <ConfigurableTable data={reelSets} config={tableConfig} />
      </div>
    </ComponentCard>
  );
};

export default ReelSetsCard;
