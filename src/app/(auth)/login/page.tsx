"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dumbbell, Mail, Lock } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Logo */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: "40px",
                }}
            >
                <div
                    className="gradient-purple glow-purple"
                    style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "20px",
                    }}
                >
                    <Dumbbell style={{ width: "32px", height: "32px", color: "white" }} />
                </div>
                <h1
                    className="gradient-text"
                    style={{ fontSize: "28px", fontWeight: 700 }}
                >
                    Welcome Back
                </h1>
                <p
                    style={{
                        fontSize: "14px",
                        marginTop: "8px",
                        color: "var(--text-muted)",
                    }}
                >
                    Sign in to continue your fitness journey
                </p>
            </div>

            <Card>
                <form
                    onSubmit={handleSubmit}
                    style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                >
                    {error && (
                        <div
                            style={{
                                fontSize: "14px",
                                textAlign: "center",
                                padding: "12px 16px",
                                borderRadius: "12px",
                                background: "rgba(239, 68, 68, 0.1)",
                                color: "var(--error)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <Input
                        id="email"
                        type="email"
                        label="Email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={<Mail style={{ width: "16px", height: "16px" }} />}
                        required
                    />

                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={<Lock style={{ width: "16px", height: "16px" }} />}
                        required
                    />

                    <div style={{ paddingTop: "8px" }}>
                        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                            Sign In
                        </Button>
                    </div>
                </form>

                <p
                    style={{
                        fontSize: "14px",
                        textAlign: "center",
                        marginTop: "32px",
                        color: "var(--text-muted)",
                    }}
                >
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        style={{
                            fontWeight: 600,
                            color: "var(--purple-light)",
                            textDecoration: "none",
                        }}
                    >
                        Sign Up
                    </Link>
                </p>
            </Card>
        </div>
    );
}
