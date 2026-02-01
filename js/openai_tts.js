/**
 * openai_tts.js
 * Integration for OpenAI's Text-to-Speech API.
 * Replaces or Augments the standard WebSpeech API.
 */

// You should ideally fetch this from a secure backend or prompt the user.
// For a client-side demo, we'll ask the user to input it or store in localStorage.
let OPENAI_API_KEY = localStorage.getItem('math_openai_key') || '';

export const openAITTS = {
    /**
     * Set the API Key
     */
    setKey: (key) => {
        OPENAI_API_KEY = key;
        localStorage.setItem('math_openai_key', key);
    },

    getKey: () => OPENAI_API_KEY,

    /**
     * Speak text using OpenAI API
     * @param {string} text - The text to speak
     * @param {string} voice - 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
     * @param {function} onEndCallback - Callback when audio finishes
     */
    speak: async (text, voice = 'nova', onEndCallback = null) => {
        if (!OPENAI_API_KEY) {
            console.warn("OpenAI API Key missing");
            if (onEndCallback) onEndCallback();
            return false;
        }

        try {
            const response = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'tts-1',
                    input: text,
                    voice: voice, // 'nova' is great for a friendly teacher
                    speed: 0.9
                })
            });

            if (!response.ok) {
                console.error('OpenAI TTS Error:', await response.text());
                if (onEndCallback) onEndCallback();
                return false;
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            // Animation Hook
            const mascot = document.getElementById('mascot');

            audio.onplay = () => {
                if (mascot) mascot.classList.add('mascot-talking');
            };

            audio.onended = () => {
                if (onEndCallback) onEndCallback();
                URL.revokeObjectURL(url); // Cleanup
                if (mascot) mascot.classList.remove('mascot-talking');
            };

            audio.onerror = (e) => {
                console.error("Audio Playback Error", e);
                if (onEndCallback) onEndCallback();
                if (mascot) mascot.classList.remove('mascot-talking');
            };

            audio.play();
            return true;

        } catch (err) {
            console.error(err);
            if (onEndCallback) onEndCallback();
            return false;
        }
    }
};
