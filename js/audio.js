/**
 * audio.js
 * Synthesizes sound effects using Web Audio API.
 * No external files needed!
 */

const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

const playTone = (freq, type, duration, vol = 0.1) => {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
};

export const sfx = {
    pop: () => {
        // Bubble pop sound
        playTone(400 + Math.random() * 200, 'sine', 0.1, 0.1);
    },
    click: () => {
        // Sharp click/ding
        playTone(800, 'triangle', 0.05, 0.05);
    },
    correct: () => {
        // High ping
        playTone(1200, 'sine', 0.1, 0.1);
        setTimeout(() => playTone(1600, 'sine', 0.2, 0.1), 100);
    },
    wrong: () => {
        // Low buzzer
        playTone(150, 'sawtooth', 0.3, 0.1);
    },
    win: () => {
        // Victory fanfare sequence
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            setTimeout(() => playTone(freq, 'square', 0.2, 0.1), i * 100);
        });
    }
};
