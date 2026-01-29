/**
 * speech.js
 * Wrapper for the Web Speech API (SpeechSynthesis).
 * Handles voice selection (Male/Female) and reliable playback.
 */

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
     * Speaks the provided text.
     * @param {string} text - Text to speak
     * @param {function} onEndCallback - Optional callback when speech ends
     */
    speak: (text, onEndCallback = null) => {
        if (!output.isSupported) {
            console.warn('Text-to-Speech not supported.');
            if (onEndCallback) onEndCallback();
            return;
        }

        synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85; // Slower for kids
        utterance.pitch = 1;

        // Voice Selection Logic
        let selectedVoice = null;

        // 1. Filter for English
        const enVoices = allVoices.filter(v => v.lang.includes('en'));

        // 2. Try to find match based on preference
        if (voicePreference === 'female') {
            selectedVoice = enVoices.find(v =>
                v.name.includes('Female') ||
                v.name.includes('Zira') ||
                v.name.includes('Google US option') ||
                v.name.includes('Susan')
            );
        } else {
            selectedVoice = enVoices.find(v =>
                v.name.includes('Male') ||
                v.name.includes('David') ||
                v.name.includes('Google UK') ||
                v.name.includes('Mark')
            );
        }

        // 3. Fallback to any English voice, then any voice
        if (!selectedVoice) selectedVoice = enVoices[0];
        if (!selectedVoice) selectedVoice = allVoices[0];

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log(`Speaking with: ${selectedVoice.name}`);
        }

        utterance.onend = () => { if (onEndCallback) onEndCallback(); };
        utterance.onerror = (e) => {
            console.error(e);
            if (onEndCallback) onEndCallback();
        };

        synthesis.speak(utterance);
    },

    stop: () => {
        if (output.isSupported) synthesis.cancel();
    }
};
