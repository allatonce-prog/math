/**
 * main.js
 * App Entry Point.
 * Handles state, navigation, gamification, and quiz mode.
 */

import { generateMultiplicationSteps, generateDivisionSteps, generateAdditionSteps, generateSubtractionSteps } from './mathLogic.js';
import { output } from './speech.js';
import * as UI from './ui.js';
import { sfx } from './audio.js';
import { triggerConfetti } from './confetti.js';

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
const starCountEl = document.getElementById('star-count');
const quizToggle = document.getElementById('quiz-mode-toggle');

// State
let currentSteps = [];
let currentIndex = 0;
let deferredPrompt;
let starCount = 0;
let currentResult = 0;
let quizMode = false;

/**
 * Initialize App
 */
function init() {
    loadStars();

    solveBtn.addEventListener('click', handleSolve);
    replayBtn.addEventListener('click', () => {
        const step = currentSteps[currentIndex];
        output.speak(step.text);
    });

    nextBtn.addEventListener('click', () => { sfx.click(); goNext(); });
    prevBtn.addEventListener('click', () => { sfx.click(); goPrev(); });

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

function loadStars() {
    const saved = localStorage.getItem('mathStars');
    starCount = saved ? parseInt(saved) : 0;
    updateStarDisplay();
}

function awardStar() {
    starCount++;
    localStorage.setItem('mathStars', starCount);
    updateStarDisplay();
    sfx.win();
    triggerConfetti();
}

function updateStarDisplay() {
    starCountEl.textContent = starCount;
    // Simple bump animation
    starCountEl.parentElement.style.transform = 'scale(1.2)';
    setTimeout(() => starCountEl.parentElement.style.transform = 'scale(1)', 200);
}

/**
 * Start the Learning Session
 */
function handleSolve() {
    const a = parseInt(numAInput.value);
    const b = parseInt(numBInput.value);
    const op = operationSelect.value;
    quizMode = quizToggle.checked;

    if (isNaN(a) || isNaN(b) || a < 1 || b < 1) {
        output.speak("Please pick two numbers first!");
        return;
    }

    sfx.click();
    output.stop();

    // Generate Steps
    let data;
    if (op === 'multiply') data = generateMultiplicationSteps(a, b);
    else if (op === 'divide') data = generateDivisionSteps(a, b);
    else if (op === 'add') data = generateAdditionSteps(a, b);
    else if (op === 'subtract') data = generateSubtractionSteps(a, b);

    if (data.result === null) {
        alert(data.steps[0].text);
        return;
    }

    currentSteps = data.steps;
    currentResult = data.result;
    currentIndex = 0;

    // UI Setup
    inputSection.classList.add('hidden');
    explanationSection.classList.remove('hidden');

    if (quizMode) {
        startQuizMode();
    } else {
        updateStep();
    }
}

function startQuizMode() {
    nextBtn.classList.add('hidden'); // Hide nav during quiz
    prevBtn.classList.add('hidden');
    progressBar.parentElement.classList.add('hidden');

    UI.renderQuiz(currentResult, () => {
        // On Correct
        output.speak("That's right! Let me show you how.");
        nextBtn.classList.remove('hidden');
        prevBtn.classList.remove('hidden');
        progressBar.parentElement.classList.remove('hidden');
        updateStep();
    }, () => {
        // On Wrong
        output.speak("Oops, try again!");
    });
}

function updateStep() {
    const step = currentSteps[currentIndex];

    // 1. Render Visual
    UI.renderStage(step);
    sfx.pop(); // Sound effect for visual change

    // 2. Update Progress Bar
    const progress = ((currentIndex + 1) / currentSteps.length) * 100;
    progressBar.style.width = `${progress}%`;

    // 3. Update Buttons
    prevBtn.disabled = currentIndex === 0;
    nextBtn.textContent = currentIndex === currentSteps.length - 1 ? 'Finish 🏆' : 'Next ➡️';

    // 4. Speak
    output.stop();
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
    awardStar();
    output.speak("Amazing! You earned a star! Let's do another one.");

    // Wait for celebration then go back
    setTimeout(() => {
        explanationSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
        inputSection.scrollIntoView({ behavior: 'smooth' });

        // Reset state
        numAInput.value = '';
        numBInput.value = '';
        nextBtn.textContent = 'Next ➡️';
    }, 4000);
}

init();
