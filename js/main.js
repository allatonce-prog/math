/**
 * main.js
 * App Entry Point.
 * Handles state, navigation, gamification, and quiz mode.
 */

import { generateMultiplicationSteps, generateDivisionSteps, generateAdditionSteps, generateSubtractionSteps } from './mathLogic.js';
import { output } from './speech.js';
import * as UI from './ui.js';
import { sfx, music } from './audio.js';
import { triggerConfetti } from './confetti.js';
import { Scratchpad } from './scratchpad.js';
import { ArtBoard } from './artboard.js';

// DOM Elements
const numAInput = document.getElementById('num-a');
const numBInput = document.getElementById('num-b');
const operationSelect = document.getElementById('operation');
const solveBtn = document.getElementById('solve-btn');
const surpriseBtn = document.getElementById('surprise-btn');
const musicBtn = document.getElementById('music-toggle-btn');
const drawBtn = document.getElementById('draw-toggle-btn');
const clearDrawBtn = document.getElementById('clear-draw-btn');

// Drawing Page Elements
const drawPageBtn = document.getElementById('draw-page-btn');
const drawingSection = document.getElementById('drawing-section');
const closeDrawBtn = document.getElementById('close-draw-btn');
const colorPicker = document.getElementById('color-picker');
const brushSize = document.getElementById('brush-size');
const eraserBtn = document.getElementById('eraser-btn');
const clearBoardBtn = document.getElementById('clear-board-btn');


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
let scratchpad = null;
let artBoard = null;

// Top level variable declarations moved inside init or handled there
// const menuBtn = document.getElementById('menu-btn');
// const closeMenuBtn = document.getElementById('close-menu-btn');
// const sidebarOverlay = document.getElementById('sidebar-overlay');

/**
 * Initialize App
 */
function init() {
    loadStars();
    scratchpad = new Scratchpad('stage-wrapper');
    artBoard = new ArtBoard('art-canvas');

    // Sidebar Navigation Logic - Moved inside Init to ensure DOM is ready
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (menuBtn && sidebarOverlay) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling
            sidebarOverlay.classList.remove('hidden'); // Ensure it's not hidden
            // Force reflow
            void sidebarOverlay.offsetWidth;
            sidebarOverlay.classList.add('active');
            sfx.click();
            console.log('Menu opened');
        });

        const closeMenu = () => {
            sidebarOverlay.classList.remove('active');
            setTimeout(() => sidebarOverlay.classList.add('hidden'), 300); // Wait for transition
            sfx.click();
        };

        if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
        sidebarOverlay.addEventListener('click', (e) => {
            if (e.target === sidebarOverlay) closeMenu();
        });
    } else {
        console.error('Menu elements not found!');
    }

    // Main Features
    solveBtn.addEventListener('click', handleSolve);

    surpriseBtn.addEventListener('click', () => {
        closeMenu();
        handleSurprise();
    });

    drawPageBtn.addEventListener('click', () => {
        closeMenu();
        inputSection.classList.add('hidden');
        drawingSection.classList.remove('hidden');
        artBoard.resize();
        output.speak("Let's draw!");
    });

    // Music Toggle
    musicBtn.addEventListener('click', () => {
        const isPlaying = music.toggle();
        musicBtn.textContent = isPlaying ? '🎵 Music: On' : '🎵 Music: Off';
        // musicBtn.ariaLabel = isPlaying ? 'Stop Music' : 'Start Music';
    });

    closeDrawBtn.addEventListener('click', () => {
        sfx.click();
        drawingSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
    });

    // Drawing Tools
    colorPicker.addEventListener('input', (e) => artBoard.setColor(e.target.value));
    brushSize.addEventListener('input', (e) => artBoard.setSize(e.target.value));
    eraserBtn.addEventListener('click', () => artBoard.setEraser());
    clearBoardBtn.addEventListener('click', () => {
        artBoard.clear();
        sfx.pop();
    });

    // Music Toggle
    musicBtn.addEventListener('click', () => {
        const isPlaying = music.toggle();
        musicBtn.textContent = isPlaying ? '🔇' : '🎵';
        musicBtn.ariaLabel = isPlaying ? 'Stop Music' : 'Start Music';
    });

    // Draw Tools
    drawBtn.addEventListener('click', () => {
        const isActive = scratchpad.toggle();
        drawBtn.classList.toggle('active', isActive);
        if (isActive) {
            clearDrawBtn.classList.remove('hidden');
            output.speak("Draw mode on!");
        } else {
            clearDrawBtn.classList.add('hidden');
        }
    });

    clearDrawBtn.addEventListener('click', () => {
        scratchpad.clear();
        sfx.click();
    });

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

function handleSurprise() {
    sfx.click();

    // Pick random operation
    const ops = ['add', 'subtract', 'multiply', 'divide'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    operationSelect.value = op;

    let a, b;

    // Smart Randomizer based on operation for Kids
    if (op === 'add') {
        a = Math.floor(Math.random() * 9) + 1; // 1-9
        b = Math.floor(Math.random() * 9) + 1;
    } else if (op === 'subtract') {
        a = Math.floor(Math.random() * 10) + 5; // 5-15
        b = Math.floor(Math.random() * (a - 1)) + 1; // Ensure check a > b
    } else if (op === 'multiply') {
        a = Math.floor(Math.random() * 5) + 1; // 1-5 (keep small)
        b = Math.floor(Math.random() * 5) + 1;
    } else if (op === 'divide') {
        b = Math.floor(Math.random() * 4) + 2; // 2-5
        a = b * (Math.floor(Math.random() * 4) + 1); // Ensure clean division
    }

    numAInput.value = a;
    numBInput.value = b;

    // Auto start
    setTimeout(handleSolve, 500);
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

    // Show explicit Victory Card immediately
    UI.renderStage({
        text: "Amazing Job! ⭐",
        type: 'result_summary', // Reuse visual items or just simple text
        total: 1,
        iconType: 'star' // We'll need to support this or just ignore visuals for this card
    });

    output.speak("Amazing! You earned a star! Let's do another one.");

    // Disable buttons so they don't click twice
    nextBtn.disabled = true;
    prevBtn.disabled = true;

    // Wait for celebration then go back
    setTimeout(() => {
        explanationSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
        // Reset state
        numAInput.value = '';
        numBInput.value = '';
        nextBtn.textContent = 'Next ➡️';
        nextBtn.disabled = false;
        prevBtn.disabled = false;

        inputSection.scrollIntoView({ behavior: 'smooth' });
    }, 2500); // Reduced from 4000 to 2500
}

init();
