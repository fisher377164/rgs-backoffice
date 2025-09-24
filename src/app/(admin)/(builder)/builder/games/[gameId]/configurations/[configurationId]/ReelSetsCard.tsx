
"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { createReel } from "@/lib/reels/createReel";
import { deleteReel } from "@/lib/reels/deleteReel";
import { fetchReels } from "@/lib/reels/fetchReels";
import { Reel } from "@/lib/reels/reelType";
import { updateReel } from "@/lib/reels/updateReel";
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

interface ReelListState {
  content: Reel[];
  totalElements: number;
  page: number;
  size: number;
  isLoading: boolean;
  hasLoaded: boolean;
  error?: string;
}

interface ReelFormState {
  mode: "create" | "edit";
  reelSet: ReelSet;
  reel?: Reel;
}

interface ReelFormSuccessOptions {
  refreshToFirstPage?: boolean;
}

const DEFAULT_REELS_PAGE_SIZE = 10;

const formatSymbolPreview = (symbolIds: number[]) => {
  if (!symbolIds.length) {
    return "—";
  }

  const preview = symbolIds.slice(0, 20).join(", ");
  return symbolIds.length > 20 ? `${preview}…` : preview;
};

const computeTotalPages = (state?: ReelListState) => {
  if (!state || state.size <= 0) {
    return 1;
  }

  const totalPages = Math.ceil(state.totalElements / state.size);
  return totalPages > 0 ? totalPages : 1;
};

interface ReelFormProps {
  state: ReelFormState;
  onCancel: () => void;
  onSuccess: (options?: ReelFormSuccessOptions) => Promise<void> | void;
}

const ReelForm = ({ state, onCancel, onSuccess }: ReelFormProps) => {
  const { mode, reelSet, reel } = state;
  const [value, setValue] = useState(() => reel?.symbolIds.join(", ") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleValueChange = (nextValue: string) => {
    if (error) {
      setError(null);
    }

    setValue(nextValue);
  };

  const parseSymbolIds = (input: string): number[] | null => {
    const tokens = input
      .split(/[\s,]+/)
      .map((token) => token.trim())
      .filter(Boolean);

    if (!tokens.length) {
      return [];
    }

    const parsed: number[] = [];
    for (const token of tokens) {
      const numericValue = Number(token);

      if (!Number.isFinite(numericValue) || !Number.isInteger(numericValue)) {
        return null;
      }

      parsed.push(numericValue);
    }

    return parsed;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const parsedSymbolIds = parseSymbolIds(value);

    if (!parsedSymbolIds || parsedSymbolIds.length === 0) {
      setError("Enter at least one valid symbol ID.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await createReel({
          reelSetId: reelSet.id,
          symbolIds: parsedSymbolIds,
        });

        showToast({
          variant: "success",
          title: "Reel created",
          message: `A reel has been added to ${reelSet.reelSetKey}.`,
          hideButtonLabel: "Dismiss",
        });

        await onSuccess({ refreshToFirstPage: true });
      } else if (reel) {
        await updateReel(reel.id, { symbolIds: parsedSymbolIds });

        showToast({
          variant: "success",
          title: "Reel updated",
          message: `Reel ${reel.id} has been updated successfully.`,
          hideButtonLabel: "Dismiss",
        });

        await onSuccess();
      }
    } catch (error) {
      console.error("Failed to submit reel form", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLabel = mode === "create" ? "Add reel" : "Save";

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div>
        <Label htmlFor={`reel-symbol-ids-${reelSet.id}`}>
          Symbol IDs<span className="text-error-500">*</span>
        </Label>
        <TextArea
          id={`reel-symbol-ids-${reelSet.id}`}
          name="symbolIds"
          rows={4}
          value={value}
          onChange={handleValueChange}
          placeholder="Enter comma or space separated symbol IDs"
          error={Boolean(error)}
          hint={error ?? "Separate IDs with commas or spaces."}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

const ReelSetsCard = ({ configurationId, reelSets }: ReelSetsCardProps) => {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);

  const [editingReelSet, setEditingReelSet] = useState<ReelSet | null>(null);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const [expandedReelSets, setExpandedReelSets] = useState<Set<number>>(
    () => new Set()
  );
  const [reelStates, setReelStates] = useState<Record<number, ReelListState>>({});
  const [activeReelForm, setActiveReelForm] = useState<ReelFormState | null>(null);

  useEffect(() => {
    setExpandedReelSets((previous) => {
      const next = new Set<number>();
      const validIds = new Set(reelSets.map((set) => set.id));

      previous.forEach((id) => {
        if (validIds.has(id)) {
          next.add(id);
        }
      });

      return next;
    });

    setReelStates((previous) => {
      const next: Record<number, ReelListState> = {};
      const validIds = new Set(reelSets.map((set) => set.id));

      for (const id of validIds) {
        if (previous[id]) {
          next[id] = previous[id];
        }
      }

      return next;
    });

    setActiveReelForm((previous) => {
      if (!previous) {
        return previous;
      }

      const exists = reelSets.some(
        (reelSet) => reelSet.id === previous.reelSet.id
      );

      return exists ? previous : null;
    });
  }, [reelSets]);

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

  const loadReels = useCallback(
    async (reelSetId: number, page?: number) => {
      const existingState = reelStates[reelSetId];
      const targetPage = page ?? existingState?.page ?? 0;
      const pageSize = existingState?.size ?? DEFAULT_REELS_PAGE_SIZE;

      if (existingState?.isLoading && existingState.page === targetPage) {
        return;
      }

      setReelStates((previous) => ({
        ...previous,
        [reelSetId]: {
          content: existingState?.content ?? [],
          totalElements: existingState?.totalElements ?? 0,
          page: targetPage,
          size: pageSize,
          isLoading: true,
          hasLoaded: existingState?.hasLoaded ?? false,
          error: undefined,
        },
      }));

      try {
        const response = await fetchReels({
          reelSetId,
          page: targetPage,
          size: pageSize,
        });

        setReelStates((previous) => ({
          ...previous,
          [reelSetId]: {
            content: response.content ?? [],
            totalElements: response.totalElements,
            page: response.page,
            size: response.size,
            isLoading: false,
            hasLoaded: true,
            error: undefined,
          },
        }));
      } catch (error) {
        console.error(`Failed to load reels for reel set ${reelSetId}`, error);

        showToast({
          variant: "error",
          title: "Failed to load reels",
          message: "Unable to load reels. Please try again.",
          hideButtonLabel: "Dismiss",
        });

        setReelStates((previous) => ({
          ...previous,
          [reelSetId]: {
            content: existingState?.content ?? [],
            totalElements: existingState?.totalElements ?? 0,
            page: targetPage,
            size: pageSize,
            isLoading: false,
            hasLoaded: existingState?.hasLoaded ?? false,
            error: "Unable to load reels. Please try again.",
          },
        }));
      }
    },
    [reelStates]
  );

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

  const handleEditReelSet = useCallback(
    (reelSet: ReelSet) => {
      setEditingReelSet(reelSet);
      setEditErrors({});
      setIsCreateOpen(false);

      setExpandedReelSets((previous) => {
        if (previous.has(reelSet.id)) {
          return previous;
        }

        const next = new Set(previous);
        next.add(reelSet.id);
        return next;
      });

      void loadReels(reelSet.id);
    },
    [loadReels]
  );

  const handleDeleteReelSet = useCallback(
    async (reelSet: ReelSet) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this reel set?"
      );
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

        setActiveReelForm((previous) =>
          previous?.reelSet.id === reelSet.id ? null : previous
        );

        setExpandedReelSets((previous) => {
          if (!previous.has(reelSet.id)) {
            return previous;
          }

          const next = new Set(previous);
          next.delete(reelSet.id);
          return next;
        });

        setReelStates((previous) => {
          if (!(reelSet.id in previous)) {
            return previous;
          }

          const next = { ...previous };
          delete next[reelSet.id];
          return next;
        });

        router.refresh();
      } catch (error) {
        console.error(`Failed to delete reel set ${reelSet.id}`, error);
      }
    },
    [editingReelSet, router]
  );

  const handleToggleReels = useCallback(
    (reelSet: ReelSet) => {
      setExpandedReelSets((previous) => {
        const next = new Set(previous);

        if (next.has(reelSet.id)) {
          next.delete(reelSet.id);
        } else {
          next.add(reelSet.id);
        }

        return next;
      });

      const isCurrentlyExpanded = expandedReelSets.has(reelSet.id);

      if (isCurrentlyExpanded) {
        setActiveReelForm((previous) =>
          previous?.reelSet.id === reelSet.id ? null : previous
        );
      } else if (!reelStates[reelSet.id]?.hasLoaded) {
        void loadReels(reelSet.id);
      }
    },
    [expandedReelSets, loadReels, reelStates]
  );

  const handleAddReel = useCallback(
    (reelSet: ReelSet) => {
      setActiveReelForm({ mode: "create", reelSet });

      setExpandedReelSets((previous) => {
        if (previous.has(reelSet.id)) {
          return previous;
        }

        const next = new Set(previous);
        next.add(reelSet.id);
        return next;
      });

      void loadReels(reelSet.id);
    },
    [loadReels]
  );

  const handleEditReel = useCallback(
    (reelSet: ReelSet, reel: Reel) => {
      setActiveReelForm({ mode: "edit", reelSet, reel });

      setExpandedReelSets((previous) => {
        if (previous.has(reelSet.id)) {
          return previous;
        }

        const next = new Set(previous);
        next.add(reelSet.id);
        return next;
      });

      if (!reelStates[reelSet.id]?.hasLoaded) {
        void loadReels(reelSet.id);
      }
    },
    [loadReels, reelStates]
  );

  const handleReelFormSuccess = useCallback(
    async (reelSetId: number, options?: ReelFormSuccessOptions) => {
      const currentState = reelStates[reelSetId];
      const targetPage = options?.refreshToFirstPage
        ? 0
        : currentState?.page ?? 0;

      await loadReels(reelSetId, targetPage);
      setActiveReelForm(null);
    },
    [loadReels, reelStates]
  );

  const handleDeleteReel = useCallback(
    async (reelSet: ReelSet, reel: Reel) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this reel?"
      );

      if (!confirmed) {
        return;
      }

      try {
        await deleteReel(reel.id);

        showToast({
          variant: "success",
          title: "Reel deleted",
          message: `Reel ${reel.id} has been removed successfully.`,
          hideButtonLabel: "Dismiss",
        });

        if (activeReelForm?.reel?.id === reel.id) {
          setActiveReelForm(null);
        }

        await loadReels(reelSet.id, 0);
      } catch (error) {
        console.error(`Failed to delete reel ${reel.id}`, error);
      }
    },
    [activeReelForm, loadReels]
  );

  const handleReelsPageChange = useCallback(
    (reelSetId: number, direction: "prev" | "next") => {
      const state = reelStates[reelSetId];
      if (!state || state.isLoading) {
        return;
      }

      const totalPages = computeTotalPages(state);
      const targetPage =
        direction === "prev"
          ? Math.max(0, state.page - 1)
          : Math.min(totalPages - 1, state.page + 1);

      if (targetPage === state.page) {
        return;
      }

      void loadReels(reelSetId, targetPage);
    },
    [loadReels, reelStates]
  );

  const renderReelSetCard = (reelSet: ReelSet) => {
    const isExpanded = expandedReelSets.has(reelSet.id);
    const state = reelStates[reelSet.id];
    const reels = state?.content ?? [];
    const totalPages = computeTotalPages(state);
    const currentPage = state ? state.page + 1 : 1;
    const canGoPrev = state ? state.page > 0 && !state.isLoading : false;
    const canGoNext = state
      ? state.page + 1 < totalPages && !state.isLoading && state.totalElements > 0
      : false;
    const showInitialSkeleton = Boolean(state?.isLoading && !state.hasLoaded);
    const showLoadingOverlay = Boolean(state?.isLoading && state.hasLoaded);
    const displayIndexBase = (state?.page ?? 0) * (state?.size ?? DEFAULT_REELS_PAGE_SIZE);

    return (
      <ComponentCard
        key={reelSet.id}
        title={
          <span className="flex items-center gap-3">
            <span>{reelSet.reelSetKey}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              ID: {reelSet.id}
            </span>
          </span>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleEditReelSet(reelSet)}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300"
              onClick={() => handleDeleteReelSet(reelSet)}
            >
              Delete
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleToggleReels(reelSet)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        }
      >
        {editingReelSet?.id === reelSet.id && (
          <form className="space-y-4" onSubmit={handleEditSubmit} noValidate>
            <div>
              <Label htmlFor={`edit-reel-set-key-${reelSet.id}`}>
                Reel set key<span className="text-error-500">*</span>
              </Label>
              <Input
                id={`edit-reel-set-key-${reelSet.id}`}
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

        {isExpanded ? (
          <div className="space-y-4">
            {activeReelForm?.reelSet.id === reelSet.id && (
              <ReelForm
                state={activeReelForm}
                onCancel={() => setActiveReelForm(null)}
                onSuccess={(options) => handleReelFormSuccess(reelSet.id, options)}
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button type="button" size="sm" onClick={() => handleAddReel(reelSet)}>
                Add reel
              </Button>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Page {Math.min(currentPage, totalPages)} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => handleReelsPageChange(reelSet.id, "prev")}
                    disabled={!canGoPrev}
                  >
                    Prev
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => handleReelsPageChange(reelSet.id, "next")}
                    disabled={!canGoNext}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>

            {showInitialSkeleton ? (
              <div className="space-y-3 rounded-xl border border-dashed border-gray-200 p-4 dark:border-gray-700">
                <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
                <div className="h-10 w-full animate-pulse rounded bg-gray-100 dark:bg-white/10" />
                <div className="h-10 w-full animate-pulse rounded bg-gray-100 dark:bg-white/10" />
              </div>
            ) : state?.error ? (
              <div className="rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-700/60 dark:bg-error-500/10 dark:text-error-300">
                <p>{state.error}</p>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  className="mt-3"
                  onClick={() => loadReels(reelSet.id, state.page)}
                >
                  Retry
                </Button>
              </div>
            ) : reels.length === 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <span>No reels yet.</span>
                <Button type="button" size="sm" onClick={() => handleAddReel(reelSet)}>
                  Add reel
                </Button>
              </div>
            ) : (
              <div className="relative">
                {showLoadingOverlay && (
                  <div className="absolute inset-0 rounded-xl bg-white/60 backdrop-blur-sm dark:bg-gray-900/40" />
                )}
                <Table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                  <TableHeader className="bg-gray-50 dark:bg-white/[0.03]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        #
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        Length
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        Symbols
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {reels.map((reel, index) => {
                      const displayIndex = displayIndexBase + index + 1;
                      return (
                        <TableRow
                          key={reel.id}
                          className="bg-white dark:bg-white/[0.02]"
                        >
                          <TableCell className="px-3 py-3 font-medium text-gray-700 dark:text-white/80">
                            {displayIndex}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-gray-600 dark:text-gray-300">
                            {reel.symbolIds.length}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-gray-600 dark:text-gray-300">
                            {formatSymbolPreview(reel.symbolIds)}
                          </TableCell>
                          <TableCell className="px-3 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                size="xs"
                                variant="outline"
                                onClick={() => handleEditReel(reelSet, reel)}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                size="xs"
                                variant="outline"
                                className="text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300"
                                onClick={() => handleDeleteReel(reelSet, reel)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Expand to manage reels for this set.
          </p>
        )}
      </ComponentCard>
    );
  };

  return (
    <ComponentCard
      title="Reel sets"
      action={
        <Button type="button" size="sm" onClick={handleToggleCreate}>
          {isCreateOpen ? "Hide form" : "Add reel set"}
        </Button>
      }
    >
      {isCreateOpen && (
        <form className="space-y-4" onSubmit={handleCreateSubmit} noValidate>
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

      {reelSets.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No reel sets have been added yet.
        </p>
      ) : (
        <div className="space-y-4">
          {reelSets.map((reelSet) => renderReelSetCard(reelSet))}
        </div>
      )}
    </ComponentCard>
  );
};

export default ReelSetsCard;
