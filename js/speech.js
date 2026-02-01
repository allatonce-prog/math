/**
 * speech.js
 * Wrapper for the Web Speech API (SpeechSynthesis).
 * Handles voice selection (Male/Female) and reliable playback.
 */

import { openAITTS } from './openai_tts.js';

const synthesis = window.speechSynthesis;
let allVoices = [];
let voicePreference = 'female'; // default

// Load voices (async nature of Chrome)
function loadVoices() {
    allVoices = synthesis.getVoices();
}

if (synthesis.onvoiceschanged !== undefined) {
    synthesis.onvoiceschanged = loadVoices;
}
loadVoices();

export const output = {
    isSupported: 'speechSynthesis' in window,

    /**
     * Set the preferred gender for the voice
     * @param {string} gender 'male' or 'female'
     */
    setVoiceGender: (gender) => {
        voicePreference = gender;
    },

    /**
     * Speaks the provided text using OpenAI if available, or fallback to WebSpeech.
     * @param {string} text - Text to speak
     * @param {function} onEndCallback - Optional callback when speech ends
     */
    speak: async (text, onEndCallback = null) => {
        // Stop any current native speech
        synthesis.cancel();

        // 1. Try OpenAI First
        if (openAITTS.getKey()) {
            const success = await openAITTS.speak(text, 'nova', onEndCallback);
            if (success) return;
            // If OpenAI failed (network/key error), fall through to native
        }

        // 2. Native Web Speech Fallback
        if (!output.isSupported) {
            console.warn('Text-to-Speech not supported.');
            if (onEndCallback) onEndCallback();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85; // Slower, patient teacher pace
        utterance.pitch = 1.15; // Higher pitch = perceptibly "happier" and brighter

        // Voice Selection Logic
        let selectedVoice = null;

        const enVoices = allVoices.filter(v => v.lang.includes('en'));

        // Friendlier Voice Priorities
        if (voicePreference === 'female') {
            selectedVoice = enVoices.find(v =>
                v.name.includes('Microsoft Aria') || // Best/Happiest on Windows
                v.name.includes('Google US English') || // Very clear on Android
                v.name.includes('Samantha') || // Standard Mac
                v.name.includes('Zira') ||
                v.name.includes('Susan')
            );
        } else {
            selectedVoice = enVoices.find(v =>
                v.name.includes('Google UK English Male') || // Often very calm
                v.name.includes('Daniel') ||
                v.name.includes('David')
            );
        }

        // 3. Fallback to any English voice, then any voice
        if (!selectedVoice) selectedVoice = enVoices[0];
        if (!selectedVoice) selectedVoice = allVoices[0];

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        // Android Safety: Keep a reference to prevent garbage collection
        window.currentUtterance = utterance;

        // ANIMATION START
        const mascot = document.getElementById('mascot');
        if (mascot) mascot.classList.add('mascot-talking');

        let hasFinished = false;
        const finish = () => {
            if (hasFinished) return;
            hasFinished = true;
            if (onEndCallback) onEndCallback();
            window.currentUtterance = null;
            // ANIMATION END
            if (mascot) mascot.classList.remove('mascot-talking');
        };

        utterance.onend = finish;
        utterance.onerror = (e) => {
            // Ignore interruption errors (happens when we click Next fast)
            if (e.error === 'interrupted' || e.error === 'canceled') {
                finish();
                return;
            }
            console.error('TTS Error:', e);
            finish();
        };

        synthesis.speak(utterance);

        // Safety Watchdog: If speech hangs or doesn't start, force finish after timeout
        const approximateDuration = (text.split(' ').length * 0.5) * 1000 + 2000;
        setTimeout(finish, approximateDuration);
    },

    stop: () => {
        // Native stop
        if (output.isSupported) {
            synthesis.cancel();
            if (window.currentUtterance) window.currentUtterance = null;
        }
        // TODO: We could add a way to stop the HTML Audio element from OpenAI if needed
    }
};

// Android Chrome fix: sometimes voices need a poke
if (output.isSupported && synthesis.getVoices().length === 0) {
    setTimeout(loadVoices, 1000);
}
