"use client";

import { cn } from "@/lib/utils";
import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
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

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: "default" | "danger";
  disabled?: boolean;
}

export interface MenuProps {
  label?: string;
  items: MenuItem[];
  align?: "left" | "right";
  className?: string;
}

export function Menu({
  label = "More options",
  items,
  align = "right",
  className,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 176; // w-44 = 11rem = 176px
    const menuHeight = items.length * 40 + 16;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpwards = spaceBelow < menuHeight && spaceAbove > menuHeight;

    const top = openUpwards ? rect.top - menuHeight - 4 : rect.bottom + 4;
    const left =
      align === "right"
        ? Math.max(8, Math.min(window.innerWidth - menuWidth - 8, rect.right - menuWidth))
        : Math.max(8, Math.min(window.innerWidth - menuWidth - 8, rect.left));

    setCoords({ top, left });
  }, [align, items.length]);

  const handleOpen = () => {
    updatePosition();
    setOpen(true);
  };

  const handleClose = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const rafId = requestAnimationFrame(() => {
      updatePosition();
    });

    // Focus first enabled item
    const focusTimer = setTimeout(() => {
      const firstEnabledIndex = items.findIndex((it) => !it.disabled);
      if (firstEnabledIndex >= 0) {
        itemRefs.current[firstEnabledIndex]?.focus();
      }
    }, 30);

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        handleClose();
      }
    };

    const onScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(focusTimer);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, handleClose, updatePosition, items]);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
      return;
    }

    if (e.key === "Tab") {
      handleClose();
      return;
    }

    const enabledIndices = items
      .map((it, idx) => (!it.disabled ? idx : -1))
      .filter((idx) => idx !== -1);

    if (enabledIndices.length === 0) return;

    const currentFocusIndex = itemRefs.current.findIndex(
      (el) => el === document.activeElement
    );

    let nextIndex = -1;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const curPos = enabledIndices.indexOf(currentFocusIndex);
        nextIndex =
          curPos < enabledIndices.length - 1
            ? enabledIndices[curPos + 1]
            : enabledIndices[0];
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const curPos = enabledIndices.indexOf(currentFocusIndex);
        nextIndex =
          curPos > 0
            ? enabledIndices[curPos - 1]
            : enabledIndices[enabledIndices.length - 1];
        break;
      }
      case "Home":
        e.preventDefault();
        nextIndex = enabledIndices[0];
        break;
      case "End":
        e.preventDefault();
        nextIndex = enabledIndices[enabledIndices.length - 1];
        break;
      default:
        return;
    }

    if (nextIndex >= 0) {
      itemRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? handleClose() : handleOpen())}
        className="grid h-9 w-9 place-items-center rounded-full text-ink-muted transition-colors duration-200 hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
      >
        <EllipsisVertical size={18} />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            onKeyDown={handleKeyDown}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            className="z-50 w-44 rounded-panel border border-hairline bg-surface p-1.5 shadow-lift focus:outline-none"
          >
            {items.map((item, idx) => {
              const itemCls = cn(
                "flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[13px] font-medium transition-colors duration-150 cursor-pointer select-none",
                "focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2 focus:bg-canvas",
                item.tone === "danger"
                  ? "text-danger hover:bg-danger/10 hover:text-danger focus:bg-danger/10"
                  : "text-ink-soft hover:bg-canvas hover:text-ink",
                item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
              );

              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    ref={(el) => {
                      itemRefs.current[idx] = el;
                    }}
                    href={item.href}
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => {
                      setOpen(false);
                      item.onClick?.();
                    }}
                    className={itemCls}
                  >
                    {item.icon && (
                      <span className="shrink-0 inline-flex items-center">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  tabIndex={-1}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                  className={itemCls}
                >
                  {item.icon && (
                    <span className="shrink-0 inline-flex items-center">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
