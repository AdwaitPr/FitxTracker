"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    User,
    Save,
    Check,
    Ruler,
    Weight,
    Calendar,
    Target,
} from "lucide-react";

interface Profile {
    id: string;
    name: string | null;
    email: string;
    height: number | null;
    weight: number | null;
    age: number | null;
    gender: string | null;
    fitnessGoal: string | null;
    createdAt: string;
}

const textPrimary = "#F1F1F6";
const textMuted = "#8B8B9E";
const purple = "#7c3aed";
const purpleLight = "#a78bfa";
const borderColor = "var(--border)";

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
const goalOptions = [
    "Lose Weight",
    "Build Muscle",
    "Gain Weight",
    "Stay Fit",
    "Improve Endurance",
    "Increase Strength",
];

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [name, setName] = useState("");
    const [height, setHeight] = useState<number | "">("");
    const [weight, setWeight] = useState<number | "">("");
    const [age, setAge] = useState<number | "">("");
    const [gender, setGender] = useState("");
    const [fitnessGoal, setFitnessGoal] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch("/api/profile");
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setProfile(data);
                    setName(data.name || "");
                    setHeight(data.height || "");
                    setWeight(data.weight || "");
                    setAge(data.age || "");
                    setGender(data.gender || "");
                    setFitnessGoal(data.fitnessGoal || "");
                }
            }
        } catch (err) {
            console.error("Failed to fetch profile:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaved(false);
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name || undefined,
                    height: height !== "" ? Number(height) : undefined,
                    weight: weight !== "" ? Number(weight) : undefined,
                    age: age !== "" ? Number(age) : undefined,
                    gender: gender || undefined,
                    fitnessGoal: fitnessGoal || undefined,
                }),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (err) {
            console.error("Failed to save profile:", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in">
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "32px" }}>
                    <span className="gradient-text">Profile</span>
                </h1>
                <Card>
                    <p style={{ textAlign: "center", padding: "48px 0", color: textMuted }}>
                        Loading...
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "32px",
                }}
            >
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: textPrimary }}>
                    <span className="gradient-text">Profile</span>
                </h1>
                <Button onClick={handleSave} isLoading={isSaving} size="md">
                    {saved ? (
                        <>
                            <Check style={{ width: "16px", height: "16px" }} /> Saved!
                        </>
                    ) : (
                        <>
                            <Save style={{ width: "16px", height: "16px" }} /> Save
                        </>
                    )}
                </Button>
            </div>

            {/* Account Info */}
            <Card style={{ marginBottom: "20px" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        marginBottom: "20px",
                    }}
                >
                    <div
                        style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: `linear-gradient(135deg, ${purple}, #9333ea)`,
                            flexShrink: 0,
                        }}
                    >
                        <User style={{ width: "24px", height: "24px", color: "#fff" }} />
                    </div>
                    <div>
                        <p style={{ fontWeight: 600, fontSize: "16px", color: textPrimary }}>
                            {profile?.name || "Unnamed Athlete"}
                        </p>
                        <p style={{ fontSize: "13px", color: textMuted }}>{profile?.email}</p>
                        <p style={{ fontSize: "11px", color: textMuted, marginTop: "2px" }}>
                            Member since{" "}
                            {profile?.createdAt
                                ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    year: "numeric",
                                })
                                : "—"}
                        </p>
                    </div>
                </div>

                <Input
                    label="Full Name"
                    icon={<User style={{ width: "18px", height: "18px" }} />}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                />
            </Card>

            {/* Body Stats */}
            <Card style={{ marginBottom: "20px" }}>
                <h2
                    style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: textPrimary,
                        marginBottom: "16px",
                    }}
                >
                    Body Stats
                </h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                    }}
                >
                    <div>
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: textMuted,
                                marginBottom: "8px",
                            }}
                        >
                            <Ruler style={{ width: "14px", height: "14px" }} /> Height (cm)
                        </label>
                        <input
                            type="number"
                            value={height}
                            onChange={(e) =>
                                setHeight(e.target.value ? parseFloat(e.target.value) : "")
                            }
                            placeholder="170"
                            style={{
                                width: "100%",
                                padding: "10px 14px",
                                borderRadius: "10px",
                                border: `1px solid ${borderColor}`,
                                background: "var(--bg-input)",
                                color: textPrimary,
                                fontSize: "14px",
                                outline: "none",
                            }}
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: textMuted,
                                marginBottom: "8px",
                            }}
                        >
                            <Weight style={{ width: "14px", height: "14px" }} /> Weight (kg)
                        </label>
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) =>
                                setWeight(e.target.value ? parseFloat(e.target.value) : "")
                            }
                            placeholder="66"
                            style={{
                                width: "100%",
                                padding: "10px 14px",
                                borderRadius: "10px",
                                border: `1px solid ${borderColor}`,
                                background: "var(--bg-input)",
                                color: textPrimary,
                                fontSize: "14px",
                                outline: "none",
                            }}
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: textMuted,
                                marginBottom: "8px",
                            }}
                        >
                            <Calendar style={{ width: "14px", height: "14px" }} /> Age
                        </label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) =>
                                setAge(e.target.value ? parseInt(e.target.value) : "")
                            }
                            placeholder="25"
                            style={{
                                width: "100%",
                                padding: "10px 14px",
                                borderRadius: "10px",
                                border: `1px solid ${borderColor}`,
                                background: "var(--bg-input)",
                                color: textPrimary,
                                fontSize: "14px",
                                outline: "none",
                            }}
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: textMuted,
                                marginBottom: "8px",
                            }}
                        >
                            Gender
                        </label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 14px",
                                borderRadius: "10px",
                                border: `1px solid ${borderColor}`,
                                background: "var(--bg-input)",
                                color: textPrimary,
                                fontSize: "14px",
                                outline: "none",
                                appearance: "none",
                            }}
                        >
                            <option value="">Select</option>
                            {genderOptions.map((g) => (
                                <option key={g} value={g}>
                                    {g}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Fitness Goal */}
            <Card>
                <h2
                    style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: textPrimary,
                        marginBottom: "16px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Target style={{ width: "18px", height: "18px", color: purpleLight }} />
                        Fitness Goal
                    </div>
                </h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                        gap: "8px",
                    }}
                >
                    {goalOptions.map((goal) => (
                        <button
                            key={goal}
                            onClick={() => setFitnessGoal(goal)}
                            style={{
                                padding: "12px 14px",
                                borderRadius: "12px",
                                border:
                                    fitnessGoal === goal
                                        ? `2px solid ${purple}`
                                        : `1px solid ${borderColor}`,
                                background:
                                    fitnessGoal === goal ? `${purple}20` : "transparent",
                                color: fitnessGoal === goal ? purpleLight : textMuted,
                                fontSize: "13px",
                                fontWeight: 500,
                                cursor: "pointer",
                                textAlign: "center",
                            }}
                        >
                            {goal}
                        </button>
                    ))}
                </div>
            </Card>
        </div>
    );
}
