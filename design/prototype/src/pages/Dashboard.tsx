import { useState } from "react";
import { Shell } from "../chrome";
import { DevSwitcher, HeroBanner, RecentWorkouts, RecoveryCard, StatChipRow, StatisticCard, WorkoutTable } from "../panels";
import { recoveryStates } from "../data";
import type { RecoveryLevel } from "../data";

export default function Dashboard() {
  const [level, setLevel] = useState<RecoveryLevel>("normal");
  const [favs, setFavs] = useState<Record<string, boolean>>({ w2: true });
  const state = recoveryStates[level];

  return (
    <Shell
      rail={
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
          <StatisticCard level={level} />
          <div id="recovery-card"><RecoveryCard state={state} /></div>
        </div>
      }
    >
      <DevSwitcher level={level} onChange={setLevel} />
      <HeroBanner state={state} />
      <StatChipRow />
      <RecentWorkouts favs={favs} onFav={(id) => setFavs((f) => ({ ...f, [id]: !f[id] }))} />
      <WorkoutTable />
    </Shell>
  );
}
