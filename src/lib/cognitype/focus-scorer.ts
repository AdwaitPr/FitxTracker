/**
 * CogniType Focus Stability Score Engine
 * Computes a 0-100 score normalized against personal baselines
 */

import type { SessionFeatureVector } from "./metrics-calculator";

export interface Baseline {
    metric: string;
    baselineValue: number;
    stdDev: number;
}

export interface FocusBreakdown {
    attentionStability: number; // 0-1
    switchingPenalty: number;   // 0-1
    rhythmConsistency: number;  // 0-1
    fatigueResistance: number;  // 0-1
    totalScore: number;         // 0-100
}

const WEIGHTS = {
    attentionStability: 0.35,
    switchingPenalty: 0.25,
    rhythmConsistency: 0.25,
    fatigueResistance: 0.15,
};

/**
 * Compute Focus Stability Score (0-100)
 * Uses personal baselines when available, falls back to defaults
 */
export function computeFocusScore(
    metrics: SessionFeatureVector,
    baselines: Baseline[]
): FocusBreakdown {
    const getBaseline = (metric: string, fallback: number): number => {
        const b = baselines.find((bl) => bl.metric === metric);
        return b ? b.baselineValue : fallback;
    };

    const getBaselineStd = (metric: string, fallback: number): number => {
        const b = baselines.find((bl) => bl.metric === metric);
        return b && b.stdDev > 0 ? b.stdDev : fallback;
    };

    // 1. Attention Stability (35%)
    // High switch time ratio and idle time = low stability
    const idleRatio = Math.min(metrics.switchTimeRatio * 1.5, 1); // amplify
    const attentionStability = Math.max(0, 1 - (metrics.switchTimeRatio + idleRatio) / 2);

    // 2. Switching Penalty (25%)
    // More switches = worse score; cap at 10 switches
    const switchingPenalty = Math.max(0, 1 - Math.min(metrics.switchCount / 10, 1));

    // 3. Rhythm Consistency (25%)
    // Compare current std dev to baseline std dev
    const baselineStd = getBaselineStd("latencyStdDev", 80);
    const rhythmConsistency = Math.max(
        0,
        1 - Math.min(metrics.latencyStdDev / (baselineStd * 3), 1)
    );

    // 4. Fatigue Resistance (15%)
    // Positive fatigue slope = bad (slowing down)
    // Threshold: slope > 20ms per quarter = significant fatigue
    const fatigueThreshold = getBaseline("fatigueSlope", 20);
    const fatigueResistance = Math.max(
        0,
        1 - Math.min(Math.abs(metrics.fatigueSlope) / (fatigueThreshold * 2), 1)
    );

    // Weighted composite
    const rawScore =
        WEIGHTS.attentionStability * attentionStability +
        WEIGHTS.switchingPenalty * switchingPenalty +
        WEIGHTS.rhythmConsistency * rhythmConsistency +
        WEIGHTS.fatigueResistance * fatigueResistance;

    const totalScore = Math.round(Math.max(0, Math.min(100, rawScore * 100)));

    return {
        attentionStability,
        switchingPenalty,
        rhythmConsistency,
        fatigueResistance,
        totalScore,
    };
}

/**
 * Get score color for UI
 */
export function getFocusScoreColor(score: number): string {
    if (score >= 85) return "#10b981"; // green
    if (score >= 70) return "#22d3ee"; // cyan
    if (score >= 50) return "#f59e0b"; // yellow
    if (score >= 30) return "#f97316"; // orange
    return "#ef4444"; // red
}

/**
 * Get score label
 */
export function getFocusScoreLabel(score: number): string {
    if (score >= 85) return "Exceptional";
    if (score >= 70) return "Strong";
    if (score >= 50) return "Moderate";
    if (score >= 30) return "Low";
    return "Very Low";
}
