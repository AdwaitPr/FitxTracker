import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-dark)" }}>
            <style>{`
                @media (min-width: 1024px) {
                    .dashboard-main { margin-left: 256px; }
                }
            `}</style>
            <Sidebar />
            <main className="dashboard-main" style={{ minHeight: "100vh", paddingBottom: "96px" }}>
                <div
                    style={{
                        maxWidth: "1152px",
                        marginLeft: "auto",
                        marginRight: "auto",
                        padding: "24px 16px",
                    }}
                >
                    {children}
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
