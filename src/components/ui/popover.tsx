"use client";

import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => {};

export interface PopoverTriggerProps {
  onClick: () => void;
  "aria-expanded": boolean;
  "aria-haspopup": "dialog";
}

export interface PopoverProps {
  triggerLabel?: string;
  triggerIcon?: ReactNode;
  triggerClassName?: string;
  trigger?: (props: PopoverTriggerProps) => ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function Popover({
  triggerLabel = "More information",
  triggerIcon,
  triggerClassName,
  trigger,
  children,
  align = "right",
  className,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 260; // approximate default width
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpwards = spaceBelow < 180 && spaceAbove > 180;

    const top = openUpwards ? rect.top - 8 : rect.bottom + 8;
    const left =
      align === "right"
        ? Math.max(8, Math.min(window.innerWidth - popoverWidth - 8, rect.right - popoverWidth))
        : Math.max(8, Math.min(window.innerWidth - popoverWidth - 8, rect.left));

    setCoords({ top, left });
  }, [align]);

  const handleClose = useCallback(() => {
    setOpen(false);
    triggerRef.current?.querySelector<HTMLElement>("button, [tabindex]")?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const rafId = requestAnimationFrame(() => {
      updatePosition();
    });

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        handleClose();
      }
    };

    const onScrollOrResize = () => {
      updatePosition();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, handleClose, updatePosition]);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    }
  };

  const toggle = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  return (
    <div ref={triggerRef} className="relative inline-block">
      {trigger ? (
        trigger({
          onClick: toggle,
          "aria-expanded": open,
          "aria-haspopup": "dialog",
        })
      ) : (
        <button
          type="button"
          aria-label={triggerLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={toggle}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full text-ink-muted transition-colors duration-200 hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer",
            triggerClassName
          )}
        >
          {triggerIcon || <Info size={16} />}
        </button>
      )}

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label={triggerLabel}
            onKeyDown={handleKeyDown}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            className={cn(
              "z-50 max-w-[calc(100vw-16px)] rounded-panel border border-hairline bg-surface p-3 shadow-lift focus:outline-none",
              className
            )}
          >
            {children}
          </div>,
          document.body
        )}
    </div>
  );
}
