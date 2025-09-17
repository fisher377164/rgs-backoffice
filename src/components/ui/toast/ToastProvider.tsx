"use client";

import { useSyncExternalStore } from "react";
import type { FC, PropsWithChildren } from "react";

import Toast from "./Toast";
import {
  getServerToastsSnapshot,
  getToastsSnapshot,
  subscribeToToasts,
  ToastItem,
} from "@/lib/toastStore";

const useToasts = (): ToastItem[] =>
  useSyncExternalStore(subscribeToToasts, getToastsSnapshot, getServerToastsSnapshot);

const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const toasts = useToasts();

  return (
    <>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-[9999] flex justify-center px-4 sm:justify-end sm:px-6">
        <div className="flex w-full max-w-sm flex-col gap-4">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast toast={toast} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ToastProvider;
