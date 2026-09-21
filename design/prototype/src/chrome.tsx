import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import { Icon } from "./icons";
import type { IconName } from "./icons";
import { IconButton, Popover } from "./ui";
import { notifications, user } from "./data";
import { Link, navigate, usePath } from "./router";

/* ---------------------------------------------------------------- theme */
export const ThemeContext = createContext<{ dark: boolean; toggle: () => void }>({
  dark: false,
  toggle: () => {},
});
export const useTheme = () => useContext(ThemeContext);

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: IconName;
}

export const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "grid" },
      { id: "new", label: "New Workout", href: "/workouts/new", icon: "dumbbell" },
      { id: "history", label: "History", href: "/workouts/history", icon: "history" },
      { id: "exercises", label: "Exercises", href: "/exercises", icon: "list" },
      { id: "recovery", label: "Recovery", href: "/recovery", icon: "pulse" },
      { id: "progress", label: "Progress", href: "/progress", icon: "trend" },
    ],
  },
  {
    label: "Cognitive",
    items: [
      { id: "cognitype", label: "CogniType", href: "/cognitype", icon: "sparkle" },
      { id: "sessions", label: "Sessions", href: "/cognitype/sessions", icon: "calendar" },
      { id: "analytics", label: "Analytics", href: "/cognitype/analytics", icon: "bars" },
    ],
  },
  {
    label: "Account",
    items: [{ id: "profile", label: "Profile", href: "/profile", icon: "user" }],
  },
];

export function activeIdFor(path: string): string {
  if (path.startsWith("/cognitype/analytics")) return "analytics";
  if (path.startsWith("/cognitype/sessions")) return "sessions";
  if (path.startsWith("/cognitype")) return "cognitype";
  if (path.startsWith("/workouts/new")) return "new";
  if (path.startsWith("/workouts")) return "history";
  if (path.startsWith("/exercises")) return "exercises";
  if (path.startsWith("/recovery")) return "recovery";
  if (path.startsWith("/progress")) return "progress";
  if (path.startsWith("/profile")) return "profile";
  return "dashboard";
}

/* --------------------------------------------------------------- Logo */
export function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="FitxTracker home">
      <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-full", light ? "bg-white text-primary" : "bg-primary text-white")}>
        <Icon name="sparkle" size={20} strokeWidth={1.6} />
      </span>
      {!compact && (
        <span className={clsx("text-[17px] font-semibold tracking-[-0.02em]", light ? "text-white" : "text-ink")}>
          Fitx<span className={clsx("font-medium", light ? "text-white/70" : "text-muted")}>Tracker</span>
        </span>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------- Sidebar */
export function Sidebar() {
  const path = usePath();
  const active = activeIdFor(path);
  const rowCls = "group flex w-full items-center gap-3 rounded-[14px] px-2 py-2.5 text-left transition-colors duration-200 hover:bg-canvas";
  return (
    <nav aria-label="Primary" className="sticky top-0 hidden h-screen w-[76px] shrink-0 flex-col bg-surface px-3 py-7 md:flex xl:w-[260px] xl:px-5">
      <div className="px-1 xl:px-2">
        <span className="xl:hidden"><Logo compact /></span>
        <span className="hidden xl:inline"><Logo /></span>
      </div>

      <div className="mt-10 flex-1 space-y-8 overflow-y-auto no-scrollbar">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="micro mb-3 hidden px-3 text-muted xl:block">{section.label}</p>
            <ul className="space-y-1.5">
              {section.items.map((item) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <Link to={item.href} title={item.label} aria-label={item.label} aria-current={isActive ? "page" : undefined} className={rowCls}>
                      <span className={clsx("grid h-9 w-9 shrink-0 place-items-center rounded-[11px] transition-colors duration-200", isActive ? "bg-primary-soft text-primary" : "text-muted group-hover:text-primary")}>
                        <Icon name={item.icon} size={20} strokeWidth={isActive ? 1.9 : 1.5} />
                      </span>
                      <span className={clsx("hidden truncate text-[14.5px] xl:block", isActive ? "font-semibold text-ink" : "font-medium text-ink-soft group-hover:text-ink")}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-1.5 border-t border-hairline pt-5">
        <Link to="/profile?tab=settings" title="Settings" aria-label="Settings" className={rowCls}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] text-muted transition-colors duration-200 group-hover:text-primary"><Icon name="gear" size={20} /></span>
          <span className="hidden text-[14.5px] font-medium text-ink-soft xl:block">Settings</span>
        </Link>
        <button type="button" title="Logout" aria-label="Logout" onClick={() => navigate("/login")} className="group flex w-full items-center gap-3 rounded-[14px] px-2 py-2.5 transition-colors duration-200 hover:bg-[#FDE9E1] dark:hover:bg-[#F26B3A]/12" style={{ color: "var(--danger)" }}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px]"><Icon name="logout" size={20} /></span>
          <span className="hidden text-[14.5px] font-semibold xl:block">Logout</span>
        </button>
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------- TopBar */
export function TopBar() {
  const { dark, toggle } = useTheme();
  const [q, setQ] = useState("");
  return (
    <header className="flex items-center gap-3 py-5 md:gap-4">
      <div className="flex flex-1 items-center gap-3">
        <span className="md:hidden"><Logo compact /></span>
        <form className="relative hidden flex-1 items-center sm:flex" role="search" onSubmit={(e) => { e.preventDefault(); navigate(`/exercises?q=${encodeURIComponent(q)}`); }}>
          <label className="sr-only" htmlFor="global-search">Search</label>
          <Icon name="search" size={18} className="pointer-events-none absolute left-4 text-muted" />
          <input id="global-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search workouts, exercises…" className="h-11 w-full min-w-0 rounded-full border border-hairline bg-surface pl-11 pr-4 text-[14px] text-ink placeholder:text-muted focus:border-primary/40 focus:outline-none" />
        </form>
        <span className="sm:hidden"><IconButton icon="search" label="Search" variant="outline" onClick={() => navigate("/exercises")} /></span>
      </div>

      <span className="hidden sm:inline-grid"><IconButton icon="dumbbell" label="Log workout" variant="outline" onClick={() => navigate("/workouts/new")} /></span>
      <Popover
        align="right"
        trigger={(p) => <IconButton icon="bell" label={`Notifications, ${notifications.unread} unread`} variant="outline" badge {...p} />}
      >
        <div className="w-72 p-1">
          <p className="micro px-3 pt-2 text-muted">Notifications</p>
          <Link to="/recovery" className="mt-1 flex gap-3 rounded-[12px] p-3 hover:bg-canvas">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-tag" style={{ background: "var(--tag-amber-bg)", color: "var(--tag-amber-fg)" }}><Icon name="alert" size={18} /></span>
            <span>
              <span className="block text-[13.5px] font-semibold text-ink">{notifications.note}</span>
              <span className="block text-[12px] text-muted">Two nights under 6 h. Open Recovery to log today.</span>
            </span>
          </Link>
        </div>
      </Popover>
      <IconButton icon={dark ? "sun" : "moon"} label={dark ? "Switch to light theme" : "Switch to dark theme"} variant="outline" onClick={toggle} />
      <span className="mx-1 hidden h-8 w-px bg-hairline sm:block" />
      <Link to="/profile" className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition-colors duration-200 hover:bg-surface">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-[13px] font-bold text-primary">{user.initials}</span>
        <span className="hidden text-left lg:block">
          <span className="block text-[14px] font-semibold leading-tight text-ink">{user.fullName}</span>
          <span className="micro block text-muted">{user.goal}</span>
        </span>
      </Link>
    </header>
  );
}

/* ----------------------------------------------------------- MobileNav */
export function MobileNav() {
  const path = usePath();
  const active = activeIdFor(path);
  const items: NavItem[] = [
    { id: "dashboard", label: "Home", href: "/dashboard", icon: "home" },
    { id: "history", label: "History", href: "/workouts/history", icon: "history" },
    { id: "new", label: "Log", href: "/workouts/new", icon: "plus" },
    { id: "recovery", label: "Recovery", href: "/recovery", icon: "pulse" },
    { id: "profile", label: "Profile", href: "/profile", icon: "user" },
  ];
  return (
    <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="mx-auto flex max-w-md items-end justify-around px-2 pb-2 pt-2">
        {items.map((item) => {
          const isActive = active === item.id;
          if (item.id === "new") {
            return (
              <li key={item.id} className="-mt-7">
                <Link to={item.href} aria-label="Log workout" className="grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-lift transition-transform duration-200 active:scale-95">
                  <Icon name="plus" size={24} strokeWidth={1.8} />
                </Link>
                <span className="micro mt-1 block text-center text-muted">Log</span>
              </li>
            );
          }
          return (
            <li key={item.id}>
              <Link to={item.href} aria-label={item.label} aria-current={isActive ? "page" : undefined} className="flex min-h-[52px] min-w-[56px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5" style={{ color: isActive ? "var(--primary)" : "var(--muted)" }}>
                <Icon name={item.icon} size={21} strokeWidth={isActive ? 1.9 : 1.5} />
                <span className="text-[10.5px] font-semibold tracking-[0.04em]">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* --------------------------------------------------------------- Shell */
export function Shell({
  children,
  rail,
  railSticky = false,
  narrow = false,
}: {
  children: ReactNode;
  rail?: ReactNode;
  railSticky?: boolean;
  narrow?: boolean;
}) {
  return (
    <div className="min-h-screen bg-frame">
      <div className="app-window min-h-screen">
        <div className="md:flex">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <div className="px-4 sm:px-6 xl:px-8"><TopBar /></div>
            <div className="xl:flex xl:items-start">
              <main className={clsx("min-w-0 flex-1 px-4 pb-32 sm:px-6 md:pb-16 xl:px-8", narrow && "mx-auto max-w-[1080px]")}>{children}</main>
              {rail && (
                <aside aria-label="Summary" className={clsx("px-4 pb-32 sm:px-6 md:pb-16 xl:w-[356px] xl:shrink-0 xl:border-l xl:border-hairline xl:px-6", railSticky && "xl:sticky xl:top-0 xl:max-h-screen xl:overflow-y-auto no-scrollbar")}>
                  {rail}
                </aside>
              )}
            </div>
          </div>
        </div>
        <MobileNav />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- PageHeader */
export function PageHeader({ eyebrow, title, sub, actions }: { eyebrow?: string; title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="rise mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="micro text-muted">{eyebrow}</p>}
        <h1 className="mt-1.5 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[30px]">{title}</h1>
        {sub && <p className="mt-1.5 max-w-[46rem] text-[14px] text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
