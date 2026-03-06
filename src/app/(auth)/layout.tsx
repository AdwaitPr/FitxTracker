export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: "var(--bg-dark)" }}
        >
            {/* Background glow effect */}
            <div
                className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-[120px] pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, var(--purple-primary), transparent 70%)",
                }}
            />
            <div className="relative z-10 w-full max-w-md">{children}</div>
        </div>
    );
}
