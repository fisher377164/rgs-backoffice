"use client";

import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import ConfigurableTable, {
  TableConfig,
} from "@/components/tables/ConfigurableTable";
import Button from "@/components/ui/button/Button";
import { createSymbol } from "@/lib/symbols/createSymbol";
import { deleteSymbol } from "@/lib/symbols/deleteSymbol";
import { GameSymbol, SYMBOL_TYPES, SymbolType } from "@/lib/symbols/symbolType";
import { updateSymbol } from "@/lib/symbols/updateSymbol";
import { showToast } from "@/lib/toastStore";

interface SymbolsCardProps {
  configurationId: number;
  symbols: GameSymbol[];
}

type FormField = "name" | "type";

type FormErrors = Partial<Record<FormField, string>>;

const formatError = (errors: FormErrors, field: FormField) =>
  Boolean(errors[field]);

const getErrorHint = (errors: FormErrors, field: FormField) => errors[field];

const clearErrorIfNeeded = (
  setErrors: Dispatch<SetStateAction<FormErrors>>,
  field: FormField,
  value: string
) => {
  const trimmedValue = value.trim();

  setErrors((previousErrors) => {
    if (!previousErrors[field] || !trimmedValue.length) {
      return previousErrors;
    }

    const updated: FormErrors = { ...previousErrors };
    delete updated[field];
    return updated;
  });
};

const SymbolsCard = ({ configurationId, symbols }: SymbolsCardProps) => {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);

  const [editingSymbol, setEditingSymbol] = useState<GameSymbol | null>(null);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const symbolTypeOptions = useMemo(() => SYMBOL_TYPES, []);

  const handleAddSymbolClick = () => {
    setIsCreateOpen((previous) => {
      const next = !previous;
      if (next) {
        setEditingSymbol(null);
      }
      return next;
    });
    setCreateErrors({});
  };

  const handleCreateInputChange = (field: FormField) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      clearErrorIfNeeded(setCreateErrors, field, event.target.value);
    };

  const handleCreateSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    clearErrorIfNeeded(setCreateErrors, "type", event.target.value);
  };

  const handleEditInputChange = (field: FormField) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      clearErrorIfNeeded(setEditErrors, field, event.target.value);
    };

  const handleEditSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    clearErrorIfNeeded(setEditErrors, "type", event.target.value);
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isCreateSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const typeValue = String(formData.get("type") ?? "").trim();

    const validationErrors: FormErrors = {};

    if (!name.length) {
      validationErrors.name = "This field is required.";
    }

    if (!typeValue.length) {
      validationErrors.type = "This field is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setCreateErrors(validationErrors);
      return;
    }

    setCreateErrors({});
    setIsCreateSubmitting(true);

    try {
      await createSymbol({
        gameConfigurationId: configurationId,
        name,
        description: description.length ? description : undefined,
        type: typeValue as SymbolType,
      });

      showToast({
        variant: "success",
        title: "Symbol created",
        message: `${name} has been created successfully.`,
        hideButtonLabel: "Dismiss",
      });

      form.reset();
      setIsCreateOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to create symbol", error);
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingSymbol || isEditSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const typeValue = String(formData.get("type") ?? "").trim();

    const validationErrors: FormErrors = {};

    if (!name.length) {
      validationErrors.name = "This field is required.";
    }

    if (!typeValue.length) {
      validationErrors.type = "This field is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      return;
    }

    setEditErrors({});
    setIsEditSubmitting(true);

    try {
      await updateSymbol(editingSymbol.id, {
        name,
        description: description.length ? description : undefined,
        type: typeValue as SymbolType,
      });

      showToast({
        variant: "success",
        title: "Symbol updated",
        message: `${name} has been updated successfully.`,
        hideButtonLabel: "Dismiss",
      });

      setEditingSymbol(null);
      router.refresh();
    } catch (error) {
      console.error(`Failed to update symbol ${editingSymbol.id}`, error);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleCancelCreate = () => {
    setIsCreateOpen(false);
    setCreateErrors({});
  };

  const handleEditSymbol = useCallback((symbol: GameSymbol) => {
    setEditingSymbol(symbol);
    setEditErrors({});
    setIsCreateOpen(false);
  }, []);

  const handleCancelEdit = () => {
    setEditingSymbol(null);
    setEditErrors({});
  };

  const handleDeleteSymbol = useCallback(
    async (symbol: GameSymbol) => {
      const confirmed = window.confirm("If user sure to delete?");
      if (!confirmed) {
        return;
      }

      try {
        await deleteSymbol(symbol.id);

        showToast({
          variant: "success",
          title: "Symbol deleted",
          message: `${symbol.name} has been removed successfully.`,
          hideButtonLabel: "Dismiss",
        });

        if (editingSymbol?.id === symbol.id) {
          setEditingSymbol(null);
        }

        router.refresh();
      } catch (error) {
        console.error(`Failed to delete symbol ${symbol.id}`, error);
      }
    },
    [editingSymbol, router]
  );

  const tableConfig = useMemo<TableConfig<GameSymbol>>(
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
          key: "name",
          label: "Name",
          dataKey: "name",
        },
        {
          key: "description",
          label: "Description",
          render: (row) =>
            row.description && row.description.length > 0 ? row.description : "—",
        },
        {
          key: "type",
          label: "Type",
          dataKey: "type",
        },
      ],
      actions: {
        align: "end",
        edit: {
          label: "Edit",
          onClick: handleEditSymbol,
        },
        remove: {
          label: "Delete",
          onClick: handleDeleteSymbol,
          buttonProps: {
            className: "text-error-600",
          },
        },
      },
    }),
    [handleDeleteSymbol, handleEditSymbol]
  );

  return (
    <ComponentCard
      title="Symbols"
      action={
        <Button type="button" size="sm" onClick={handleAddSymbolClick}>
          {isCreateOpen ? "Hide form" : "Add Symbol"}
        </Button>
      }
    >
      <div className="space-y-6">
        {isCreateOpen && (
          <form key="create" className="space-y-4" onSubmit={handleCreateSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="new-symbol-name">
                  Name<span className="text-error-500">*</span>
                </Label>
                <Input
                  id="new-symbol-name"
                  name="name"
                  placeholder="Enter symbol name"
                  required
                  onChange={handleCreateInputChange("name")}
                  error={formatError(createErrors, "name")}
                  hint={getErrorHint(createErrors, "name")}
                />
              </div>
              <div>
                <Label htmlFor="new-symbol-type">
                  Type<span className="text-error-500">*</span>
                </Label>
                <select
                  id="new-symbol-type"
                  name="type"
                  defaultValue=""
                  onChange={handleCreateSelectChange}
                  className={`h-11 w-full appearance-none rounded-lg border bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:focus:border-brand-800 ${
                    formatError(createErrors, "type")
                      ? "border-error-500 text-error-800 focus:border-error-500 focus:ring-error-500/10 dark:border-error-500 dark:text-error-400"
                      : "border-gray-300 text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                  }`}
                  required
                >
                  <option value="" disabled>
                    Select symbol type
                  </option>
                  {symbolTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {getErrorHint(createErrors, "type") && (
                  <p className="mt-1.5 text-xs text-error-500">
                    {getErrorHint(createErrors, "type")}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="new-symbol-description">Description</Label>
              <TextArea
                id="new-symbol-description"
                name="description"
                rows={4}
                placeholder="Add description"
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

        {editingSymbol && (
          <form
            key={editingSymbol.id}
            className="space-y-4"
            onSubmit={handleEditSubmit}
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-symbol-name">
                  Name<span className="text-error-500">*</span>
                </Label>
                <Input
                  id="edit-symbol-name"
                  name="name"
                  defaultValue={editingSymbol.name}
                  placeholder="Enter symbol name"
                  required
                  onChange={handleEditInputChange("name")}
                  error={formatError(editErrors, "name")}
                  hint={getErrorHint(editErrors, "name")}
                />
              </div>
              <div>
                <Label htmlFor="edit-symbol-type">
                  Type<span className="text-error-500">*</span>
                </Label>
                <select
                  id="edit-symbol-type"
                  name="type"
                  defaultValue={editingSymbol.type}
                  onChange={handleEditSelectChange}
                  className={`h-11 w-full appearance-none rounded-lg border bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:focus:border-brand-800 ${
                    formatError(editErrors, "type")
                      ? "border-error-500 text-error-800 focus:border-error-500 focus:ring-error-500/10 dark:border-error-500 dark:text-error-400"
                      : "border-gray-300 text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                  }`}
                  required
                >
                  <option value="" disabled>
                    Select symbol type
                  </option>
                  {symbolTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {getErrorHint(editErrors, "type") && (
                  <p className="mt-1.5 text-xs text-error-500">
                    {getErrorHint(editErrors, "type")}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-symbol-description">Description</Label>
              <TextArea
                id="edit-symbol-description"
                name="description"
                rows={4}
                defaultValue={editingSymbol.description ?? ""}
                placeholder="Add description"
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

        <ConfigurableTable data={symbols} config={tableConfig} />
      </div>
    </ComponentCard>
  );
};

export default SymbolsCard;
