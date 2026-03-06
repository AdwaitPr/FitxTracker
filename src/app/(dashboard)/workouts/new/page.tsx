"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dumbbell,
    Plus,
    Trash2,
    Search,
    X,
    ChevronDown,
    ChevronUp,
    Save,
    ArrowLeft,
} from "lucide-react";

interface Exercise {
    id: string;
    name: string;
    muscleGroup: string;
    equipment: string | null;
}

interface SetData {
    reps: number;
    weight: number;
    restTime?: number;
    perceivedDifficulty?: number;
    variationType?: string;
    tempo?: string;
    addedWeight?: number;
}

interface WorkoutExercise {
    exercise: Exercise;
    sets: SetData[];
    notes: string;
    collapsed: boolean;
}

const muscleGroups = [
    "All",
    "Arms",
    "Back",
    "Cardio",
    "Chest",
    "Core",
    "Legs",
    "Shoulders",
];

export default function NewWorkoutPage() {
    const router = useRouter();
    const [workoutName, setWorkoutName] = useState("");
    const [workoutNotes, setWorkoutNotes] = useState("");
    const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
        []
    );
    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("All");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchExercises = useCallback(async () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (selectedMuscleGroup !== "All")
            params.set("muscleGroup", selectedMuscleGroup);
        const res = await fetch(`/api/exercises?${params.toString()}`);
        if (res.ok) {
            const data = await res.json();
            setExercises(data);
        }
    }, [searchQuery, selectedMuscleGroup]);

    useEffect(() => {
        fetchExercises();
    }, [fetchExercises]);

    const addExercise = (exercise: Exercise) => {
        if (workoutExercises.some((we) => we.exercise.id === exercise.id)) return;
        setWorkoutExercises((prev) => [
            ...prev,
            {
                exercise,
                sets: [{ reps: 10, weight: 0 }],
                notes: "",
                collapsed: false,
            },
        ]);
        setShowExercisePicker(false);
        setSearchQuery("");
    };

    const removeExercise = (index: number) => {
        setWorkoutExercises((prev) => prev.filter((_, i) => i !== index));
    };

    const addSet = (exIndex: number) => {
        setWorkoutExercises((prev) => {
            const updated = [...prev];
            const lastSet =
                updated[exIndex].sets[updated[exIndex].sets.length - 1] || {
                    reps: 10,
                    weight: 0,
                };
            updated[exIndex].sets.push({ ...lastSet });
            return updated;
        });
    };

    const removeSet = (exIndex: number, setIndex: number) => {
        setWorkoutExercises((prev) => {
            const updated = [...prev];
            if (updated[exIndex].sets.length > 1) {
                updated[exIndex].sets = updated[exIndex].sets.filter(
                    (_, i) => i !== setIndex
                );
            }
            return updated;
        });
    };

    const updateSet = (
        exIndex: number,
        setIndex: number,
        field: keyof SetData,
        value: number | string
    ) => {
        setWorkoutExercises((prev) => {
            const updated = [...prev];
            const sets = [...updated[exIndex].sets];
            sets[setIndex] = { ...sets[setIndex], [field]: value };
            updated[exIndex] = { ...updated[exIndex], sets };
            return updated;
        });
    };

    const toggleCollapse = (index: number) => {
        setWorkoutExercises((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                collapsed: !updated[index].collapsed,
            };
            return updated;
        });
    };

    const saveWorkout = async () => {
        if (!workoutName.trim()) {
            setError("Give your workout a name");
            return;
        }
        if (workoutExercises.length === 0) {
            setError("Add at least one exercise");
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            const res = await fetch("/api/workouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: workoutName,
                    notes: workoutNotes || undefined,
                    exercises: workoutExercises.map((we) => ({
                        exerciseId: we.exercise.id,
                        notes: we.notes || undefined,
                        sets: we.sets.map((s) => ({
                            reps: s.reps,
                            weight: s.weight,
                            restTime: s.restTime || undefined,
                            perceivedDifficulty: s.perceivedDifficulty || undefined,
                            variationType: s.variationType || undefined,
                            tempo: s.tempo || undefined,
                            addedWeight: s.addedWeight || undefined,
                        })),
                    })),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save");
            }

            const workout = await res.json();
            router.push(`/workouts/${workout.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save workout");
        } finally {
            setIsSaving(false);
        }
    };

    // Inline style constants
    const cardBg = "var(--bg-card)";
    const borderColor = "var(--border)";
    const textMuted = "#8B8B9E";
    const textPrimary = "#F1F1F6";
    const purple = "#7c3aed";
    const purpleLight = "#a78bfa";

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "32px",
                }}
            >
                <button
                    onClick={() => router.back()}
                    style={{
                        padding: "8px",
                        borderRadius: "10px",
                        border: `1px solid ${borderColor}`,
                        background: cardBg,
                        color: textMuted,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <ArrowLeft style={{ width: "20px", height: "20px" }} />
                </button>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, color: textPrimary }}>
                        <span className="gradient-text">New Workout</span>
                    </h1>
                </div>
                <Button onClick={saveWorkout} isLoading={isSaving} size="md">
                    <Save style={{ width: "16px", height: "16px" }} />
                    Save
                </Button>
            </div>

            {error && (
                <div
                    style={{
                        padding: "12px 16px",
                        borderRadius: "10px",
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#ef4444",
                        fontSize: "14px",
                        marginBottom: "20px",
                    }}
                >
                    {error}
                </div>
            )}

            {/* Workout Details */}
            <Card style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <Input
                        label="Workout Name"
                        placeholder="e.g. Push Day, Upper Body, Leg Day"
                        icon={<Dumbbell style={{ width: "18px", height: "18px" }} />}
                        value={workoutName}
                        onChange={(e) => setWorkoutName(e.target.value)}
                    />
                    <div>
                        <label
                            style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: textMuted,
                                display: "block",
                                marginBottom: "8px",
                            }}
                        >
                            Notes (optional)
                        </label>
                        <textarea
                            placeholder="How are you feeling today?"
                            value={workoutNotes}
                            onChange={(e) => setWorkoutNotes(e.target.value)}
                            rows={2}
                            style={{
                                width: "100%",
                                borderRadius: "12px",
                                padding: "12px 16px",
                                fontSize: "14px",
                                outline: "none",
                                background: "var(--bg-input)",
                                color: textPrimary,
                                border: `1px solid ${borderColor}`,
                                resize: "vertical",
                                fontFamily: "inherit",
                            }}
                        />
                    </div>
                </div>
            </Card>

            {/* Exercises */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {workoutExercises.map((we, exIndex) => (
                    <Card key={we.exercise.id}>
                        {/* Exercise Header */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: we.collapsed ? 0 : "16px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    flex: 1,
                                    cursor: "pointer",
                                }}
                                onClick={() => toggleCollapse(exIndex)}
                            >
                                <div
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: `${purple}20`,
                                        flexShrink: 0,
                                    }}
                                >
                                    <Dumbbell
                                        style={{
                                            width: "18px",
                                            height: "18px",
                                            color: purpleLight,
                                        }}
                                    />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <p
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "14px",
                                            color: textPrimary,
                                        }}
                                    >
                                        {we.exercise.name}
                                    </p>
                                    <p style={{ fontSize: "12px", color: textMuted }}>
                                        {we.exercise.muscleGroup}
                                        {we.exercise.equipment
                                            ? ` · ${we.exercise.equipment}`
                                            : ""}{" "}
                                        · {we.sets.length} set{we.sets.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                                <button
                                    onClick={() => toggleCollapse(exIndex)}
                                    style={{
                                        padding: "6px",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: "transparent",
                                        color: textMuted,
                                        cursor: "pointer",
                                    }}
                                >
                                    {we.collapsed ? (
                                        <ChevronDown style={{ width: "18px", height: "18px" }} />
                                    ) : (
                                        <ChevronUp style={{ width: "18px", height: "18px" }} />
                                    )}
                                </button>
                                <button
                                    onClick={() => removeExercise(exIndex)}
                                    style={{
                                        padding: "6px",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: "transparent",
                                        color: "#ef4444",
                                        cursor: "pointer",
                                    }}
                                >
                                    <Trash2 style={{ width: "18px", height: "18px" }} />
                                </button>
                            </div>
                        </div>

                        {/* Sets Table */}
                        {!we.collapsed && (
                            <div>
                                {/* Header Row */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "40px 1fr 1fr 80px 60px",
                                        gap: "8px",
                                        padding: "8px 0",
                                        borderBottom: `1px solid ${borderColor}`,
                                        marginBottom: "8px",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            color: textMuted,
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        SET
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            color: textMuted,
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        WEIGHT (kg)
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            color: textMuted,
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        REPS
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            color: textMuted,
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        RPE
                                    </span>
                                    <span></span>
                                </div>

                                {/* Set Rows */}
                                {we.sets.map((set, setIndex) => (
                                    <div
                                        key={setIndex}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "40px 1fr 1fr 80px 60px",
                                            gap: "8px",
                                            alignItems: "center",
                                            padding: "6px 0",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "14px",
                                                fontWeight: 600,
                                                color: purpleLight,
                                                textAlign: "center",
                                            }}
                                        >
                                            {setIndex + 1}
                                        </span>
                                        <input
                                            type="number"
                                            value={set.weight || ""}
                                            onChange={(e) =>
                                                updateSet(
                                                    exIndex,
                                                    setIndex,
                                                    "weight",
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                            placeholder="0"
                                            style={{
                                                width: "100%",
                                                padding: "8px 12px",
                                                borderRadius: "8px",
                                                border: `1px solid ${borderColor}`,
                                                background: "var(--bg-input)",
                                                color: textPrimary,
                                                fontSize: "14px",
                                                outline: "none",
                                                textAlign: "center",
                                            }}
                                        />
                                        <input
                                            type="number"
                                            value={set.reps || ""}
                                            onChange={(e) =>
                                                updateSet(
                                                    exIndex,
                                                    setIndex,
                                                    "reps",
                                                    parseInt(e.target.value) || 0
                                                )
                                            }
                                            placeholder="0"
                                            style={{
                                                width: "100%",
                                                padding: "8px 12px",
                                                borderRadius: "8px",
                                                border: `1px solid ${borderColor}`,
                                                background: "var(--bg-input)",
                                                color: textPrimary,
                                                fontSize: "14px",
                                                outline: "none",
                                                textAlign: "center",
                                            }}
                                        />
                                        <select
                                            value={set.perceivedDifficulty || ""}
                                            onChange={(e) =>
                                                updateSet(
                                                    exIndex,
                                                    setIndex,
                                                    "perceivedDifficulty",
                                                    parseInt(e.target.value) || 0
                                                )
                                            }
                                            style={{
                                                width: "100%",
                                                padding: "8px 4px",
                                                borderRadius: "8px",
                                                border: `1px solid ${borderColor}`,
                                                background: "var(--bg-input)",
                                                color: textPrimary,
                                                fontSize: "13px",
                                                outline: "none",
                                                textAlign: "center",
                                            }}
                                        >
                                            <option value="">—</option>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                                <option key={n} value={n}>
                                                    {n}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => removeSet(exIndex, setIndex)}
                                            disabled={we.sets.length <= 1}
                                            style={{
                                                padding: "6px",
                                                borderRadius: "8px",
                                                border: "none",
                                                background: "transparent",
                                                color:
                                                    we.sets.length <= 1
                                                        ? `${textMuted}50`
                                                        : "rgba(239,68,68,0.7)",
                                                cursor:
                                                    we.sets.length <= 1 ? "not-allowed" : "pointer",
                                                display: "flex",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <X style={{ width: "16px", height: "16px" }} />
                                        </button>
                                    </div>
                                ))}

                                {/* Add Set Button */}
                                <button
                                    onClick={() => addSet(exIndex)}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        marginTop: "8px",
                                        borderRadius: "10px",
                                        border: `1px dashed ${borderColor}`,
                                        background: "transparent",
                                        color: purpleLight,
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "6px",
                                    }}
                                >
                                    <Plus style={{ width: "14px", height: "14px" }} />
                                    Add Set
                                </button>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Add Exercise Button */}
            <button
                onClick={() => setShowExercisePicker(true)}
                style={{
                    width: "100%",
                    padding: "16px",
                    marginTop: "16px",
                    borderRadius: "14px",
                    border: `2px dashed ${borderColor}`,
                    background: "transparent",
                    color: purpleLight,
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                }}
            >
                <Plus style={{ width: "20px", height: "20px" }} />
                Add Exercise
            </button>

            {/* Exercise Picker Modal */}
            {showExercisePicker && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 50,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(4px)",
                    }}
                    onClick={() => setShowExercisePicker(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "100%",
                            maxWidth: "600px",
                            maxHeight: "80vh",
                            borderRadius: "20px 20px 0 0",
                            background: "var(--bg-dark)",
                            border: `1px solid ${borderColor}`,
                            borderBottom: "none",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                padding: "20px 20px 16px",
                                borderBottom: `1px solid ${borderColor}`,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "16px",
                                }}
                            >
                                <h2
                                    style={{
                                        fontSize: "18px",
                                        fontWeight: 700,
                                        color: textPrimary,
                                    }}
                                >
                                    Pick Exercise
                                </h2>
                                <button
                                    onClick={() => setShowExercisePicker(false)}
                                    style={{
                                        padding: "6px",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: `${borderColor}`,
                                        color: textMuted,
                                        cursor: "pointer",
                                    }}
                                >
                                    <X style={{ width: "18px", height: "18px" }} />
                                </button>
                            </div>

                            <Input
                                placeholder="Search exercises..."
                                icon={<Search style={{ width: "18px", height: "18px" }} />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            {/* Muscle Group Tabs */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: "6px",
                                    marginTop: "12px",
                                    overflowX: "auto",
                                    paddingBottom: "4px",
                                }}
                            >
                                {muscleGroups.map((mg) => (
                                    <button
                                        key={mg}
                                        onClick={() => setSelectedMuscleGroup(mg)}
                                        style={{
                                            padding: "6px 14px",
                                            borderRadius: "9999px",
                                            border:
                                                selectedMuscleGroup === mg
                                                    ? "none"
                                                    : `1px solid ${borderColor}`,
                                            background:
                                                selectedMuscleGroup === mg
                                                    ? `linear-gradient(135deg, ${purple}, #9333ea)`
                                                    : "transparent",
                                            color:
                                                selectedMuscleGroup === mg ? "#fff" : textMuted,
                                            fontSize: "12px",
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            whiteSpace: "nowrap",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {mg}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Exercise List */}
                        <div
                            style={{
                                overflowY: "auto",
                                padding: "12px 20px 20px",
                                flex: 1,
                            }}
                        >
                            {exercises.length === 0 ? (
                                <p
                                    style={{
                                        textAlign: "center",
                                        padding: "32px 0",
                                        color: textMuted,
                                        fontSize: "14px",
                                    }}
                                >
                                    No exercises found
                                </p>
                            ) : (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "4px",
                                    }}
                                >
                                    {exercises.map((ex) => {
                                        const isAdded = workoutExercises.some(
                                            (we) => we.exercise.id === ex.id
                                        );
                                        return (
                                            <button
                                                key={ex.id}
                                                onClick={() => !isAdded && addExercise(ex)}
                                                disabled={isAdded}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    gap: "12px",
                                                    padding: "12px 14px",
                                                    borderRadius: "10px",
                                                    border: "none",
                                                    background: isAdded
                                                        ? `${purple}15`
                                                        : "transparent",
                                                    color: textPrimary,
                                                    cursor: isAdded ? "default" : "pointer",
                                                    opacity: isAdded ? 0.5 : 1,
                                                    textAlign: "left",
                                                    width: "100%",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                <div>
                                                    <p style={{ fontWeight: 500 }}>{ex.name}</p>
                                                    <p
                                                        style={{
                                                            fontSize: "12px",
                                                            color: textMuted,
                                                            marginTop: "2px",
                                                        }}
                                                    >
                                                        {ex.muscleGroup}
                                                        {ex.equipment ? ` · ${ex.equipment}` : ""}
                                                    </p>
                                                </div>
                                                {isAdded ? (
                                                    <span
                                                        style={{
                                                            fontSize: "11px",
                                                            color: purpleLight,
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        Added
                                                    </span>
                                                ) : (
                                                    <Plus
                                                        style={{
                                                            width: "18px",
                                                            height: "18px",
                                                            color: textMuted,
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
