
"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Modal } from "@/components/ui/modal";
import { ReelSet } from "@/lib/reel-sets/reelSetType";
import { createReelSet } from "@/lib/reel-sets/createReelSet";
import { updateReelSet } from "@/lib/reel-sets/updateReelSet";
import { deleteReelSet } from "@/lib/reel-sets/deleteReelSet";
import { Reel } from "@/lib/reels/reelType";
import { fetchReels } from "@/lib/reels/fetchReels";
import { createReel } from "@/lib/reels/createReel";
import { updateReel } from "@/lib/reels/updateReel";
import { deleteReel } from "@/lib/reels/deleteReel";
import { showToast } from "@/lib/toastStore";

interface ReelSetsCardProps {
  configurationId: number;
  reelSets: ReelSet[];
}

type ReelSetDialogMode = "create" | "edit";

type ReelDrawerMode = "create" | "edit";

interface ReelDialogState {
  mode: ReelSetDialogMode;
  isOpen: boolean;
  reelSet?: ReelSet;
  errors?: Record<string, string>;
}

interface ReelDrawerState {
  mode: ReelDrawerMode;
  isOpen: boolean;
  reelSetId: number | null;
  reel?: Reel;
}

type ReelCacheStatus = "idle" | "loading" | "ready" | "error";

interface ReelCacheEntry {
  status: ReelCacheStatus;
  reels: Reel[];
  error?: string;
}

const DRAG_TYPE = "REEL_ROW";

const formatSymbolsPreview = (symbols: number[]) => {
  if (!symbols.length) {
    return "—";
  }

  const truncated = symbols.slice(0, 20);
  const preview = truncated.join(", ");
  return symbols.length > 20 ? `${preview}, …` : preview;
};

const getReelStats = (symbols: number[]) => {
  if (!symbols.length) {
    return { length: 0, unique: 0, min: null as number | null, max: null as number | null };
  }

  const length = symbols.length;
  const unique = new Set(symbols).size;
  const min = Math.min(...symbols);
  const max = Math.max(...symbols);

  return { length, unique, min, max };
};

const parseSymbolsInput = (value: string) => {
  const tokens = value
    .split(/[\s,\n\r\t]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  const numbers: number[] = [];
  const invalid: string[] = [];

  tokens.forEach((token) => {
    const numberValue = Number(token);
    if (!Number.isFinite(numberValue)) {
      invalid.push(token);
      return;
    }

    numbers.push(numberValue);
  });

  return { numbers, invalid };
};

const ReelSetsCard = ({ configurationId, reelSets }: ReelSetsCardProps) => {
  const router = useRouter();
  const [reelSetsState, setReelSetsState] = useState<ReelSet[]>(() =>
    [...reelSets].sort((a, b) => a.reelSetKey.localeCompare(b.reelSetKey))
  );
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const [dialogState, setDialogState] = useState<ReelDialogState>({
    mode: "create",
    isOpen: false,
  });
  const [drawerState, setDrawerState] = useState<ReelDrawerState>({
    mode: "create",
    isOpen: false,
    reelSetId: null,
  });
  const [reelCache, setReelCache] = useState<Record<number, ReelCacheEntry>>(() => ({}));
  const reorderSnapshots = useRef(new Map<number, Reel[]>());
  const reorderInFlight = useRef(new Set<number>());

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    let active = true;

    const loadReels = async () => {
      await Promise.all(
        reelSets.map(async (set) => {
          setReelCache((previous) => {
            if (previous[set.id]) {
              return previous;
            }
            return {
              ...previous,
              [set.id]: {
                status: "loading",
                reels: [],
              },
            };
          });

          try {
            const data = await fetchReels(set.id);
            if (!active) {
              return;
            }

            setReelCache((previous) => ({
              ...previous,
              [set.id]: {
                status: "ready",
                reels: [...data].sort((a, b) => a.index - b.index),
              },
            }));
          } catch (error) {
            if (!active) {
              return;
            }

            console.error(`Failed to load reels for reel set ${set.id}`, error);
            setReelCache((previous) => ({
              ...previous,
              [set.id]: {
                status: "error",
                reels: [],
                error: "Failed to load reels",
              },
            }));
          }
        })
      );
    };

    loadReels();

    return () => {
      active = false;
    };
  }, [reelSets]);

  const handleOpenCreateDialog = () => {
    setDialogState({ mode: "create", isOpen: true });
  };

  const handleOpenEditDialog = (reelSet: ReelSet) => {
    setDialogState({ mode: "edit", isOpen: true, reelSet });
  };

  const handleDialogClose = () => {
    setDialogState((previous) => ({ ...previous, isOpen: false }));
  };

  const handleDrawerClose = () => {
    setDrawerState({ mode: "create", isOpen: false, reelSetId: null });
  };

  const upsertReelSetState = useCallback((payload: ReelSet) => {
    setReelSetsState((previous) => {
      const exists = previous.some((item) => item.id === payload.id);
      const next = exists
        ? previous.map((item) => (item.id === payload.id ? payload : item))
        : [...previous, payload];

      return next.sort((a, b) => a.reelSetKey.localeCompare(b.reelSetKey));
    });
  }, []);

  const removeReelSetState = useCallback((id: number) => {
    setReelSetsState((previous) => previous.filter((item) => item.id !== id));
    setReelCache((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
    setExpanded((previous) => {
      if (!previous.has(id)) {
        return previous;
      }
      const next = new Set(previous);
      next.delete(id);
      return next;
    });
  }, []);

  const handleDialogSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const reelSetKey = String(formData.get("reelSetKey") ?? "").trim();

    const errors: Record<string, string> = {};

    if (!reelSetKey.length) {
      errors.reelSetKey = "This field is required.";
    } else if (!/^[A-Z0-9_]+$/.test(reelSetKey)) {
      errors.reelSetKey = "Use uppercase letters, numbers, and underscores only.";
    }

    if (Object.keys(errors).length > 0) {
      setDialogState((previous) => ({ ...previous, errors }));
      return;
    }

    try {
      if (dialogState.mode === "create") {
        const created = await createReelSet({
          gameConfigurationId: configurationId,
          reelSetKey,
        });

        upsertReelSetState(created);
        setReelCache((previous) => ({
          ...previous,
          [created.id]: {
            status: "ready",
            reels: [],
          },
        }));

        showToast({
          variant: "success",
          title: "Reel set created",
          message: `${reelSetKey} has been created successfully.`,
          hideButtonLabel: "Dismiss",
        });
      } else if (dialogState.reelSet) {
        const updated = await updateReelSet(dialogState.reelSet.id, {
          gameConfigurationId: configurationId,
          reelSetKey,
        });

        upsertReelSetState(updated);

        showToast({
          variant: "success",
          title: "Reel set updated",
          message: `${reelSetKey} has been updated successfully.`,
          hideButtonLabel: "Dismiss",
        });
      }

      setDialogState({ mode: "create", isOpen: false });
    } catch (error) {
      console.error("Failed to submit reel set", error);
    } finally {
      router.refresh();
    }
  };

  const handleDeleteReelSet = useCallback(
    async (reelSet: ReelSet) => {
      const cacheEntry = reelCache[reelSet.id];
      const reelCount = cacheEntry?.reels.length ?? 0;

      setConfirmState({
        isOpen: true,
        title: "Delete reel set",
        description:
          reelCount > 0
            ? `This reel set contains ${reelCount} reel${reelCount === 1 ? "" : "s"}. Deleting it will remove all reels.`
            : "Are you sure you want to delete this reel set?",
        confirmLabel: "Delete",
        onConfirm: async () => {
          try {
            await deleteReelSet(reelSet.id);
            removeReelSetState(reelSet.id);
            showToast({
              variant: "success",
              title: "Reel set deleted",
              message: `${reelSet.reelSetKey} has been removed successfully.`,
              hideButtonLabel: "Dismiss",
            });
          } catch (error) {
            console.error(`Failed to delete reel set ${reelSet.id}`, error);
          } finally {
            setConfirmState(null);
            router.refresh();
          }
        },
      });
    },
    [reelCache, removeReelSetState, router]
  );

  const toggleExpand = (id: number) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleOpenCreateReel = (reelSetId: number) => {
    setDrawerState({ mode: "create", isOpen: true, reelSetId });
  };

  const handleOpenEditReel = (reelSetId: number, reel: Reel) => {
    setDrawerState({ mode: "edit", isOpen: true, reelSetId, reel });
  };

  const updateReelCache = (reelSetId: number, updater: (entry: ReelCacheEntry) => ReelCacheEntry) => {
    setReelCache((previous) => {
      const current = previous[reelSetId];
      if (!current) {
        return previous;
      }
      return {
        ...previous,
        [reelSetId]: updater(current),
      };
    });
  };

  const handleDrawerSubmit = async (payload: { symbols: number[] }) => {
    if (!drawerState.reelSetId) {
      return;
    }

    const { reelSetId } = drawerState;
    const entry = reelCache[reelSetId];
    if (!entry) {
      return;
    }

    try {
      if (drawerState.mode === "create") {
        const index = entry.reels.length + 1;
        const created = await createReel({
          reelSetId,
          index,
          symbolIds: payload.symbols,
        });

        updateReelCache(reelSetId, (current) => ({
          ...current,
          status: "ready",
          reels: [...current.reels, created].sort((a, b) => a.index - b.index),
        }));

        showToast({
          variant: "success",
          title: "Reel created",
          message: `Reel #${created.index} has been added to ${
            reelSetsState.find((set) => set.id === reelSetId)?.reelSetKey ?? "the reel set"
          }`,
          hideButtonLabel: "Dismiss",
        });
      } else if (drawerState.mode === "edit" && drawerState.reel) {
        const updated = await updateReel(drawerState.reel.id, {
          reelSetId,
          index: drawerState.reel.index,
          symbolIds: payload.symbols,
        });

        updateReelCache(reelSetId, (current) => ({
          ...current,
          status: "ready",
          reels: current.reels.map((reel) => (reel.id === updated.id ? updated : reel)),
        }));

        showToast({
          variant: "success",
          title: "Reel updated",
          message: `Reel #${updated.index} has been updated successfully.`,
          hideButtonLabel: "Dismiss",
        });
      }
    } catch (error) {
      console.error("Failed to submit reel", error);
    } finally {
      handleDrawerClose();
      router.refresh();
    }
  };

  const handleDeleteReel = async (reelSetId: number, reel: Reel) => {
    setConfirmState({
      isOpen: true,
      title: "Delete reel",
      description: `Delete reel #${reel.index}? This action cannot be undone.`,
      confirmLabel: "Delete",
      onConfirm: async () => {
        const entry = reelCache[reelSetId];
        if (!entry) {
          setConfirmState(null);
          return;
        }

        const previous = entry.reels;
        const nextReels = entry.reels.filter((item) => item.id !== reel.id);

        setReelCache((cache) => ({
          ...cache,
          [reelSetId]: {
            status: cache[reelSetId]?.status ?? "ready",
            reels: nextReels,
            error: cache[reelSetId]?.error,
          },
        }));

        try {
          await deleteReel(reel.id);

          const reindexed = nextReels.map((item, index) => ({
            ...item,
            index: index + 1,
          }));

          setReelCache((cache) => ({
            ...cache,
            [reelSetId]: {
              status: cache[reelSetId]?.status ?? "ready",
              reels: reindexed,
              error: cache[reelSetId]?.error,
            },
          }));

          await Promise.all(
            reindexed
              .filter((item) => {
                const original = previous.find((prev) => prev.id === item.id);
                return !original || original.index !== item.index;
              })
              .map((item) =>
                updateReel(item.id, {
                  reelSetId,
                  index: item.index,
                  symbolIds: item.symbolIds,
                })
              )
          );

          showToast({
            variant: "success",
            title: "Reel deleted",
            message: `Reel #${reel.index} has been removed.`,
            hideButtonLabel: "Dismiss",
          });
        } catch (error) {
          console.error("Failed to delete reel", error);
          setReelCache((cache) => ({
            ...cache,
            [reelSetId]: {
              status: cache[reelSetId]?.status ?? "ready",
              reels: previous,
            },
          }));
        } finally {
          setConfirmState(null);
          router.refresh();
        }
      },
    });
  };

  const handleDuplicateAllReels = async (reelSetId: number) => {
    const entry = reelCache[reelSetId];
    if (!entry || !entry.reels.length) {
      return;
    }

    const reelsToDuplicate = [...entry.reels].sort((a, b) => a.index - b.index);

    try {
      let currentIndex = entry.reels.length;
      const created: Reel[] = [];

      for (const reel of reelsToDuplicate) {
        currentIndex += 1;
        const result = await createReel({
          reelSetId,
          index: currentIndex,
          symbolIds: reel.symbolIds,
        });
        created.push(result);
      }

      updateReelCache(reelSetId, (current) => ({
        ...current,
        reels: [...current.reels, ...created].sort((a, b) => a.index - b.index),
      }));

      showToast({
        variant: "success",
        title: "Reels duplicated",
        message: `Duplicated ${created.length} reel${created.length === 1 ? "" : "s"}.`,
        hideButtonLabel: "Dismiss",
      });
    } catch (error) {
      console.error("Failed to duplicate reels", error);
    } finally {
      router.refresh();
    }
  };

  const handleRemoveAllReels = (reelSetId: number) => {
    const entry = reelCache[reelSetId];
    if (!entry || !entry.reels.length) {
      return;
    }

    setConfirmState({
      isOpen: true,
      title: "Remove all reels",
      description: "This will delete every reel in the set. This action cannot be undone.",
      confirmLabel: "Remove",
      onConfirm: async () => {
        const previous = entry.reels;
        updateReelCache(reelSetId, (current) => ({
          ...current,
          reels: [],
        }));

        try {
          await Promise.all(previous.map((reel) => deleteReel(reel.id)));
          showToast({
            variant: "success",
            title: "Reels removed",
            message: "All reels have been deleted.",
            hideButtonLabel: "Dismiss",
          });
        } catch (error) {
          console.error("Failed to remove reels", error);
          setReelCache((cache) => ({
            ...cache,
            [reelSetId]: {
              status: cache[reelSetId]?.status ?? "ready",
              reels: previous,
            },
          }));
        } finally {
          setConfirmState(null);
          router.refresh();
        }
      },
    });
  };

  const handleReorderStart = (reelSetId: number) => {
    if (reorderSnapshots.current.has(reelSetId)) {
      return;
    }

    const current = reelCache[reelSetId];
    if (current) {
      reorderSnapshots.current.set(reelSetId, current.reels.map((item) => ({ ...item })));
    }
  };

  const handleReorderMove = (reelSetId: number, dragIndex: number, hoverIndex: number) => {
    setReelCache((previous) => {
      const entry = previous[reelSetId];
      if (!entry) {
        return previous;
      }

      const nextReels = [...entry.reels];
      const [moved] = nextReels.splice(dragIndex, 1);
      nextReels.splice(hoverIndex, 0, moved);

      return {
        ...previous,
        [reelSetId]: {
          ...entry,
          reels: nextReels,
        },
      };
    });
  };

  const applyReelIndexes = (reels: Reel[]) =>
    reels.map((item, index) => ({
      ...item,
      index: index + 1,
    }));

  const handleReorderCancel = (reelSetId: number) => {
    const snapshot = reorderSnapshots.current.get(reelSetId);
    if (!snapshot) {
      return;
    }

    setReelCache((previous) => ({
      ...previous,
      [reelSetId]: {
        status: previous[reelSetId]?.status ?? "ready",
        reels: snapshot,
      },
    }));

    reorderSnapshots.current.delete(reelSetId);
  };

  const handleReorderEnd = async (reelSetId: number) => {
    const snapshot = reorderSnapshots.current.get(reelSetId);
    reorderSnapshots.current.delete(reelSetId);

    const entry = reelCache[reelSetId];
    if (!entry) {
      return;
    }

    const reordered = applyReelIndexes(entry.reels);

    setReelCache((previous) => ({
      ...previous,
      [reelSetId]: {
        ...previous[reelSetId],
        reels: reordered,
      },
    }));

    const updates = reordered.filter((reel, index) => reel.index !== snapshot?.[index]?.index);

    if (!updates.length) {
      return;
    }

    if (reorderInFlight.current.has(reelSetId)) {
      return;
    }

    reorderInFlight.current.add(reelSetId);

    try {
      await Promise.all(
        reordered.map((reel) =>
          updateReel(reel.id, {
            reelSetId,
            index: reel.index,
            symbolIds: reel.symbolIds,
          })
        )
      );

      showToast({
        variant: "success",
        title: "Reels reordered",
        message: "The reel order was updated successfully.",
        hideButtonLabel: "Dismiss",
      });
    } catch (error) {
      console.error("Failed to reorder reels", error);
      if (snapshot) {
        setReelCache((previous) => ({
          ...previous,
          [reelSetId]: {
            status: previous[reelSetId]?.status ?? "ready",
            reels: snapshot,
          },
        }));
      }
    } finally {
      reorderInFlight.current.delete(reelSetId);
      router.refresh();
    }
  };

  return (
    <ComponentCard
      title="Reel sets"
      action={
        <div className="flex justify-end">
          <Button type="button" size="sm" onClick={handleOpenCreateDialog}>
            New reel set
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {reelSetsState.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-700/60 bg-gray-900/40 p-10 text-center">
            <p className="text-sm text-gray-400">No reel sets available. Create a new set to get started.</p>
          </div>
        ) : (
          reelSetsState.map((reelSet) => {
            const cacheEntry = reelCache[reelSet.id];
            const isExpanded = expanded.has(reelSet.id);
            const reelCount = cacheEntry?.reels.length ?? 0;
            const symbolTotal = cacheEntry?.reels.reduce((total, reel) => total + reel.symbolIds.length, 0) ?? 0;

            return (
              <ReelSetCardItem
                key={reelSet.id}
                reelSet={reelSet}
                isExpanded={isExpanded}
                toggleExpand={() => toggleExpand(reelSet.id)}
                onEdit={() => handleOpenEditDialog(reelSet)}
                onDelete={() => handleDeleteReelSet(reelSet)}
                onAddReel={() => handleOpenCreateReel(reelSet.id)}
                onEditReel={(reel) => handleOpenEditReel(reelSet.id, reel)}
                onDeleteReel={(reel) => handleDeleteReel(reelSet.id, reel)}
                onDuplicateAll={() => handleDuplicateAllReels(reelSet.id)}
                onRemoveAll={() => handleRemoveAllReels(reelSet.id)}
                reelEntry={cacheEntry}
                reelCount={reelCount}
                symbolTotal={symbolTotal}
                onReorderStart={() => handleReorderStart(reelSet.id)}
                onReorderMove={(dragIndex, hoverIndex) => handleReorderMove(reelSet.id, dragIndex, hoverIndex)}
                onReorderCancel={() => handleReorderCancel(reelSet.id)}
                onReorderEnd={() => handleReorderEnd(reelSet.id)}
              />
            );
          })
        )}
      </div>

      <ReelSetDialog
        state={dialogState}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
      />

      <ReelDrawer
        state={drawerState}
        onClose={handleDrawerClose}
        onSubmit={handleDrawerSubmit}
      />

      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
    </ComponentCard>
  );
};

interface ReelSetDialogProps {
  state: ReelDialogState;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const ReelSetDialog = ({ state, onClose, onSubmit }: ReelSetDialogProps) => {
  const { isOpen, mode, reelSet, errors } = state;
  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg" showCloseButton>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white/90">
          {mode === "create" ? "Create reel set" : `Edit ${reelSet?.reelSetKey}`}
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          Define a unique key for the reel set. Use uppercase letters, digits, and underscores only.
        </p>
        <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
          <div>
            <Label htmlFor="reel-set-key">
              Reel set key<span className="text-error-500">*</span>
            </Label>
            <Input
              id="reel-set-key"
              name="reelSetKey"
              defaultValue={reelSet?.reelSetKey}
              placeholder="RS_BASE_SPIN_1"
              required
              error={Boolean(errors?.reelSetKey)}
              hint={errors?.reelSetKey}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

interface ReelDrawerProps {
  state: ReelDrawerState;
  onClose: () => void;
  onSubmit: (payload: { symbols: number[] }) => void;
}

const ReelDrawer = ({ state, onClose, onSubmit }: ReelDrawerProps) => {
  const { isOpen, mode, reel, reelSetId } = state;
  const [value, setValue] = useState(() => (reel ? reel.symbolIds.join(" ") : ""));
  const [errors, setErrors] = useState<string | null>(null);
  const parsed = useMemo(() => parseSymbolsInput(value), [value]);
  const stats = useMemo(() => getReelStats(parsed.numbers), [parsed.numbers]);

  useEffect(() => {
    if (reel) {
      setValue(reel.symbolIds.join(" "));
    } else if (!isOpen) {
      setValue("");
    }
  }, [isOpen, reel]);

  useEffect(() => {
    setErrors(parsed.invalid.length ? `Invalid entries: ${parsed.invalid.join(", ")}` : null);
  }, [parsed.invalid]);

  if (!isOpen || !reelSetId) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (parsed.invalid.length) {
      setErrors(`Invalid entries: ${parsed.invalid.join(", ")}`);
      return;
    }

    if (!parsed.numbers.length) {
      setErrors("Provide at least one symbol.");
      return;
    }

    onSubmit({ symbols: parsed.numbers });
  };

  const handleNormalizeSpaces = () => {
    setValue(parsed.numbers.join(" "));
  };

  const handleCopyCsv = async () => {
    try {
      await navigator.clipboard.writeText(parsed.numbers.join(","));
      showToast({
        variant: "success",
        title: "Copied",
        message: "Symbols copied as CSV.",
        hideButtonLabel: "Dismiss",
      });
    } catch (error) {
      console.error("Failed to copy CSV", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex">
      <div className="hidden flex-1 bg-black/30 backdrop-blur" onClick={onClose} />
      <div className="relative ml-auto flex h-full w-full max-w-xl flex-col bg-gray-950">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-white/90">
              {mode === "create" ? "Add reel" : `Edit reel #${reel?.index ?? ""}`}
            </h3>
            <p className="text-sm text-gray-400">
              Paste numbers separated by spaces, commas, or new lines.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-800 hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        <form className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6" onSubmit={handleSubmit} noValidate>
          <div>
            <Label>Reel set ID</Label>
            <p className="mt-1 text-sm text-gray-300">{reelSetId}</p>
          </div>
          <div>
            <Label>Index</Label>
            <p className="mt-1 text-sm text-gray-300">{mode === "create" ? "Will be appended" : reel?.index}</p>
          </div>
          <div>
            <Label htmlFor="reel-symbols">
              Symbols<span className="text-error-500">*</span>
            </Label>
            <TextArea
              id="reel-symbols"
              name="symbols"
              rows={10}
              value={value}
              onChange={setValue}
              className="min-h-[200px] rounded-lg border border-gray-800 bg-gray-900 text-sm text-gray-100 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/40"
            />
            {errors ? (
              <p className="mt-2 text-xs text-error-400">{errors}</p>
            ) : (
              <p className="mt-2 text-xs text-gray-400">{parsed.numbers.length} symbol(s) detected.</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" size="xs" variant="outline" onClick={handleCopyCsv}>
                Copy as CSV
              </Button>
              <Button type="button" size="xs" variant="outline" onClick={handleNormalizeSpaces}>
                Normalize spaces
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-sm text-gray-300">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Length</p>
              <p className="mt-1 text-base font-semibold text-white/90">{stats.length}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Unique</p>
              <p className="mt-1 text-base font-semibold text-white/90">{stats.unique}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Min</p>
              <p className="mt-1 text-base font-semibold text-white/90">{stats.min ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Max</p>
              <p className="mt-1 text-base font-semibold text-white/90">{stats.max ?? "—"}</p>
            </div>
          </div>
          <div className="mt-auto flex justify-end gap-3 border-t border-gray-800 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  state: {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null;
  onClose: () => void;
}

const ConfirmDialog = ({ state, onClose }: ConfirmDialogProps) => {
  if (!state?.isOpen) {
    return null;
  }

  const { title, description, confirmLabel, onConfirm } = state;

  return (
    <Modal isOpen onClose={onClose} className="max-w-md" showCloseButton>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white/90">{title}</h3>
        <p className="mt-2 text-sm text-gray-400">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-error-600 hover:bg-error-500"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

interface ReelSetCardItemProps {
  reelSet: ReelSet;
  isExpanded: boolean;
  toggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddReel: () => void;
  onEditReel: (reel: Reel) => void;
  onDeleteReel: (reel: Reel) => void;
  onDuplicateAll: () => void;
  onRemoveAll: () => void;
  reelEntry?: ReelCacheEntry;
  reelCount: number;
  symbolTotal: number;
  onReorderStart: () => void;
  onReorderMove: (dragIndex: number, hoverIndex: number) => void;
  onReorderCancel: () => void;
  onReorderEnd: () => void;
}

const ReelSetCardItem = ({
  reelSet,
  isExpanded,
  toggleExpand,
  onEdit,
  onDelete,
  onAddReel,
  onEditReel,
  onDeleteReel,
  onDuplicateAll,
  onRemoveAll,
  reelEntry,
  reelCount,
  symbolTotal,
  onReorderStart,
  onReorderMove,
  onReorderCancel,
  onReorderEnd,
}: ReelSetCardItemProps) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-950/80 shadow-lg">
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h4 className="text-lg font-semibold tracking-tight text-white/90">
              {reelSet.reelSetKey}
            </h4>
            <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-gray-400">ID {reelSet.id}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span>
              <strong className="font-semibold text-white/90">{reelCount}</strong> reels
            </span>
            <span>
              <strong className="font-semibold text-white/90">{symbolTotal}</strong> symbols
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsActionsOpen((previous) => !previous)}
            className="dropdown-toggle inline-flex items-center gap-2 rounded-lg border border-gray-800 px-3 py-2 text-xs font-medium text-gray-300 transition hover:bg-gray-900"
          >
            Bulk actions
            <span className="text-gray-500">▾</span>
          </button>
          <Dropdown isOpen={isActionsOpen} onClose={() => setIsActionsOpen(false)}>
            <div className="w-48 py-2">
              <DropdownItem onClick={() => { setIsActionsOpen(false); onDuplicateAll(); }}>
                Duplicate all reels
              </DropdownItem>
              <DropdownItem onClick={() => { setIsActionsOpen(false); onRemoveAll(); }} className="text-error-500">
                Remove all reels
              </DropdownItem>
            </div>
          </Dropdown>
          <Button type="button" size="sm" variant="outline" onClick={onEdit}>
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-error-600 text-error-400 hover:bg-error-500/10"
            onClick={onDelete}
          >
            Delete
          </Button>
          <button
            type="button"
            onClick={toggleExpand}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-800 px-3 py-2 text-xs font-medium text-gray-300 transition hover:bg-gray-900"
          >
            {isExpanded ? "Collapse" : "Expand"}
            <span>{isExpanded ? "▴" : "▾"}</span>
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="border-t border-gray-800 bg-gray-950/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h5 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Reels
            </h5>
            <Button type="button" size="sm" onClick={onAddReel}>
              Add reel
            </Button>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-900">
            <DndProvider backend={HTML5Backend}>
              <ReelsTable
                reels={reelEntry?.reels ?? []}
                status={reelEntry?.status ?? "idle"}
                onEdit={onEditReel}
                onDelete={onDeleteReel}
                onReorderStart={onReorderStart}
                onReorderMove={onReorderMove}
                onReorderCancel={onReorderCancel}
                onReorderEnd={onReorderEnd}
              />
            </DndProvider>
          </div>
        </div>
      )}
    </div>
  );
};

interface ReelsTableProps {
  reels: Reel[];
  status: ReelCacheStatus;
  onEdit: (reel: Reel) => void;
  onDelete: (reel: Reel) => void;
  onReorderStart: () => void;
  onReorderMove: (dragIndex: number, hoverIndex: number) => void;
  onReorderCancel: () => void;
  onReorderEnd: () => void;
}

interface DragItem {
  type: typeof DRAG_TYPE;
  id: number;
  index: number;
}

const ReelsTable = ({
  reels,
  status,
  onEdit,
  onDelete,
  onReorderStart,
  onReorderMove,
  onReorderCancel,
  onReorderEnd,
}: ReelsTableProps) => {
  if (status === "loading") {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-gray-400">
        Loading reels…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-error-400">
        Failed to load reels.
      </div>
    );
  }

  if (!reels.length) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-gray-500">
        No reels yet.
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-800 text-sm">
      <thead>
        <tr className="bg-gray-900/60 text-left text-xs uppercase tracking-wide text-gray-500">
          <th className="w-12 px-4 py-3">#</th>
          <th className="w-20 px-4 py-3">Length</th>
          <th className="px-4 py-3">Symbols</th>
          <th className="w-32 px-4 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-900/60">
        {reels.map((reel, index) => (
          <SortableReelRow
            key={reel.id}
            reel={reel}
            index={index}
            onEdit={() => onEdit(reel)}
            onDelete={() => onDelete(reel)}
            onReorderStart={onReorderStart}
            onReorderMove={onReorderMove}
            onReorderCancel={onReorderCancel}
            onReorderEnd={onReorderEnd}
          />
        ))}
      </tbody>
    </table>
  );
};

interface SortableReelRowProps {
  reel: Reel;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onReorderStart: () => void;
  onReorderMove: (dragIndex: number, hoverIndex: number) => void;
  onReorderCancel: () => void;
  onReorderEnd: () => void;
}

const SortableReelRow = ({
  reel,
  index,
  onEdit,
  onDelete,
  onReorderStart,
  onReorderMove,
  onReorderCancel,
  onReorderEnd,
}: SortableReelRowProps) => {
  const hasMovedRef = useRef(false);

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: DRAG_TYPE,
      item: { id: reel.id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      begin: () => {
        hasMovedRef.current = false;
        onReorderStart();
      },
      end: (_item, monitor) => {
        if (!monitor.didDrop()) {
          onReorderCancel();
          return;
        }

        if (hasMovedRef.current) {
          onReorderEnd();
        }
      },
    }),
    [index, onReorderCancel, onReorderEnd, onReorderStart]
  );

  const [, dropRef] = useDrop(
    () => ({
      accept: DRAG_TYPE,
      drop: () => ({ moved: true }),
      hover: (item: DragItem) => {
        if (item.id === reel.id || item.index === index) {
          return;
        }

        hasMovedRef.current = true;
        onReorderMove(item.index, index);
        item.index = index;
      },
    }),
    [index, onReorderMove, reel.id]
  );

  const setRef = (node: HTMLTableRowElement | null) => {
    dropRef(node);
    dragRef(node);
  };

  return (
    <tr
      ref={setRef}
      className={`transition ${isDragging ? "bg-brand-500/10" : "bg-transparent"}`}
    >
      <td className="px-4 py-3 align-middle text-gray-400">
        <span className="cursor-move">☰</span>
      </td>
      <td className="px-4 py-3 align-middle text-gray-200">{reel.symbolIds.length}</td>
      <td className="px-4 py-3 align-middle font-mono text-xs text-gray-300">
        {formatSymbolsPreview(reel.symbolIds)}
      </td>
      <td className="px-4 py-3 align-middle text-right text-sm text-gray-300">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border border-gray-800 px-3 py-1 text-xs font-medium text-gray-300 transition hover:bg-gray-900"
          >
            Edit symbols
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-gray-800 px-3 py-1 text-xs font-medium text-error-400 transition hover:bg-error-500/10"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ReelSetsCard;
