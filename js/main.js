/**
 * main.js
 * Core application logic integrating Voice, UI, Data, and new Gamification/Tools
 */

import { generateMultiplicationSteps, generateDivisionSteps, generateAdditionSteps, generateSubtractionSteps } from './mathLogic.js';
import { output } from './speech.js';
import * as UI from './ui.js';
import { sfx, music } from './audio.js';
import { triggerConfetti } from './confetti.js';
import { Scratchpad } from './scratchpad.js';
import { ArtBoard } from './artboard.js';

// DOM Elements - Main Inputs
const numAInput = document.getElementById('num-a');
const numBInput = document.getElementById('num-b');
const operationSelect = document.getElementById('operation');
const solveBtn = document.getElementById('solve-btn');

// Sections
const inputSection = document.getElementById('input-section');
const explanationSection = document.getElementById('explanation-section');
const drawingSection = document.getElementById('drawing-section');
const tableSection = document.getElementById('table-section');

// Navigation & Controls
const replayBtn = document.getElementById('replay-voice-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const installBtn = document.getElementById('install-btn');
const voiceSelect = document.getElementById('voice-select');
const progressBar = document.getElementById('progress-bar');
const starCountEl = document.getElementById('star-count');
const quizToggle = document.getElementById('quiz-mode-toggle');

// Menu Controls
const menuBtn = document.getElementById('menu-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const drawPageBtn = document.getElementById('draw-page-btn');

const tablePageBtn = document.getElementById('table-page-btn');
const musicBtn = document.getElementById('music-toggle-btn');

// Sub-feature Controls
const drawBtn = document.getElementById('draw-toggle-btn');
const clearDrawBtn = document.getElementById('clear-draw-btn');
const closeDrawBtn = document.getElementById('close-draw-btn');
const closeTableBtn = document.getElementById('close-table-btn');
// ArtBoard tools
const colorPicker = document.getElementById('color-picker');
const brushSize = document.getElementById('brush-size');
const eraserBtn = document.getElementById('eraser-btn');
const clearBoardBtn = document.getElementById('clear-board-btn');
// Table Tools
const tableSidebar = document.getElementById('table-sidebar');
const tableView = document.getElementById('table-view');

// State
let currentSteps = [];
let currentIndex = 0;
let deferredPrompt;
let starCount = 0;
let currentResult = 0;
let quizMode = false;
let scratchpad = null;
let artBoard = null;
let activeTableNum = null;

/**
 * Initialize App
 */
function init() {
    loadStars();
    scratchpad = new Scratchpad('stage-wrapper');
    artBoard = new ArtBoard('art-canvas');

    // --- Sidebar Menu Logic ---
    // Defined in init so it has access to state if needed, and ensures DOM binding

    const openMenu = (e) => {
        if (e) e.stopPropagation();
        if (sidebarOverlay) {
            sidebarOverlay.classList.remove('hidden');
            void sidebarOverlay.offsetWidth; // Force reflow
            sidebarOverlay.classList.add('active');
            sfx.click();
        }
    };

    const closeMenu = () => {
        if (sidebarOverlay) {
            sidebarOverlay.classList.remove('active');
            setTimeout(() => sidebarOverlay.classList.add('hidden'), 300);
            sfx.click();
        }
    };

    if (menuBtn) menuBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', (e) => {
            if (e.target === sidebarOverlay) closeMenu();
        });
    }

    // --- Main Feature Navigation ---

    solveBtn.addEventListener('click', handleSolve);



    drawPageBtn.addEventListener('click', () => {
        closeMenu();
        inputSection.classList.add('hidden');
        drawingSection.classList.remove('hidden');
        artBoard.resize();
        output.speak("Let's draw!");
    });

    // --- Multiplication Table Logic ---

    const renderTableButtons = () => {
        if (!tableSidebar) return;
        tableSidebar.innerHTML = '';
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = 'table-toggle-btn';
            if (i === activeTableNum) btn.classList.add('active');

            btn.onclick = () => {
                // Deactivate others
                document.querySelectorAll('.table-toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeTableNum = i;
                showTableFor(i);
                sfx.click();
            };
            tableSidebar.appendChild(btn);
        }
    };

    const showTableFor = (num) => {
        if (!tableView) return;
        tableView.innerHTML = '';
        // Header
        const title = document.createElement('h3');
        title.textContent = `Times ${num}`;
        title.style.margin = '0 0 10px 0';
        title.style.color = '#6c5ce7';
        tableView.appendChild(title);

        for (let i = 1; i <= 10; i++) {
            const row = document.createElement('div');
            row.className = 'table-row-item';

            const text = document.createElement('span');
            text.textContent = `${num} × ${i} = ${num * i}`;

            const icon = document.createElement('span');
            icon.textContent = '🔊';
            icon.style.opacity = '0.5';

            row.appendChild(text);
            row.appendChild(icon);

            row.onclick = () => {
                output.speak(`${num} times ${i} is ${num * i}`);
                sfx.pop();
                row.style.background = '#ffeaa7';
                setTimeout(() => row.style.background = 'white', 300);
            };

            // Stagger animation
            row.style.animation = `popIn 0.3s forwards`;
            row.style.animationDelay = `${i * 0.05}s`;

            tableView.appendChild(row);
        }
    };

    if (tablePageBtn) {
        tablePageBtn.addEventListener('click', () => {
            closeMenu();
            inputSection.classList.add('hidden');
            tableSection.classList.remove('hidden');

            // Force default to 1 if nothing selected
            if (!activeTableNum) activeTableNum = 1;

            renderTableButtons();
            showTableFor(activeTableNum);

            output.speak("Multiplication Table!");
        });
    }

    if (closeTableBtn) {
        closeTableBtn.addEventListener('click', () => {
            sfx.click();
            tableSection.classList.add('hidden');
            inputSection.classList.remove('hidden');
        });
    }

    // --- Situational Quiz Logic ---
    const quizPageBtn = document.getElementById('quiz-page-btn');
    const homeBtn = document.getElementById('home-btn');
    const quizSection = document.getElementById('quiz-section');
    const closeQuizBtn = document.getElementById('close-quiz-btn');
    const nextQuizBtn = document.getElementById('next-quiz-btn');

    let currentQuizData = null;

    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            closeMenu();
            // Reset Views
            quizSection.classList.add('hidden');
            drawingSection.classList.add('hidden');
            tableSection.classList.add('hidden');
            explanationSection.classList.add('hidden');

            // Show Home
            inputSection.classList.remove('hidden');
            output.speak("Welcome back!");

            // Optional: Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (quizPageBtn) {
        quizPageBtn.addEventListener('click', () => {
            closeMenu();
            inputSection.classList.add('hidden');
            quizSection.classList.remove('hidden');
            loadNewQuiz();
            output.speak("Quiz Time! Listen carefully.");
        });
    }

    if (closeQuizBtn) {
        closeQuizBtn.addEventListener('click', () => {
            sfx.click();
            quizSection.classList.add('hidden');
            inputSection.classList.remove('hidden');
            output.stop();
        });
    }

    if (nextQuizBtn) {
        nextQuizBtn.addEventListener('click', () => {
            sfx.click();
            loadNewQuiz();
        });
    }

    // --- Daily Challenge State & Logic ---
    let dailyStreak = parseInt(localStorage.getItem('math_daily_streak') || '0');
    let lastDailyDate = localStorage.getItem('math_last_daily_date') || '';
    let isDailyMode = false;
    let dailyQuestionCount = 0; // 0 to 5

    function initDailyChallenge() {
        const today = new Date().toDateString();
        const dailyBtn = document.getElementById('daily-btn');
        const streakCountEl = document.getElementById('streak-count');

        // Update UI
        if (streakCountEl) streakCountEl.textContent = dailyStreak;

        if (dailyBtn) {
            // Check if already done today
            if (lastDailyDate === today) {
                dailyBtn.textContent = "✅ Daily Done!";
                dailyBtn.style.opacity = '0.7';
                dailyBtn.disabled = true;
            } else {
                dailyBtn.textContent = "📅 Daily Challenge";
                dailyBtn.disabled = false;
            }

            // Clean old listeners to prevent dupes if any (though init runs once)
            const newBtn = dailyBtn.cloneNode(true);
            dailyBtn.parentNode.replaceChild(newBtn, dailyBtn);

            newBtn.addEventListener('click', () => {
                if (newBtn.textContent.includes('Done')) return;
                closeMenu();
                startDailyChallenge(newBtn);
            });
        }
    }

    function startDailyChallenge(btnElement) {
        isDailyMode = true;
        dailyQuestionCount = 0;
        inputSection.classList.add('hidden');
        quizSection.classList.remove('hidden');
        output.speak("Daily Challenge! Answer 5 questions to keep your streak!");

        if (btnElement) btnElement.textContent = `📅 Daily (0/5)`;

        loadNewQuiz();
    }

    // --- Voice Recognition Setup ---
    const quizMicBtn = document.getElementById('quiz-mic-btn');
    const micStatus = document.getElementById('mic-status');

    if (quizMicBtn) {
        import('./voiceInput.js').then(mod => {
            const voice = mod.voiceInput;

            quizMicBtn.addEventListener('click', () => {
                sfx.click();
                if (quizMicBtn.classList.contains('listening')) {
                    voice.stop();
                    return;
                }

                micStatus.textContent = "Listening... Say the answer!";
                micStatus.classList.remove('hidden');
                quizMicBtn.classList.add('listening');
                quizMicBtn.textContent = "🛑 Stop Listening";

                // Pause TTS so it doesn't listen to itself
                output.stop();

                voice.start(
                    (text, number) => {
                        // On Result
                        console.log("Heard:", text, number);
                        micStatus.textContent = `Heard: "${text}"`;

                        if (number === currentQuizData.correct) {
                            // Correct!
                            // Find the correct button to pass visual feedback
                            const buttons = Array.from(document.querySelectorAll('.quiz-option-btn'));
                            const correctBtn = buttons.find(b => parseInt(b.textContent) === number);

                            checkQuizAnswer(number, correctBtn || quizMicBtn, currentQuizData.correct);

                            voice.stop();
                        } else {
                            // Wrong
                            micStatus.textContent = `Heard: "${text}". Try again!`;
                            micStatus.style.color = '#d63031';
                            setTimeout(() => {
                                micStatus.style.color = '#666';
                                // Don't stop listening immediately? 
                                // Actually better to stop and let them try again to avoid loop
                                voice.stop();
                            }, 1500);
                        }
                    },
                    (error) => {
                        // On Error
                        micStatus.textContent = "Didn't catch that. Tap to try again.";
                        voice.stop();
                    },
                    () => {
                        // On End
                        quizMicBtn.classList.remove('listening');
                        quizMicBtn.textContent = "🎤 Tap to Speak Answer";
                        // micStatus.classList.add('hidden'); // Keep result visible for a moment
                    }
                );
            });
        });
    }

    function loadNewQuiz() {
        import('./quizLogic.js').then(module => {
            const data = module.generateSituationalQuestion();
            currentQuizData = data;

            // Render
            const qText = document.getElementById('quiz-text');
            const qIconDisplay = document.getElementById('quiz-icon-display');
            const qOptions = document.getElementById('quiz-options');
            const qFeedback = document.getElementById('quiz-feedback');

            // Header for Daily Mode
            if (isDailyMode) {
                qText.style.color = "#d35400";
                qText.textContent = `[Daily ${dailyQuestionCount + 1}/5] ${data.text}`;
            } else {
                qText.style.color = "#2d3436";
                qText.textContent = data.text;
            }

            // VISUAL ENHANCEMENT: Show multiple icons to match the story
            qIconDisplay.innerHTML = '';
            qIconDisplay.className = 'quiz-visual-group'; // We will style this new class

            // Show up to 10 icons as a hint/visual
            // If answer is small, show answer count? Or show the 'a' or 'b' variable?
            // Let's safe bet: show up to 10 of the question's object icon
            const showCount = Math.min(data.correct, 10);

            for (let i = 0; i < showCount; i++) {
                const s = document.createElement('span');
                s.textContent = data.icon;
                s.style.fontSize = '3rem';
                s.style.margin = '5px';
                s.style.display = 'inline-block';
                s.style.animation = `popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`;
                s.style.animationDelay = `${i * 0.1}s`;
                qIconDisplay.appendChild(s);
            }

            if (data.correct > 10) {
                const plus = document.createElement('span');
                plus.textContent = '...';
                plus.style.fontSize = '2rem';
                plus.style.verticalAlign = 'middle';
                qIconDisplay.appendChild(plus);
            }

            // Speak the question
            output.speak(data.text);

            // Reset UI
            qOptions.innerHTML = '';
            qFeedback.textContent = '';
            qFeedback.className = 'quiz-feedback hidden';
            nextQuizBtn.classList.add('hidden');

            data.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option-btn';
                btn.textContent = opt;
                btn.onclick = () => checkQuizAnswer(opt, btn, data.correct);
                qOptions.appendChild(btn);
            });
        });
    }

    function checkQuizAnswer(selected, btnElement, correct) {
        const qFeedback = document.getElementById('quiz-feedback');
        const allBtns = document.querySelectorAll('.quiz-option-btn');

        if (selected === correct) {
            // Correct
            sfx.correct();
            btnElement.classList.add('correct');
            triggerConfetti();
            output.speak("Excellent! That is correct!");

            qFeedback.textContent = "Correct! 🎉";
            qFeedback.classList.remove('hidden');

            allBtns.forEach(b => b.disabled = true);
            awardStar(); // Bonus star!

            // DAILY MODE LOGIC
            if (isDailyMode) {
                dailyQuestionCount++;
                if (dailyBtn) dailyBtn.textContent = `📅 Daily (${dailyQuestionCount}/5)`;

                if (dailyQuestionCount >= 5) {
                    completeDailyChallenge();
                    return; // Don't show next button, we are done
                }
            }

            nextQuizBtn.classList.remove('hidden');

        } else {
            // Wrong
            sfx.wrong();
            btnElement.classList.add('wrong');
            output.speak("Oops, try again!");
            btnElement.disabled = true;
        }
    }

    function completeDailyChallenge() {
        sfx.win();
        output.speak("Challenge Complete! You extended your streak!");

        // Update Stats
        dailyStreak++;
        localStorage.setItem('math_daily_streak', dailyStreak);
        if (streakCountEl) streakCountEl.textContent = dailyStreak;

        lastDailyDate = new Date().toDateString();
        localStorage.setItem('math_last_daily_date', lastDailyDate);

        if (dailyBtn) {
            dailyBtn.textContent = "✅ Daily Done!";
            dailyBtn.disabled = true;
        }

        isDailyMode = false; // Reset mode

        // Huge Confetti
        triggerConfetti();
        setTimeout(triggerConfetti, 500);
        setTimeout(triggerConfetti, 1000);

        // Show completion message
        const qText = document.getElementById('quiz-text');
        qText.innerHTML = `🎉 <span style="color:#e84393; font-size: 2.5rem;">DAY ${dailyStreak} COMPLETE!</span> 🎉<br>See you tomorrow!`;

        document.getElementById('quiz-options').innerHTML = '';
        nextQuizBtn.classList.add('hidden');

        // Create a 'Finish' button to go back
        const finishBtn = document.createElement('button');
        finishBtn.className = 'action-btn';
        finishBtn.textContent = "Back to Menu";
        finishBtn.style.background = "#6c5ce7";
        finishBtn.style.marginTop = "20px";
        finishBtn.onclick = () => {
            inputSection.classList.remove('hidden');
            quizSection.classList.add('hidden');
            finishBtn.remove();
        };
        document.getElementById('quiz-options').appendChild(finishBtn);
    }


    // --- Other Controls ---

    const apiKeyBtn = document.getElementById('api-key-btn');
    if (apiKeyBtn) {
        import('./openai_tts.js').then(module => {
            apiKeyBtn.addEventListener('click', () => {
                const currentKey = module.openAITTS.getKey();
                const newKey = prompt("Enter your OpenAI API Key for premium voices:\n(Leave empty to use free voices)", currentKey);
                if (newKey !== null) {
                    module.openAITTS.setKey(newKey.trim());
                    if (newKey.trim()) {
                        output.speak("Hello! I am your new premium teacher.");
                        apiKeyBtn.textContent = "🔑 Premium Voice Active";
                        apiKeyBtn.style.color = "#00b894";
                    } else {
                        apiKeyBtn.textContent = "🔑 Unlock Premium Voice";
                        apiKeyBtn.style.color = "gold";
                    }
                }
            });
            // Update initial state
            if (module.openAITTS.getKey()) {
                apiKeyBtn.textContent = "🔑 Premium Voice Active";
                apiKeyBtn.style.color = "#00b894";
            }
        });
    }

    musicBtn.addEventListener('click', () => {
        const isPlaying = music.toggle();
        musicBtn.textContent = isPlaying ? '🎵 Music: On' : '🎵 Music: Off';
    });

    closeDrawBtn.addEventListener('click', () => {
        sfx.click();
        drawingSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
    });

    // ArtBoard Tools
    colorPicker.addEventListener('input', (e) => artBoard.setColor(e.target.value));
    brushSize.addEventListener('input', (e) => artBoard.setSize(e.target.value));
    eraserBtn.addEventListener('click', () => artBoard.setEraser());
    clearBoardBtn.addEventListener('click', () => {
        artBoard.clear();
        sfx.pop();
    });

    // Scratchpad Tools (Explanation view)
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

    // Standard Nav
    replayBtn.addEventListener('click', () => {
        const step = currentSteps[currentIndex];
        output.speak(step.text);
    });

    nextBtn.addEventListener('click', () => { sfx.click(); goNext(); });
    prevBtn.addEventListener('click', () => { sfx.click(); goPrev(); });

    voiceSelect.addEventListener('change', (e) => {
        output.setVoiceGender(e.target.value);
    });
    output.setVoiceGender(voiceSelect.value);

    // PWA Install
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

    initDailyChallenge();
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
