/**
 * ui.js
 * Handles DOM manipulation and rendering of visual elements.
 */

import { sfx } from './audio.js';
import { output } from './speech.js';

const stage = document.getElementById('step-stage');
let tapCount = 0;

/**
 * renderStage
 * Renders a single step into the stage
 */
export function renderStage(stepData) {
    if (!stage) return;
    stage.innerHTML = ''; // Clear previous
    tapCount = 0; // Reset count for new stage

    const card = document.createElement('div');
    card.className = 'step-card';
    card.id = 'current-card'; // Helper for styling

    const text = document.createElement('p');
    text.className = 'step-text';
    text.textContent = stepData.text;
    card.appendChild(text);

    // Render Visuals based on type
    if (stepData.type === 'visual_groups') {
        card.appendChild(renderGroups(stepData.groups, stepData.itemsPerGroup, stepData.iconType));
    } else if (stepData.type === 'visual_total' || stepData.type === 'visual_grouping' || stepData.type === 'result_summary') {
        const isGrouping = stepData.type === 'visual_grouping';
        const gSize = stepData.groupSize || 1;
        card.appendChild(renderItems(stepData.total, gSize, isGrouping, stepData.iconType));
    } else if (stepData.type === 'visual_add') {
        card.appendChild(renderAddition(stepData.initial, stepData.added, stepData.iconType));
    } else if (stepData.type === 'visual_subtract') {
        card.appendChild(renderSubtraction(stepData.total, stepData.taken, stepData.iconType));
    }

    stage.appendChild(card);
}

/**
 * renderQuiz
 * Renders the balloon quiz interface
 */
export function renderQuiz(correctAnswer, onCorrect, onWrong) {
    if (!stage) return;
    stage.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'step-card';

    const text = document.createElement('p');
    text.className = 'step-text';
    text.textContent = "Pop the balloon with the right answer!";
    card.appendChild(text);

    const balloonContainer = document.createElement('div');
    balloonContainer.className = 'balloon-container';

    // Generate wrong answers
    let answers = [correctAnswer];
    while (answers.length < 3) {
        let r = Math.max(1, correctAnswer + Math.floor(Math.random() * 10) - 5);
        if (!answers.includes(r)) answers.push(r);
    }
    // Shuffle
    answers.sort(() => Math.random() - 0.5);

    answers.forEach(ans => {
        const bal = document.createElement('div');
        bal.className = 'balloon';
        bal.textContent = ans;
        bal.onclick = () => {
            if (ans === correctAnswer) {
                sfx.correct();
                sfx.pop(); // Re-use pop for consistency
                bal.style.background = '#00b894'; // Green for success
                bal.textContent = 'Correct!';
                // Disable all click handlers
                Array.from(balloonContainer.children).forEach(b => b.onclick = null);
                setTimeout(onCorrect, 1000);
            } else {
                sfx.wrong();
                bal.style.opacity = '0.5';
                bal.style.transform = 'scale(0.9)';
                if (onWrong) onWrong();
            }
        };
        balloonContainer.appendChild(bal);
    });

    card.appendChild(balloonContainer);
    stage.appendChild(card);
}

// --- Visual Helpers ---

function createIcon(type, isInteractive = true) {
    const div = document.createElement('div');
    div.className = type === 'star' ? 'icon-star' : `icon-sprite icon-${type}`;

    // Add interaction
    if (isInteractive) {
        div.style.cursor = 'pointer';
        div.setAttribute('role', 'button');
        div.setAttribute('aria-label', `Tap to count`);

        div.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent bubbling if needed

            // If already counted, maybe just say the number again?
            if (this.classList.contains('counted')) {
                const myNum = this.getAttribute('data-count-val');
                if (myNum) output.speak(myNum);
                sfx.pop();
                return;
            }

            // New count
            if (this.classList.contains('crossed-out')) {
                // Don't count subtracted items normally, strictly speaking
                sfx.pop();
                return;
            }

            tapCount++;
            this.classList.add('counted');
            this.setAttribute('data-count-val', tapCount); // Save its number

            // Visual bounce is handled by CSS .counted
            sfx.pop();
            output.speak(tapCount.toString());
        });
    }

    return div;
}

function renderGroups(numGroups, itemsPerGroup, iconType) {
    const wrapper = document.createElement('div');
    wrapper.className = 'visual-container';

    for (let i = 0; i < numGroups; i++) {
        const groupBox = document.createElement('div');
        groupBox.className = 'group-box';

        const label = document.createElement('span');
        label.className = 'group-label';
        label.textContent = `Group ${i + 1}`;
        groupBox.appendChild(label);

        for (let j = 0; j < itemsPerGroup; j++) {
            const icon = createIcon(iconType);
            // Stagger animation
            icon.style.animation = `popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`;
            icon.style.animationDelay = `${(i * 0.1) + (j * 0.05)}s`;
            groupBox.appendChild(icon);
        }
        wrapper.appendChild(groupBox);
    }
    return wrapper;
}

function renderItems(total, groupSize, isGrouping, iconType) {
    const wrapper = document.createElement('div');
    wrapper.className = 'visual-container';

    if (isGrouping) {
        const numGroups = Math.floor(total / groupSize);

        for (let i = 0; i < numGroups; i++) {
            const groupBox = document.createElement('div');
            groupBox.className = 'group-box';

            const label = document.createElement('span');
            label.className = 'group-label';
            label.textContent = `Group ${i + 1}`;
            groupBox.appendChild(label);

            for (let j = 0; j < groupSize; j++) {
                const icon = createIcon(iconType);
                groupBox.appendChild(icon);
            }
            wrapper.appendChild(groupBox);
        }
    } else {
        const looseBox = document.createElement('div');
        looseBox.className = 'group-box';
        looseBox.style.borderStyle = 'none';
        looseBox.style.boxShadow = 'none';
        looseBox.style.background = 'transparent';

        for (let i = 0; i < total; i++) {
            const icon = createIcon(iconType);
            icon.style.animation = `popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`;
            icon.style.animationDelay = `${i * 0.05}s`;
            looseBox.appendChild(icon);
        }
        wrapper.appendChild(looseBox);
    }
    return wrapper;
}

function renderAddition(initial, added, iconType) {
    const wrapper = document.createElement('div');
    wrapper.className = 'visual-container';

    // Original Pile
    const box1 = document.createElement('div');
    box1.className = 'group-box';
    for (let i = 0; i < initial; i++) {
        box1.appendChild(createIcon(iconType));
    }
    wrapper.appendChild(box1);

    // Operator
    const op = document.createElement('div');
    op.textContent = '+';
    op.style.fontSize = '3rem';
    op.style.alignSelf = 'center';
    op.style.color = '#7f8c8d';
    wrapper.appendChild(op);

    // Added Pile
    const box2 = document.createElement('div');
    box2.className = 'group-box';
    box2.style.borderColor = '#2ecc71'; // Green for adding
    for (let i = 0; i < added; i++) {
        const icon = createIcon(iconType);
        icon.style.animation = `popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`;
        icon.style.animationDelay = `${i * 0.1}s`;
        box2.appendChild(icon);
    }
    wrapper.appendChild(box2);

    return wrapper;
}

function renderSubtraction(total, taken, iconType) {
    const wrapper = document.createElement('div');
    wrapper.className = 'visual-container';

    const box = document.createElement('div');
    box.className = 'group-box';

    for (let i = 0; i < total; i++) {
        const icon = createIcon(iconType);
        if (i >= total - taken) {
            icon.classList.add('crossed-out');
        }
        box.appendChild(icon);
    }
    wrapper.appendChild(box);

    return wrapper;
}
