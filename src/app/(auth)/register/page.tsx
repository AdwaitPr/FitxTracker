"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dumbbell, Mail, Lock, User } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        height: "",
        weight: "",
        age: "",
        gender: "",
        fitnessGoal: "",
    });

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    height: formData.height ? parseFloat(formData.height) : null,
                    weight: formData.weight ? parseFloat(formData.weight) : null,
                    age: formData.age ? parseInt(formData.age) : null,
                    gender: formData.gender || null,
                    fitnessGoal: formData.fitnessGoal || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
                return;
            }

            router.push("/login?registered=true");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const selectStyle: React.CSSProperties = {
        width: "100%",
        borderRadius: "12px",
        padding: "12px 36px 12px 16px",
        fontSize: "14px",
        outline: "none",
        background: "var(--bg-input)",
        color: "var(--text-primary)",
        border: "1px solid var(--border)",
        transition: "border-color 0.2s",
    };

    return (
        <div className="animate-fade-in">
            {/* Logo */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: "32px",
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
                    Create Account
                </h1>
                <p
                    style={{
                        fontSize: "14px",
                        marginTop: "8px",
                        color: "var(--text-muted)",
                    }}
                >
                    Start tracking your fitness journey
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
                        id="name"
                        label="Full Name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        icon={<User style={{ width: "16px", height: "16px" }} />}
                        required
                    />

                    <Input
                        id="email"
                        type="email"
                        label="Email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        icon={<Mail style={{ width: "16px", height: "16px" }} />}
                        required
                    />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            placeholder="Min 6 chars"
                            value={formData.password}
                            onChange={(e) => updateField("password", e.target.value)}
                            icon={<Lock style={{ width: "16px", height: "16px" }} />}
                            required
                        />
                        <Input
                            id="confirmPassword"
                            type="password"
                            label="Confirm Password"
                            placeholder="Re-enter"
                            value={formData.confirmPassword}
                            onChange={(e) => updateField("confirmPassword", e.target.value)}
                            icon={<Lock style={{ width: "16px", height: "16px" }} />}
                            required
                        />
                    </div>

                    {/* Optional Profile Fields */}
                    <div
                        style={{
                            borderTop: "1px solid var(--border)",
                            paddingTop: "20px",
                            marginTop: "4px",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                marginBottom: "16px",
                                letterSpacing: "0.1em",
                                color: "var(--text-muted)",
                            }}
                        >
                            OPTIONAL — FILL THESE LATER
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                            <Input
                                id="height"
                                type="number"
                                label="Height (cm)"
                                placeholder="175"
                                value={formData.height}
                                onChange={(e) => updateField("height", e.target.value)}
                            />
                            <Input
                                id="weight"
                                type="number"
                                label="Weight (kg)"
                                placeholder="75"
                                value={formData.weight}
                                onChange={(e) => updateField("weight", e.target.value)}
                            />
                            <Input
                                id="age"
                                type="number"
                                label="Age"
                                placeholder="25"
                                value={formData.age}
                                onChange={(e) => updateField("age", e.target.value)}
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        color: "var(--text-secondary)",
                                    }}
                                >
                                    Gender
                                </label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => updateField("gender", e.target.value)}
                                    style={selectStyle}
                                >
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        color: "var(--text-secondary)",
                                    }}
                                >
                                    Fitness Goal
                                </label>
                                <select
                                    value={formData.fitnessGoal}
                                    onChange={(e) => updateField("fitnessGoal", e.target.value)}
                                    style={selectStyle}
                                >
                                    <option value="">Select</option>
                                    <option value="lose_weight">Lose Weight</option>
                                    <option value="gain_muscle">Gain Muscle</option>
                                    <option value="maintain">Maintain</option>
                                    <option value="endurance">Improve Endurance</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ paddingTop: "8px" }}>
                        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                            Create Account
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
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        style={{
                            fontWeight: 600,
                            color: "var(--purple-light)",
                            textDecoration: "none",
                        }}
                    >
                        Sign In
                    </Link>
                </p>
            </Card>
        </div>
    );
}
