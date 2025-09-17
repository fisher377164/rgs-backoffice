export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  id?: string;
  variant: ToastVariant;
  title: string;
  message: string;
  hideButtonLabel?: string;
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
  createdAt: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();

const notify = () => {
  for (const listener of listeners) {
    listener([...toasts]);
  }
};

export const subscribeToToasts = (listener: ToastListener) => {
  listeners.add(listener);
  listener([...toasts]);

  return () => {
    listeners.delete(listener);
  };
};

export const getToastsSnapshot = () => [...toasts];

const serverToastsSnapshot: ToastItem[] = [];
export const getServerToastsSnapshot = (): ToastItem[] => serverToastsSnapshot;

const shouldRenderToasts = () => typeof window !== "undefined";

export const hideToast = (id: string) => {
  const nextToasts = toasts.filter((toast) => toast.id !== id);
  if (nextToasts.length === toasts.length) {
    return;
  }

  toasts = nextToasts;
  if (shouldRenderToasts()) {
    notify();
  }
};

export const showToast = (options: ToastOptions): string | undefined => {
  if (!shouldRenderToasts()) {
    return undefined;
  }

  const id = options.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const toast: ToastItem = {
    ...options,
    id,
    createdAt: Date.now(),
  };

  toasts = [...toasts, toast];
  notify();

  if (options.duration && options.duration > 0) {
    window.setTimeout(() => hideToast(id), options.duration);
  }

  return id;
};

export const clearToasts = () => {
  if (!shouldRenderToasts()) {
    return;
  }

  if (toasts.length === 0) {
    return;
  }

  toasts = [];
  notify();
};
