"use client";

import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

export function Modal({ open, title, onClose, onSave, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <div className="p-4">{children}</div>
        <div className="flex justify-end gap-2 border-t border-[var(--border)] p-4">
          <Button variant="secondary" onClick={onClose} aria-label="Cancel">
            Cancel
          </Button>
          <Button onClick={onSave} aria-label="Save">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
