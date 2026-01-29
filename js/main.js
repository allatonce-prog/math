/**
 * main.js
 * App Entry Point.
 * Handles state, navigation, and coordination.
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
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const installBtn = document.getElementById('install-btn');
const voiceSelect = document.getElementById('voice-select');
const progressBar = document.getElementById('progress-bar');
const inputSection = document.getElementById('input-section');

// State
let currentSteps = [];
let currentIndex = 0;
let deferredPrompt;

/**
 * Initialize App
 */
function init() {
    solveBtn.addEventListener('click', handleSolve);
    replayBtn.addEventListener('click', () => {
        const step = currentSteps[currentIndex];
        output.speak(step.text);
    });

    nextBtn.addEventListener('click', goNext);
    prevBtn.addEventListener('click', goPrev);

    // Voice Change Listener
    voiceSelect.addEventListener('change', (e) => {
        output.setVoiceGender(e.target.value);
    });
    output.setVoiceGender(voiceSelect.value);

    // PWA Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.classList.remove('hidden');
    });

    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') installBtn.classList.add('hidden');
        deferredPrompt = null;
    });
}

/**
 * Start the Learning Session
 */
function handleSolve() {
    const a = parseInt(numAInput.value);
    const b = parseInt(numBInput.value);
    const op = operationSelect.value;

    if (isNaN(a) || isNaN(b) || a < 1 || b < 1) {
        alert("Please enter valid positive numbers!");
        return;
    }

    output.stop();

    // Generate Steps
    let data;
    if (op === 'multiply') data = generateMultiplicationSteps(a, b);
    else data = generateDivisionSteps(a, b);

    currentSteps = data.steps;
    currentIndex = 0;

    // UI Setup
    inputSection.classList.add('hidden'); // Hide input to focus
    explanationSection.classList.remove('hidden');

    // Start First Step
    updateStep();
}

/**
 * Updates UI and Speech for the current step
 */
function updateStep() {
    const step = currentSteps[currentIndex];

    // 1. Render Visual
    UI.renderStage(step);

    // 2. Update Progress Bar
    const progress = ((currentIndex + 1) / currentSteps.length) * 100;
    progressBar.style.width = `${progress}%`;

    // 3. Update Buttons
    prevBtn.disabled = currentIndex === 0;
    nextBtn.textContent = currentIndex === currentSteps.length - 1 ? 'Finish ✅' : 'Next ➡️';

    // 4. Speak
    output.stop(); // Stop previous
    output.speak(step.text);
}

function goNext() {
    if (currentIndex < currentSteps.length - 1) {
        currentIndex++;
        updateStep();
    } else {
        // Finished
        finishSession();
    }
}

function goPrev() {
    if (currentIndex > 0) {
        currentIndex--;
        updateStep();
    }
}

function finishSession() {
    output.speak("Great job! Let's do another one.");
    explanationSection.classList.add('hidden');
    inputSection.classList.remove('hidden');
    numAInput.value = '';
    numBInput.value = '';

    // Reset inputs
    inputSection.scrollIntoView({ behavior: 'smooth' });
}

init();
