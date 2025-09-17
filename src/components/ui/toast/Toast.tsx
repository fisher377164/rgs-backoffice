"use client";

import type { FC } from "react";

import Alert from "../alert/Alert";
import { hideToast, ToastItem } from "@/lib/toastStore";

interface ToastProps {
  toast: ToastItem;
}

const Toast: FC<ToastProps> = ({ toast }) => {
  const { id, variant, title, message, hideButtonLabel } = toast;
  const label = hideButtonLabel ?? "Hide";

  return (
    <div className="space-y-2">
      <Alert variant={variant} title={title} message={message} />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => hideToast(id)}
          className="rounded-lg px-3 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white dark:focus:ring-offset-gray-900"
          aria-label="Hide notification"
        >
          {label}
        </button>
      </div>
    </div>
  );
};

export default Toast;
