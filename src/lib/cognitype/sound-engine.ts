/**
 * CogniType Sound Engine
 * Procedural ambient sound generation via Web Audio API
 */

export type SoundMode = "brown_noise" | "pink_noise" | "ambient" | "rhythmic" | "silence";

export const SOUND_MODES: { id: SoundMode; label: string; description: string; emoji: string }[] = [
    { id: "silence", label: "Silence", description: "No audio (control)", emoji: "🔇" },
    { id: "brown_noise", label: "Brown Noise", description: "Deep, warm rumble", emoji: "🟤" },
    { id: "pink_noise", label: "Pink Noise", description: "Balanced hiss", emoji: "🩷" },
    { id: "ambient", label: "Ambient", description: "Peaceful tones", emoji: "🎵" },
    { id: "rhythmic", label: "Rhythmic", description: "Gentle pulse", emoji: "🥁" },
];

let audioContext: AudioContext | null = null;
let currentNodes: AudioNode[] = [];
let currentMode: SoundMode = "silence";
let masterGain: GainNode | null = null;

function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    return audioContext;
}

function cleanup() {
    for (const node of currentNodes) {
        try {
            node.disconnect();
        } catch {
            // Already disconnected
        }
    }
    currentNodes = [];
}

/**
 * Brown noise: low-pass filtered white noise
 */
function createBrownNoise(ctx: AudioContext, gain: GainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Boost amplitude
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start();
    currentNodes.push(source);
}

/**
 * Pink noise: 1/f spectral density (Voss-McCartney algorithm)
 */
function createPinkNoise(ctx: AudioContext, gain: GainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start();
    currentNodes.push(source);
}

/**
 * Ambient: gentle sine wave pads with slow LFO modulation
 */
function createAmbient(ctx: AudioContext, gain: GainNode) {
    const frequencies = [220, 277.18, 329.63, 440]; // A minor chord

    for (const freq of frequencies) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;

        // LFO modulation for gentle movement
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.1 + Math.random() * 0.15; // Slow wobble
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 3; // Slight pitch modulation
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        const padGain = ctx.createGain();
        padGain.gain.value = 0.05; // Very quiet
        osc.connect(padGain);
        padGain.connect(gain);
        osc.start();

        currentNodes.push(osc, lfo, lfoGain, padGain);
    }
}

/**
 * Rhythmic: subtle pulse at ~60 BPM
 */
function createRhythmic(ctx: AudioContext, gain: GainNode) {
    const bpm = 60;
    const interval = 60 / bpm;
    const bufferDuration = 4; // 4 seconds buffer (4 beats)
    const bufferSize = Math.ceil(ctx.sampleRate * bufferDuration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let beat = 0; beat < 4; beat++) {
        const beatStart = Math.floor(beat * interval * ctx.sampleRate);
        const decayLength = Math.floor(0.1 * ctx.sampleRate); // 100ms decay

        for (let i = 0; i < decayLength && beatStart + i < bufferSize; i++) {
            const t = i / ctx.sampleRate;
            const envelope = Math.exp(-t * 20); // Short exponential decay
            const tone = Math.sin(2 * Math.PI * 200 * t); // 200Hz soft thud
            data[beatStart + i] = tone * envelope * 0.3;
        }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start();
    currentNodes.push(source);
}

/**
 * Start playing a sound mode
 */
export function startSound(mode: SoundMode, volume: number = 0.5): void {
    stopSound();
    if (mode === "silence") {
        currentMode = mode;
        return;
    }

    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
        ctx.resume();
    }

    masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
    currentNodes.push(masterGain);

    switch (mode) {
        case "brown_noise":
            createBrownNoise(ctx, masterGain);
            break;
        case "pink_noise":
            createPinkNoise(ctx, masterGain);
            break;
        case "ambient":
            createAmbient(ctx, masterGain);
            break;
        case "rhythmic":
            createRhythmic(ctx, masterGain);
            break;
    }

    currentMode = mode;
}

/**
 * Stop all audio
 */
export function stopSound(): void {
    cleanup();
    currentMode = "silence";
    masterGain = null;
}

/**
 * Set volume (0-1)
 */
export function setVolume(volume: number): void {
    if (masterGain) {
        masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
}

/**
 * Get current sound mode
 */
export function getCurrentMode(): SoundMode {
    return currentMode;
}
