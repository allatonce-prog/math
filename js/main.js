/**
 * main.js
 * App Entry Point.
 * Coordinates interaction between UI, Math Logic, and Speech.
 */

import { generateMultiplicationSteps, generateDivisionSteps } from './mathLogic.js';
import { output } from './speech.js';
import * as UI from './ui.js';

// DOM Elements
const numAInput = document.getElementById('num-a');
const numBInput = document.getElementById('num-b');
const operationSelect = document.getElementById('operation');
const solveBtn = document.getElementById('solve-btn');
const explanationSection = document.getElementById('explanation-section');
const replayBtn = document.getElementById('replay-voice-btn');
const installBtn = document.getElementById('install-btn');
const voiceSelect = document.getElementById('voice-select');

// State
let currentSteps = [];
let currentStepIndex = 0;
let deferredPrompt;

/**
 * Initialize App
 */
function init() {
    solveBtn.addEventListener('click', handleSolve);
    replayBtn.addEventListener('click', replayNarration);

    // Voice Change Listener
    voiceSelect.addEventListener('change', (e) => {
        output.setVoiceGender(e.target.value);
    });

    // Set initial voice
    output.setVoiceGender(voiceSelect.value);

    // PWA Install Prompt handling
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.classList.remove('hidden');
    });

    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            installBtn.classList.add('hidden');
        }
        deferredPrompt = null;
    });
}

/**
 * Handle Solve Button Click
 */
function handleSolve() {
    const a = parseInt(numAInput.value);
    const b = parseInt(numBInput.value);
    const op = operationSelect.value;

    if (isNaN(a) || isNaN(b) || a < 1 || b < 1) {
        alert("Please enter valid positive numbers!");
        return;
    }

    // Stop any current speech
    output.stop();

    // Generate Logic
    let data;
    if (op === 'multiply') {
        data = generateMultiplicationSteps(a, b);
    } else {
        data = generateDivisionSteps(a, b);
    }

    currentSteps = data.steps;

    // Update UI
    UI.clearSteps();
    explanationSection.classList.remove('hidden');

    // Animate Steps sequentially
    runStepSequence();
}

/**
 * Runs the sequence of steps: Render -> Speak -> Wait -> Next
 */
async function runStepSequence() {
    for (let i = 0; i < currentSteps.length; i++) {
        const step = currentSteps[i];

        // 1. Render Visual
        const card = UI.createStepCard(step);
        UI.appendStep(card);

        // 2. Speak (Promise wrapper to wait for speech to finish)
        await new Promise(resolve => {
            output.speak(step.text, resolve);
        });

        // Small pause between steps
        await new Promise(r => setTimeout(r, 500));
    }
}

/**
 * Replays the narration for the current set of steps
 */
function replayNarration() {
    output.stop();
    // Re-read all text sequentially
    let textQueue = currentSteps.map(s => s.text);

    function speakNext() {
        if (textQueue.length === 0) return;
        const text = textQueue.shift();
        output.speak(text, speakNext);
    }
    speakNext();
}

// Start
init();
