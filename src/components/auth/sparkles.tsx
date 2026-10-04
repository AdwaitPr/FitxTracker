import { cn } from "@/lib/utils";

export function Sparkles({ className = "" }: { className?: string }) {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      viewBox="0 0 900 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mk-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="640" y="-60" width="260" height="260" rx="52" fill="#fff" fillOpacity=".06" />
      <rect x="760" y="230" width="220" height="220" rx="60" fill="#fff" fillOpacity=".05" />
      <rect x="180" y="60" width="1.4" height="320" fill="url(#mk-v)" />
      <g fill="#C9C3F5">
        <path
          d="M740 60c10 70 37 97 107 107-70 10-97 37-107 107-10-70-37-97-107-107 70-10 97-37 107-107z"
          fillOpacity=".42"
        />
        <path
          d="M600 300c4 28 15 39 43 43-28 4-39 15-43 43-4-28-15-39-43-43 28-4 39-15 43-43z"
          fillOpacity=".3"
        />
        <path
          d="M840 380c3 20 10 27 30 30-20 3-27 10-30 30-3-20-10-27-30-30 20-3 27-10 30-30z"
          fillOpacity=".26"
        />
        <path
          d="M520 90c2 15 8 21 23 23-15 2-21 8-23 23-2-15-8-21-23-23 15-2 21-8 23-23z"
          fillOpacity=".22"
        />
      </g>
    </svg>
  );
}
