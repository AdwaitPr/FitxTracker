/**
 * CogniType Metrics Calculator
 * Computes 13-feature vectors from raw keystroke and attention events
 */

export interface RawKeystroke {
    timestamp: number; // ms since session start
    key: string;
    isCorrect: boolean;
    isCorrection: boolean;
    position: number;
}

export interface RawAttentionEvent {
    type: "blur" | "focus" | "visibility_hidden" | "visibility_visible" | "idle";
    timestamp: number;
    duration?: number;
}

export interface SessionFeatureVector {
    meanInterKeyLatency: number;
    latencyStdDev: number;
    pauseEntropy: number;
    errorRate: number;
    correctionLatency: number;
    switchCount: number;
    switchTimeRatio: number;
    resumeLatency: number;
    fatigueSlope: number;
}

/**
 * Compute mean inter-key latency (ms)
 */
function computeInterKeyLatencies(keystrokes: RawKeystroke[]): number[] {
    const latencies: number[] = [];
    for (let i = 1; i < keystrokes.length; i++) {
        if (!keystrokes[i].isCorrection && !keystrokes[i - 1].isCorrection) {
            const delta = keystrokes[i].timestamp - keystrokes[i - 1].timestamp;
            // Filter out pauses > 5s (likely intentional breaks, not typing rhythm)
            if (delta > 0 && delta < 5000) {
                latencies.push(delta);
            }
        }
    }
    return latencies;
}

function mean(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    const variance = arr.reduce((acc, v) => acc + (v - m) ** 2, 0) / (arr.length - 1);
    return Math.sqrt(variance);
}

/**
 * Shannon entropy of pause distribution
 * Quantifies how "predictable" the typing rhythm is
 */
function computePauseEntropy(latencies: number[]): number {
    if (latencies.length < 2) return 0;

    // Bin latencies into 10 buckets
    const bins = 10;
    const max = Math.max(...latencies);
    const min = Math.min(...latencies);
    const range = max - min || 1;
    const counts = new Array(bins).fill(0);

    for (const l of latencies) {
        const bin = Math.min(Math.floor(((l - min) / range) * bins), bins - 1);
        counts[bin]++;
    }

    // Convert to probabilities and compute entropy
    const total = latencies.length;
    let entropy = 0;
    for (const count of counts) {
        if (count > 0) {
            const p = count / total;
            entropy -= p * Math.log2(p);
        }
    }

    // Normalize to [0, 1] by dividing by max entropy (log2(bins))
    return entropy / Math.log2(bins);
}

/**
 * Error rate: errors / total keystrokes
 */
function computeErrorRate(keystrokes: RawKeystroke[]): number {
    if (keystrokes.length === 0) return 0;
    const errors = keystrokes.filter((k) => !k.isCorrect && !k.isCorrection).length;
    const total = keystrokes.filter((k) => !k.isCorrection).length;
    return total > 0 ? errors / total : 0;
}

/**
 * Average time from error to correction (backspace)
 */
function computeCorrectionLatency(keystrokes: RawKeystroke[]): number {
    const latencies: number[] = [];
    for (let i = 1; i < keystrokes.length; i++) {
        if (keystrokes[i].isCorrection) {
            // Find the preceding incorrect keystroke
            for (let j = i - 1; j >= 0; j--) {
                if (!keystrokes[j].isCorrect && !keystrokes[j].isCorrection) {
                    latencies.push(keystrokes[i].timestamp - keystrokes[j].timestamp);
                    break;
                }
            }
        }
    }
    return mean(latencies);
}

/**
 * Count context switches (blur + visibility_hidden)
 */
function computeSwitchCount(events: RawAttentionEvent[]): number {
    return events.filter(
        (e) => e.type === "blur" || e.type === "visibility_hidden"
    ).length;
}

/**
 * Ratio of time spent away from the typing tab
 */
function computeSwitchTimeRatio(
    events: RawAttentionEvent[],
    totalDurationMs: number
): number {
    if (totalDurationMs <= 0) return 0;

    let awayTime = 0;
    for (const event of events) {
        if (
            (event.type === "blur" || event.type === "visibility_hidden") &&
            event.duration
        ) {
            awayTime += event.duration;
        }
    }
    return Math.min(awayTime / totalDurationMs, 1);
}

/**
 * Average time from refocus to first keystroke
 */
function computeResumeLatency(
    attentionEvents: RawAttentionEvent[],
    keystrokes: RawKeystroke[]
): number {
    const resumeLatencies: number[] = [];

    const focusEvents = attentionEvents.filter(
        (e) => e.type === "focus" || e.type === "visibility_visible"
    );

    for (const focusEvent of focusEvents) {
        // Find the first keystroke after this focus event
        const nextKey = keystrokes.find(
            (k) => k.timestamp > focusEvent.timestamp && !k.isCorrection
        );
        if (nextKey) {
            const delta = nextKey.timestamp - focusEvent.timestamp;
            if (delta > 0 && delta < 30000) {
                // < 30s
                resumeLatencies.push(delta);
            }
        }
    }

    return mean(resumeLatencies);
}

/**
 * Fatigue slope: linear regression of inter-key latency over session quarters
 * Positive slope = slowing down (fatigue)
 * Negative slope = speeding up (warmup)
 */
function computeFatigueSlope(keystrokes: RawKeystroke[]): number {
    if (keystrokes.length < 8) return 0;

    const latencies = computeInterKeyLatencies(keystrokes);
    if (latencies.length < 4) return 0;

    // Split into 4 quarters
    const quarterSize = Math.floor(latencies.length / 4);
    const quarterMeans: number[] = [];

    for (let q = 0; q < 4; q++) {
        const start = q * quarterSize;
        const end = q === 3 ? latencies.length : (q + 1) * quarterSize;
        quarterMeans.push(mean(latencies.slice(start, end)));
    }

    // Simple linear regression: slope = Σ(xi - x̄)(yi - ȳ) / Σ(xi - x̄)²
    const xs = [0, 1, 2, 3];
    const xMean = 1.5;
    const yMean = mean(quarterMeans);

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < 4; i++) {
        numerator += (xs[i] - xMean) * (quarterMeans[i] - yMean);
        denominator += (xs[i] - xMean) ** 2;
    }

    return denominator > 0 ? numerator / denominator : 0;
}

/**
 * Main: compute all session metrics from raw events
 */
export function computeSessionMetrics(
    keystrokes: RawKeystroke[],
    attentionEvents: RawAttentionEvent[],
    totalDurationMs: number
): SessionFeatureVector {
    const latencies = computeInterKeyLatencies(keystrokes);

    return {
        meanInterKeyLatency: mean(latencies),
        latencyStdDev: stdDev(latencies),
        pauseEntropy: computePauseEntropy(latencies),
        errorRate: computeErrorRate(keystrokes),
        correctionLatency: computeCorrectionLatency(keystrokes),
        switchCount: computeSwitchCount(attentionEvents),
        switchTimeRatio: computeSwitchTimeRatio(attentionEvents, totalDurationMs),
        resumeLatency: computeResumeLatency(attentionEvents, keystrokes),
        fatigueSlope: computeFatigueSlope(keystrokes),
    };
}
