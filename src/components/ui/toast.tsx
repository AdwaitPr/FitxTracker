"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, Check } from "lucide-react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => {};

export type ToastTone = "ok" | "danger";

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
  duration: number;
}

export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  duration?: number;
}

interface ToastContextValue {
  show: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    ({ message, tone = "ok", duration = 3200 }: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, tone, duration }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastItemComponent({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const remainingTimeRef = useRef(toast.duration);
  const startTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, remainingTimeRef.current);
  }, [onDismiss, toast.id]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  const isDanger = toast.tone === "danger";

  return (
    <div
      role={isDanger ? "alert" : "status"}
      aria-live={isDanger ? "assertive" : "polite"}
      tabIndex={0}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      onFocus={pauseTimer}
      onBlur={startTimer}
      className={cn(
        "rise pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-canvas shadow-lift select-none focus-visible:outline-2 focus-visible:outline-primary",
        "transition-transform hover:scale-[1.02]"
      )}
    >
      <span
        className={cn(
          "grid h-6 w-6 place-items-center rounded-full text-white shrink-0",
          isDanger ? "bg-danger" : "bg-[var(--tag-green-fg)]"
        )}
      >
        {isDanger ? (
          <AlertCircle size={14} strokeWidth={2.2} />
        ) : (
          <Check size={14} strokeWidth={2.2} />
        )}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted || toasts.length === 0) return null;

  return createPortal(
    <div
      aria-label="Notifications"
      className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 pointer-events-none md:bottom-8"
    >
      {toasts.map((toast) => (
        <ToastItemComponent
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>,
    document.body
  );
}
