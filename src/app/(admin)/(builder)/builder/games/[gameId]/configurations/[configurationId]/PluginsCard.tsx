"use client";

import { ChangeEvent, FormEvent, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import ConfigurableTable, {
  TableConfig,
} from "@/components/tables/ConfigurableTable";
import Button from "@/components/ui/button/Button";
import { createGamePlugin } from "@/lib/game-plugins/createGamePlugin";
import { deleteGamePlugin } from "@/lib/game-plugins/deleteGamePlugin";
import { GamePlugin } from "@/lib/game-plugins/gamePluginType";
import { updateGamePlugin } from "@/lib/game-plugins/updateGamePlugin";
import { showToast } from "@/lib/toastStore";

interface PluginsCardProps {
  configurationId: number;
  plugins: GamePlugin[];
}

type CreateFormErrors = Partial<Record<"pluginId", string>>;

type EditFormState = {
  description: string;
  configuration: string;
};

const PluginsCard = ({ configurationId, plugins }: PluginsCardProps) => {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createErrors, setCreateErrors] = useState<CreateFormErrors>({});
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);

  const [editingPlugin, setEditingPlugin] = useState<GamePlugin | null>(null);
  const [editState, setEditState] = useState<EditFormState>({
    description: "",
    configuration: "",
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const handleToggleCreate = () => {
    setIsCreateOpen((previous) => {
      const next = !previous;
      if (next) {
        setEditingPlugin(null);
      }
      return next;
    });
    setCreateErrors({});
  };

  const handleCreatePluginIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (createErrors.pluginId && event.target.value.trim().length > 0) {
      setCreateErrors({});
    }
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isCreateSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const pluginIdRaw = String(formData.get("pluginId") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const configurationValue = String(formData.get("configuration") ?? "").trim();

    const pluginId = Number(pluginIdRaw);

    if (!pluginIdRaw.length || !Number.isInteger(pluginId) || pluginId <= 0) {
      setCreateErrors({ pluginId: "Enter a valid plugin identifier." });
      return;
    }

    setIsCreateSubmitting(true);

    try {
      await createGamePlugin({
        gameConfigurationId: configurationId,
        pluginId,
        description: description.length ? description : undefined,
        configuration: configurationValue.length ? configurationValue : undefined,
      });

      showToast({
        variant: "success",
        title: "Plugin added",
        message: `Plugin ${pluginId} has been linked successfully.`,
        hideButtonLabel: "Dismiss",
      });

      form.reset();
      setIsCreateOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to create game plugin", error);
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingPlugin || isEditSubmitting) {
      return;
    }

    setIsEditSubmitting(true);

    try {
      await updateGamePlugin(editingPlugin.id, {
        description: editState.description.trim().length
          ? editState.description.trim()
          : undefined,
        configuration: editState.configuration.trim().length
          ? editState.configuration.trim()
          : undefined,
      });

      showToast({
        variant: "success",
        title: "Plugin updated",
        message: `Plugin ${editingPlugin.pluginId} has been updated successfully.`,
        hideButtonLabel: "Dismiss",
      });

      setEditingPlugin(null);
      setEditState({ description: "", configuration: "" });
      router.refresh();
    } catch (error) {
      console.error(`Failed to update game plugin ${editingPlugin.id}`, error);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleCancelCreate = () => {
    setIsCreateOpen(false);
    setCreateErrors({});
  };

  const handleCancelEdit = () => {
    setEditingPlugin(null);
    setEditState({ description: "", configuration: "" });
  };

  const handleEditPlugin = useCallback((plugin: GamePlugin) => {
    setEditingPlugin(plugin);
    setEditState({
      description: plugin.description ?? "",
      configuration: plugin.configuration ?? "",
    });
    setIsCreateOpen(false);
  }, []);

  const handleDeletePlugin = useCallback(
    async (plugin: GamePlugin) => {
      const confirmed = window.confirm("If user sure to delete?");
      if (!confirmed) {
        return;
      }

      try {
        await deleteGamePlugin(plugin.id);

        showToast({
          variant: "success",
          title: "Plugin removed",
          message: `Plugin ${plugin.pluginId} has been removed successfully.`,
          hideButtonLabel: "Dismiss",
        });

        if (editingPlugin?.id === plugin.id) {
          setEditingPlugin(null);
          setEditState({ description: "", configuration: "" });
        }

        router.refresh();
      } catch (error) {
        console.error(`Failed to delete game plugin ${plugin.id}`, error);
      }
    },
    [editingPlugin, router]
  );

  const tableConfig = useMemo<TableConfig<GamePlugin>>(
    () => ({
      enablePagination: false,
      enableSearch: false,
      enableSorting: false,
      getRowKey: (row) => row.id,
      fields: [
        {
          key: "pluginId",
          label: "Plugin ID",
          dataKey: "pluginId",
        },
        {
          key: "description",
          label: "Description",
          render: (row) =>
            row.description && row.description.length > 0 ? (
              <span className="block whitespace-pre-wrap text-left">{row.description}</span>
            ) : (
              "—"
            ),
        },
        {
          key: "configuration",
          label: "Configuration",
          render: (row) =>
            row.configuration && row.configuration.length > 0 ? (
              <span className="block whitespace-pre-wrap text-left">{row.configuration}</span>
            ) : (
              "—"
            ),
        },
      ],
      actions: {
        align: "end",
        edit: {
          label: "Edit",
          onClick: handleEditPlugin,
        },
        remove: {
          label: "Delete",
          onClick: handleDeletePlugin,
          buttonProps: {
            className: "text-error-600",
          },
        },
      },
    }),
    [handleDeletePlugin, handleEditPlugin]
  );

  return (
    <ComponentCard
      title="Plugins"
      action={
        <Button type="button" size="sm" onClick={handleToggleCreate}>
          {isCreateOpen ? "Hide form" : "Add plugin"}
        </Button>
      }
    >
      <div className="space-y-6">
        {isCreateOpen && (
          <form key="create" className="space-y-4" onSubmit={handleCreateSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="new-plugin-id">
                  Plugin ID<span className="text-error-500">*</span>
                </Label>
                <Input
                  id="new-plugin-id"
                  name="pluginId"
                  type="number"
                  placeholder="Enter plugin ID"
                  required
                  onChange={handleCreatePluginIdChange}
                  error={Boolean(createErrors.pluginId)}
                  hint={createErrors.pluginId}
                />
              </div>
              <div>
                <Label htmlFor="new-plugin-description">Description</Label>
                <Input
                  id="new-plugin-description"
                  name="description"
                  placeholder="Add description"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="new-plugin-configuration">Configuration</Label>
              <TextArea
                id="new-plugin-configuration"
                name="configuration"
                rows={4}
                placeholder="Add configuration"
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

        {editingPlugin && (
          <form
            key={editingPlugin.id}
            className="space-y-4"
            onSubmit={handleEditSubmit}
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-plugin-id">Plugin ID</Label>
                <Input
                  id="edit-plugin-id"
                  name="pluginId"
                  defaultValue={editingPlugin.pluginId}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="edit-plugin-description">Description</Label>
                <Input
                  id="edit-plugin-description"
                  name="description"
                  defaultValue={editState.description}
                  onChange={(event) =>
                    setEditState((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-plugin-configuration">Configuration</Label>
              <TextArea
                id="edit-plugin-configuration"
                name="configuration"
                rows={4}
                defaultValue={editState.configuration}
                onChange={(value) =>
                  setEditState((previous) => ({
                    ...previous,
                    configuration: value,
                  }))
                }
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

        <ConfigurableTable data={plugins} config={tableConfig} />
      </div>
    </ComponentCard>
  );
};

export default PluginsCard;
