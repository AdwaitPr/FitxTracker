import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./chrome";
import { match, usePath } from "./router";
import Dashboard from "./pages/Dashboard";
import NewWorkout from "./pages/NewWorkout";
import Progress from "./pages/Progress";
import Recovery from "./pages/Recovery";
import { History, WorkoutDetail } from "./pages/History";
import { CogniAnalytics, CogniSessionDetail, CogniSessions, CogniTest } from "./pages/Cognitype";
import { Exercises, Profile } from "./pages/Account";
import { Landing, Login, Register } from "./pages/Marketing";

function Route({ path }: { path: string }) {
  const p = path.split("?")[0];
  let m: Record<string, string> | null;
  if (p === "/" ) return <Landing />;
  if (p === "/login") return <Login />;
  if (p === "/register") return <Register />;
  if (p === "/dashboard") return <Dashboard />;
  if (p === "/workouts/new") return <NewWorkout />;
  if (p === "/workouts/history") return <History />;
  if ((m = match("/workouts/:id", p))) return <WorkoutDetail key={m.id} id={m.id} />;
  if (p === "/exercises") return <Exercises />;
  if (p === "/recovery") return <Recovery />;
  if (p === "/progress") return <Progress />;
  if (p === "/profile") return <Profile key={path} />;
  if (p === "/cognitype") return <CogniTest />;
  if (p === "/cognitype/sessions") return <CogniSessions />;
  if ((m = match("/cognitype/sessions/:id", p))) return <CogniSessionDetail key={m.id} id={m.id} />;
  if (p === "/cognitype/analytics") return <CogniAnalytics />;
  return <Dashboard />;
}

export default function App() {
  const [dark, setDark] = useState(false);
  const path = usePath();
  const theme = useMemo(() => ({ dark, toggle: () => setDark((d) => !d) }), [dark]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <ThemeContext.Provider value={theme}>
      <Route path={path} />
    </ThemeContext.Provider>
  );
}
