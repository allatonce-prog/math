export const voiceInput = {
    recognition: null,
    isSupported: false,
    onResult: null,

    init() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        } else {
            console.warn("Speech Recognition not supported");
            return;
        }

        this.isSupported = true;
        this.recognition.continuous = false;
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            console.log("Heard:", transcript);
            if (this.onResult) {
                // Try to parse number
                const number = this.parseNumber(transcript);
                this.onResult(transcript, number);
            }
        };

        this.recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            if (this.onError) this.onError(event.error);
        };

        this.recognition.onend = () => {
            if (this.onEnd) this.onEnd();
        };
    },

    start(onResultCallback, onErrorCallback, onEndCallback) {
        if (!this.isSupported) {
            if (!this.recognition) this.init(); // Try lazy init
            if (!this.isSupported) return false;
        }

        this.onResult = onResultCallback;
        this.onError = onErrorCallback;
        this.onEnd = onEndCallback;

        try {
            this.recognition.start();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    stop() {
        if (this.recognition) {
            this.recognition.stop();
        }
    },

    // Simple helper to convert common number words
    parseNumber(text) {
        // Direct number check
        if (!isNaN(text)) return parseFloat(text);

        // Clean text
        const clean = text.toLowerCase().replace('.', '').trim();

        const map = {
            'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
            'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
            'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
            'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
            'eighteen': 18, 'nineteen': 19, 'twenty': 20,
            'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60,
            'seventy': 70, 'eighty': 80, 'ninety': 90,
            // Common misinterpretations
            'to': 2, 'too': 2, 'for': 4, 'fore': 4, 'ate': 8
        };

        // 1. Direct match
        if (map[clean] !== undefined) return map[clean];

        // 2. Contains match (e.g. "it is five")
        for (const [key, val] of Object.entries(map)) {
            // "one" is dangerous as it matches "phone", "zone". 
            // Only match if bordered by space or is exact match
            const regex = new RegExp(`\\b${key}\\b`, 'i');
            if (regex.test(clean)) return val;
        }

        return null;
    }
};

voiceInput.init();
