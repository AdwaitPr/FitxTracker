import { cn } from "@/lib/utils";
import { Sparkles } from "@/components/auth/sparkles";

export function DashboardMock() {
  const bar = (width: string, color = "bg-hairline") => (
    <span
      className={cn("block h-2 rounded-full", color)}
      style={{ width }}
    />
  );

  return (
    <div
      className="rise mx-auto w-full max-w-4xl overflow-hidden rounded-[24px] bg-frame p-2 shadow-window border border-hairline/60"
      aria-label="Preview of the FitxTracker dashboard"
      role="img"
    >
      <div className="flex overflow-hidden rounded-[18px] bg-canvas">
        {/* Left rail */}
        <div className="hidden w-40 shrink-0 space-y-3 bg-surface p-4 sm:block border-r border-hairline/60">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary" />
            {bar("50%", "bg-ink/70")}
          </div>
          <div className="pt-3 space-y-2.5">
            {[
              ["60%", true],
              ["45%"],
              ["55%"],
              ["50%"],
              ["40%"],
              ["48%"],
            ].map(([w, a], i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-4 w-4 rounded-md shrink-0",
                    a ? "bg-primary-soft" : "bg-hairline"
                  )}
                />
                {bar(w as string, a ? "bg-ink/60" : undefined)}
              </div>
            ))}
          </div>
        </div>

        {/* Center content */}
        <div className="min-w-0 flex-1 space-y-3 p-4">
          <div className="flex items-center gap-2">
            <span className="h-6 flex-1 rounded-full border border-hairline bg-surface" />
            <span className="h-6 w-6 rounded-full border border-hairline bg-surface" />
            <span className="h-6 w-6 rounded-full bg-primary-soft" />
          </div>

          <div className="relative overflow-hidden rounded-[16px] bg-primary p-4">
            <Sparkles />
            <div className="relative space-y-2">
              {bar("20%", "bg-white/50")}
              <span className="block h-3 w-3/5 rounded-full bg-white" />
              <span className="block h-3 w-2/5 rounded-full bg-white" />
              <span className="mt-2 inline-block h-6 w-24 rounded-full bg-[#0F0F14]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {["violet", "cyan", "pink", "amber"].map((t) => (
              <div
                key={t}
                className="flex items-center gap-2 rounded-[12px] bg-surface p-2.5 border border-hairline/40"
              >
                <span
                  className="h-7 w-7 rounded-lg shrink-0"
                  style={{ background: `var(--tag-${t}-bg)` }}
                />
                <span className="flex-1 space-y-1.5">
                  {bar("70%")}
                  {bar("45%", "bg-ink/60")}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-[12px] bg-surface p-2.5 border border-hairline/40"
              >
                <span
                  className={cn(
                    "block h-12 rounded-[8px]",
                    i === 0
                      ? "bg-primary-soft-2"
                      : i === 1
                      ? "bg-tag-cyan-bg"
                      : "bg-tag-pink-bg"
                  )}
                />
                <span className="mt-2 block space-y-1.5">
                  {bar("80%", "bg-ink/60")}
                  {bar("50%")}
                  <span className="block h-1 w-full rounded-full bg-hairline">
                    <span className="block h-1 w-2/3 rounded-full bg-primary" />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right rail */}
        <div className="hidden w-44 shrink-0 space-y-3 border-l border-hairline/60 p-4 lg:block bg-surface/50">
          <div className="rounded-[14px] bg-surface p-3 border border-hairline/40">
            <div
              className="mx-auto h-16 w-16 rounded-full border-4 border-primary-soft"
              style={{
                borderTopColor: "var(--primary)",
                borderRightColor: "var(--primary)",
              }}
            />
            <div className="mt-3 space-y-1.5">
              {bar("70%", "bg-ink/60")}
              {bar("50%")}
            </div>
            <div className="mt-3 flex h-12 items-end gap-1.5">
              {[40, 70, 50, 90, 60].map((h, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex-1 rounded-t-full",
                    i % 2 ? "bg-primary" : "bg-primary-soft-2"
                  )}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[14px] bg-surface p-3 space-y-2 border border-hairline/40">
            {bar("60%", "bg-ink/60")}
            {[80, 60, 45, 70].map((w, i) => (
              <span key={i} className="block h-1.5 rounded-full bg-hairline">
                <span
                  className="block h-1.5 rounded-full bg-primary"
                  style={{ width: `${w}%` }}
                />
              </span>
            ))}
            <span className="block h-6 rounded-full bg-primary-soft" />
          </div>
        </div>
      </div>
    </div>
  );
}
