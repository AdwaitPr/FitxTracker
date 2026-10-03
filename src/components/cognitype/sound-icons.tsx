import {
    VolumeX,
    Waves,
    Volume2,
    Music,
    Sun,
    Sunset,
    Moon,
} from "lucide-react";
import type { TagTone } from "@/components/ui/tag";

export function getSoundIcon(sound: string | null | undefined, className = "h-4 w-4") {
    switch (sound) {
        case "brown_noise":
        case "Brown noise":
        case "pink_noise":
        case "Pink noise":
            return <Waves className={className} />;
        case "ambient":
        case "Ambient":
            return <Volume2 className={className} />;
        case "rhythmic":
        case "Rhythmic":
            return <Music className={className} />;
        case "silence":
        case "Silence":
        default:
            return <VolumeX className={className} />;
    }
}

export function formatSoundLabel(sound: string | null | undefined): string {
    switch (sound) {
        case "brown_noise":
            return "Brown Noise";
        case "pink_noise":
            return "Pink Noise";
        case "ambient":
            return "Ambient";
        case "rhythmic":
            return "Rhythmic";
        case "silence":
            return "Silence";
        default:
            return sound || "Silence";
    }
}

export function getTimeOfDayIcon(timeOfDay: string | null | undefined, className = "h-4 w-4") {
    switch (timeOfDay?.toLowerCase()) {
        case "morning":
        case "afternoon":
            return <Sun className={className} />;
        case "evening":
            return <Sunset className={className} />;
        case "night":
        default:
            return <Moon className={className} />;
    }
}

export function formatTimeOfDayLabel(timeOfDay: string | null | undefined): string {
    if (!timeOfDay) return "Morning";
    return timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1).toLowerCase();
}

export function getDifficultyTone(difficulty: number): TagTone {
    switch (difficulty) {
        case 1:
            return "green";
        case 2:
            return "amber";
        case 3:
            return "pink";
        default:
            return "violet";
    }
}

export function getDifficultyLabel(difficulty: number): string {
    switch (difficulty) {
        case 1:
            return "Simple";
        case 2:
            return "Moderate";
        case 3:
            return "Complex";
        default:
            return "Level " + difficulty;
    }
}

export function getScoreColor(score: number): string {
    if (score >= 80) return "var(--tag-green-fg)";
    if (score >= 60) return "var(--primary)";
    if (score >= 40) return "var(--tag-amber-fg)";
    return "var(--danger)";
}

export function getScoreAssessment(score: number): string {
    if (score >= 80) return "Locked in.";
    if (score >= 60) return "Steady focus.";
    if (score >= 40) return "Fragmented focus.";
    return "Scattered session.";
}
