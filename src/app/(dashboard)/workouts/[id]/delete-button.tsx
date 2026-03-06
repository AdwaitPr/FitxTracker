"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export function DeleteWorkoutButton({ workoutId }: { workoutId: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/workouts/${workoutId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                router.push("/workouts/history");
                router.refresh();
            }
        } catch {
            setIsDeleting(false);
        }
    };

    if (showConfirm) {
        return (
            <div style={{ display: "flex", gap: "6px" }}>
                <button
                    onClick={() => setShowConfirm(false)}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "#8B8B9E",
                        fontSize: "12px",
                        cursor: "pointer",
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                        fontSize: "12px",
                        fontWeight: 500,
                        cursor: isDeleting ? "not-allowed" : "pointer",
                        opacity: isDeleting ? 0.5 : 1,
                    }}
                >
                    {isDeleting ? "Deleting..." : "Confirm"}
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            style={{
                padding: "8px",
                borderRadius: "10px",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
            }}
        >
            <Trash2 style={{ width: "18px", height: "18px" }} />
        </button>
    );
}
