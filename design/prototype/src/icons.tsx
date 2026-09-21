import type { ReactNode } from "react";

export type IconName =
  | "grid" | "dumbbell" | "history" | "list" | "pulse" | "trend" | "user" | "sparkle"
  | "calendar" | "bars" | "gear" | "logout" | "search" | "bell" | "mail" | "plus" | "minus"
  | "arrowRight" | "arrowLeft" | "arrowUpRight" | "chevronLeft" | "chevronRight" | "chevronDown" | "chevronUp"
  | "more" | "heart" | "moon" | "sun" | "check" | "close" | "scale" | "clock" | "zap" | "copy" | "trash" | "eye" | "eyeOff"
  | "play" | "pause" | "timer" | "edit" | "info" | "filter" | "keyboard" | "volume" | "lock" | "save"
  | "trophy" | "flame" | "target" | "refresh" | "home" | "shield" | "star" | "activity" | "music" | "waves" | "ruler" | "alert" | "layers";

const PATHS: Record<IconName, ReactNode> = {
  grid: (<><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></>),
  dumbbell: <path d="M6.5 5.5v13M17.5 5.5v13M3.5 8.5v7M20.5 8.5v7M6.5 12h11" />,
  history: (<><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" /><path d="M3.5 4.5v4h4" /><path d="M12 7.5V12l3 1.8" /></>),
  list: <path d="M8.5 6h12M8.5 12h12M8.5 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  pulse: (<><path d="M12 20.2s-6.8-4.2-6.8-9A3.9 3.9 0 0 1 12 8.6a3.9 3.9 0 0 1 6.8 2.6c0 .5-.1 1-.3 1.5" /><path d="M3.5 13.5h3.2l1.6-2.6 2.2 4.4 1.7-3 1.4 1.2h3.2" /></>),
  trend: (<><path d="M3.5 16.5l5.5-5.4 3.6 3.4 7.9-8" /><path d="M15.5 6.5h5v5" /></>),
  user: (<><circle cx="12" cy="8.2" r="3.7" /><path d="M4.5 20c1.5-3.6 4.3-5.3 7.5-5.3s6 1.7 7.5 5.3" /></>),
  sparkle: <path d="M12 2.8l2.1 6 6 2.1-6 2.1-2.1 6-2.1-6-6-2.1 6-2.1z" />,
  calendar: (<><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 9.8h17M8.5 3.5v3M15.5 3.5v3M8 14h3" /></>),
  bars: <path d="M5 20V11M12 20V4.5M19 20v-6.5" />,
  gear: (<><circle cx="12" cy="12" r="3.1" /><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.4 5.4l1.9 1.9M16.7 16.7l1.9 1.9M18.6 5.4l-1.9 1.9M7.3 16.7l-1.9 1.9" /></>),
  logout: (<><path d="M14.5 3.5H18a2.5 2.5 0 0 1 2.5 2.5v12a2.5 2.5 0 0 1-2.5 2.5h-3.5" /><path d="M9.5 8L5.5 12l4 4M5.5 12H15" /></>),
  search: (<><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>),
  bell: (<><path d="M6.2 16.5V11a5.8 5.8 0 0 1 11.6 0v5.5l1.7 2H4.5z" /><path d="M10 21a2.2 2.2 0 0 0 4 0" /></>),
  mail: (<><rect x="3" y="5.5" width="18" height="13" rx="3" /><path d="M3.8 7.5L12 13l8.2-5.5" /></>),
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  minus: <path d="M5.5 12h13" />,
  arrowRight: (<><path d="M4.5 12h14" /><path d="M13 6.5l5.5 5.5L13 17.5" /></>),
  arrowLeft: (<><path d="M19.5 12h-14" /><path d="M11 6.5L5.5 12l5.5 5.5" /></>),
  arrowUpRight: <path d="M7 17L17 7M8.5 7H17v8.5" />,
  chevronLeft: <path d="M14.5 5.5L8 12l6.5 6.5" />,
  chevronRight: <path d="M9.5 5.5L16 12l-6.5 6.5" />,
  chevronDown: <path d="M5.5 9.5L12 16l6.5-6.5" />,
  chevronUp: <path d="M5.5 14.5L12 8l6.5 6.5" />,
  more: (<><circle cx="12" cy="5.5" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="12" cy="18.5" r="1.3" /></>),
  heart: <path d="M12 20.2s-6.8-4.2-6.8-9A3.9 3.9 0 0 1 12 8.6a3.9 3.9 0 0 1 6.8 2.6c0 4.8-6.8 9-6.8 9z" />,
  moon: <path d="M20.3 14.6A8.6 8.6 0 0 1 9.4 3.7a8.6 8.6 0 1 0 10.9 10.9z" />,
  sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7" /></>),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  scale: (<><path d="M4.5 8.5h15l-1.8 11.2a1.5 1.5 0 0 1-1.5 1.3H7.8a1.5 1.5 0 0 1-1.5-1.3z" /><path d="M9 8.5a3 3 0 0 1 6 0" /></>),
  clock: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" /></>),
  zap: <path d="M13.5 3L6 13.2h5.2L10.5 21 18 10.8h-5.2z" />,
  copy: (<><rect x="8.5" y="8.5" width="12" height="12" rx="3" /><path d="M15.5 5.5A2.5 2.5 0 0 0 13 3.5H7A3.5 3.5 0 0 0 3.5 7v6a2.5 2.5 0 0 0 2 2.4" /></>),
  trash: (<><path d="M4.5 6.5h15M9.5 6.5V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" /><path d="M6.5 6.5l1 13a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-13" /></>),
  eye: (<><path d="M2.8 12S6.5 5.8 12 5.8 21.2 12 21.2 12 17.5 18.2 12 18.2 2.8 12 2.8 12z" /><circle cx="12" cy="12" r="2.8" /></>),
  eyeOff: (<><path d="M4 4l16 16M10.6 6.2A9.6 9.6 0 0 1 12 6c5.5 0 9.2 6 9.2 6a15 15 0 0 1-3.1 3.6M6.4 7.7A15 15 0 0 0 2.8 12S6.5 18 12 18c1.4 0 2.6-.3 3.7-.9" /><path d="M9.9 9.9a2.8 2.8 0 0 0 4 4" /></>),
  play: <path d="M8 5.5v13l10-6.5z" />,
  pause: <path d="M8 5.5v13M16 5.5v13" />,
  timer: (<><circle cx="12" cy="13.5" r="7.5" /><path d="M12 9.5v4l2.5 1.5M9.5 3h5M12 3v3" /></>),
  edit: (<><path d="M4 20h4.5L19.5 9a2.1 2.1 0 0 0-3-3L5.5 17z" /><path d="M14 8.5l2.5 2.5" /></>),
  info: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8v.01" /></>),
  filter: <path d="M3.5 6h17M6.5 12h11M9.5 18h5" />,
  keyboard: (<><rect x="2.5" y="6.5" width="19" height="11" rx="2.5" /><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M6 14h.01M9 14h6M16.5 14h.01" /></>),
  volume: (<><path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z" /><path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10" /></>),
  lock: (<><rect x="5" y="10.5" width="14" height="10" rx="3" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v2" /></>),
  save: (<><path d="M5.5 3.5h10l3 3v12a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z" /><path d="M8 3.5V9h7V3.5M8 20.5v-6h8v6" /></>),
  trophy: (<><path d="M8 4.5h8v5a4 4 0 0 1-8 0z" /><path d="M8 6H5.5a2.5 2.5 0 0 0 2.6 4M16 6h2.5a2.5 2.5 0 0 1-2.6 4M12 13.5v3M8.5 19.5h7M10 16.5h4v3h-4z" /></>),
  flame: <path d="M12 21c-4 0-6.5-2.6-6.5-6.2 0-3 2-5.2 3.4-6.8.2 1.4.9 2.4 1.9 2.8-.2-2.8 1-5.6 3.4-7.8 0 2.8 1.2 4 2.6 5.6 1.3 1.5 2.7 3.3 2.7 6.2 0 3.6-3.5 6.2-7.5 6.2z" />,
  target: (<><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>),
  refresh: (<><path d="M20 12a8 8 0 0 1-14.5 4.7M4 12a8 8 0 0 1 14.5-4.7" /><path d="M4 4.5v4h4M20 19.5v-4h-4" /></>),
  home: (<><path d="M4 11l8-7 8 7v8.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5z" /><path d="M9.5 21v-6h5v6" /></>),
  shield: (<><path d="M12 3l7.5 3v6c0 4.5-3 8-7.5 9.5C7.5 20 4.5 16.5 4.5 12V6z" /><path d="M9 12l2 2 4-4" /></>),
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z" />,
  activity: <path d="M3.5 12h3.6l2.4-6 4 12 2.4-6h4.6" />,
  music: (<><path d="M9 18V6l11-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></>),
  waves: <path d="M3 8.5c2 0 2-1.5 4.5-1.5s2.5 1.5 4.5 1.5 2-1.5 4.5-1.5 2.5 1.5 4.5 1.5M3 12.5c2 0 2-1.5 4.5-1.5s2.5 1.5 4.5 1.5 2-1.5 4.5-1.5 2.5 1.5 4.5 1.5M3 16.5c2 0 2-1.5 4.5-1.5s2.5 1.5 4.5 1.5 2-1.5 4.5-1.5 2.5 1.5 4.5 1.5" />,
  ruler: (<><path d="M3.5 16.5L16.5 3.5l4 4-13 13z" /><path d="M7 13l1.5 1.5M10 10l1.5 1.5M13 7l1.5 1.5" /></>),
  alert: (<><path d="M12 3.5l9 16h-18z" /><path d="M12 10v4M12 16.5v.01" /></>),
  layers: (<><path d="M12 3.5l9 4.5-9 4.5-9-4.5z" /><path d="M3 12l9 4.5 9-4.5M3 16l9 4.5 9-4.5" /></>),
};

export function Icon({ name, size = 20, className = "", strokeWidth = 1.5 }: { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      {PATHS[name]}
    </svg>
  );
}

export type MuscleGlyphName = "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core" | "Cardio";

const GLYPHS: Record<MuscleGlyphName, ReactNode> = {
  Chest: (<><path d="M50 26c-13-6-30-1-30 18s10 27 24 24" /><path d="M50 26c13-6 30-1 30 18s-10 27-24 24" /><path d="M50 24v46" /></>),
  Back: (<><path d="M34 18c-8 12-13 24-13 36 0 10 5 18 13 22" /><path d="M66 18c8 12 13 24 13 36 0 10-5 18-13 22" /><path d="M50 18v58M32 40h36" /></>),
  Legs: (<><path d="M40 14v30l-8 40M60 14v30l8 40" /><path d="M32 44h36" /></>),
  Shoulders: (<><path d="M16 52c0-12 8-20 18-20h32c10 0 18 8 18 20" /><path d="M30 32v42M70 32v42M50 32v26" /></>),
  Arms: (<><path d="M18 78c0-24 14-42 32-42 12 0 18 8 18 16s-6 14-14 14" /><path d="M62 60l12 12-12 12" /></>),
  Core: (<><rect x="28" y="14" width="44" height="66" rx="8" /><path d="M28 36h44M28 58h44M50 14v66" /></>),
  Cardio: (<><path d="M50 82S18 62 18 41a14 14 0 0 1 32-9 14 14 0 0 1 32 9c0 21-32 41-32 41z" /><path d="M14 50h14l7-11 9 20 7-13h13" /></>),
};

export function MuscleGlyph({ name, className = "" }: { name: MuscleGlyphName; className?: string }) {
  return (
    <svg viewBox="0 0 100 92" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {GLYPHS[name]}
    </svg>
  );
}
