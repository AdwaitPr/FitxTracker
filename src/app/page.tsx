import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { Dumbbell, TrendingUp, History, BarChart3 } from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  const features = [
    {
      icon: Dumbbell,
      title: "Log Workouts",
      description: "Record exercises, sets, reps, and weights in seconds.",
    },
    {
      icon: History,
      title: "Track History",
      description: "Browse past sessions and remember your last workout.",
    },
    {
      icon: TrendingUp,
      title: "See Progress",
      description: "Visualize strength gains and body weight over time.",
    },
    {
      icon: BarChart3,
      title: "Personal Records",
      description: "Automatically detect and celebrate your PRs.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-dark)",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 48px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            className="gradient-purple"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Dumbbell style={{ width: "20px", height: "20px", color: "white" }} />
          </div>
          <span
            className="gradient-text"
            style={{ fontSize: "18px", fontWeight: 700 }}
          >
            FitxTracker
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            href="/login"
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: 500,
              borderRadius: "12px",
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="gradient-purple"
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: 600,
              borderRadius: "12px",
              color: "white",
              textDecoration: "none",
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "fixed",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "700px",
            height: "500px",
            borderRadius: "50%",
            opacity: 0.15,
            filter: "blur(140px)",
            pointerEvents: "none",
            background:
              "radial-gradient(circle, var(--purple-primary), var(--cyan-accent), transparent 70%)",
          }}
        />

        <div
          className="animate-slide-up"
          style={{ position: "relative", zIndex: 10, maxWidth: "640px" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 500,
              marginBottom: "32px",
              border: "1px solid rgba(124, 58, 237, 0.25)",
              background: "rgba(124, 58, 237, 0.08)",
              color: "var(--purple-light)",
            }}
          >
            <span
              className="gradient-purple"
              style={{ width: "8px", height: "8px", borderRadius: "50%" }}
            />
            Track · Progress · Repeat
          </div>

          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 60px)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Your Fitness
            <br />
            <span className="gradient-text">Journey Starts Here</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(16px, 2vw, 18px)",
              marginTop: "24px",
              maxWidth: "480px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.7,
              color: "var(--text-muted)",
            }}
          >
            Log workouts, track progressive overload, and visualize your
            strength gains — all in one clean, fast app.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              marginTop: "40px",
            }}
          >
            <Link
              href="/register"
              className="gradient-purple glow-purple"
              style={{
                padding: "14px 32px",
                fontSize: "16px",
                fontWeight: 600,
                borderRadius: "12px",
                color: "white",
                textDecoration: "none",
                transition: "all 0.3s",
              }}
            >
              Start For Free
            </Link>
            <Link
              href="/login"
              style={{
                padding: "14px 32px",
                fontSize: "16px",
                fontWeight: 600,
                borderRadius: "12px",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginTop: "96px",
            marginBottom: "64px",
            maxWidth: "900px",
            width: "100%",
          }}
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center",
                  transition: "all 0.3s",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px auto",
                    background: "rgba(124, 58, 237, 0.12)",
                  }}
                >
                  <Icon
                    style={{
                      width: "24px",
                      height: "24px",
                      color: "var(--purple-light)",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    marginBottom: "6px",
                  }}
                >
                  {feature.title}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    lineHeight: 1.5,
                    color: "var(--text-muted)",
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "32px 0",
          fontSize: "12px",
          borderTop: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        Built with 💪 — FitxTracker &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
