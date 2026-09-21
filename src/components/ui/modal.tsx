"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  ReactNode,
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

let activeModalCount = 0;
let originalBodyOverflow = "";

function lockBodyScroll() {
  if (activeModalCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  activeModalCount++;
}

function unlockBodyScroll() {
  activeModalCount--;
  if (activeModalCount <= 0) {
    activeModalCount = 0;
    document.body.style.overflow = originalBodyOverflow;
  }
}

const emptySubscribe = () => () => {};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  danger?: boolean;
  size?: "md" | "lg";
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  danger = false,
  size = "md",
}: ModalProps) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!open) return;

    lockBodyScroll();
    const prevActiveElement = document.activeElement as HTMLElement | null;

    // Set inert on main layout sibling elements
    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.setAttribute("inert", "");
    }

    // Initial focus into modal
    const focusTimer = setTimeout(() => {
      if (panelRef.current) {
        const focusable = panelRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }
    }, 40);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(focusTimer);
      unlockBodyScroll();
      if (mainEl) {
        mainEl.removeAttribute("inert");
      }
      prevActiveElement?.focus();
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      data-modal-portal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay)] p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={cn(
          "rise flex max-h-[90dvh] w-full flex-col rounded-t-hero border border-hairline bg-surface p-6 shadow-lift sm:rounded-hero pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6",
          size === "lg" ? "sm:max-w-2xl" : "sm:max-w-md"
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4">
          <h2
            id={id}
            className={cn(
              "text-[19px] font-semibold tracking-[-0.02em]",
              danger ? "text-danger" : "text-ink"
            )}
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-muted transition-colors duration-150 hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex-1 min-h-0 overflow-y-auto pr-1">
          {children}
        </div>

        {footer && (
          <div className="mt-6 flex shrink-0 flex-wrap justify-end gap-2 pt-2 border-t border-hairline">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
