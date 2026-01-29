/**
 * ui.js
 * Handles DOM manipulation and rendering of visual elements.
 * Separated from main logic to keep things clean.
 */

const stage = document.getElementById('step-stage');

/**
 * renderStage
 * Renders a single step into the stage
 */
export function renderStage(stepData) {
    if (!stage) return;
    stage.innerHTML = ''; // Clear previous

    const card = document.createElement('div');
    card.className = 'step-card';

    const text = document.createElement('p');
    text.className = 'step-text';
    text.textContent = stepData.text;
    card.appendChild(text);

    // Render Visuals based on type
    if (stepData.type === 'visual_groups') {
        const visual = renderGroups(stepData.groups, stepData.itemsPerGroup, stepData.icon);
        card.appendChild(visual);
    } else if (stepData.type === 'visual_grouping' || stepData.type === 'visual_total') {
        const visual = renderItems(stepData.total, stepData.groupSize, stepData.type === 'visual_grouping', stepData.icon);
        card.appendChild(visual);
    }

    stage.appendChild(card);
}

/**
 * renderGroups
 * Renders A groups of B items for multiplication
 */
function renderGroups(numGroups, itemsPerGroup, icon = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'visual-container';

    for (let i = 0; i < numGroups; i++) {
        const groupBox = document.createElement('div');
        groupBox.className = 'group-box';

        // Label
        const label = document.createElement('span');
        label.className = 'group-label';
        label.textContent = `Group ${i + 1}`;
        groupBox.appendChild(label);

        // Counters
        for (let j = 0; j < itemsPerGroup; j++) {
            const counter = document.createElement('div');
            counter.className = 'counter';
            counter.textContent = icon; // Set emoji
            // Stagger animation slightly
            counter.style.animationDelay = `${(i * 0.1) + (j * 0.05)}s`;
            groupBox.appendChild(counter);
        }

        wrapper.appendChild(groupBox);
    }
    return wrapper;
}

/**
 * renderItems
 * Renders total items, optionally grouped visually for division
 */
function renderItems(total, groupSize, isGrouping, icon = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'visual-container';

    if (isGrouping) {
        // Group them
        const numGroups = Math.floor(total / groupSize);
        const remainder = total % groupSize;

        for (let i = 0; i < numGroups; i++) {
            const groupBox = document.createElement('div');
            groupBox.className = 'group-box';

            // Label
            const label = document.createElement('span');
            label.className = 'group-label';
            label.textContent = `Group ${i + 1}`;
            groupBox.appendChild(label);

            for (let j = 0; j < groupSize; j++) {
                const counter = document.createElement('div');
                counter.className = 'counter';
                counter.textContent = icon;
                groupBox.appendChild(counter);
            }
            wrapper.appendChild(groupBox);
        }

        if (remainder > 0) {
            const remainderBox = document.createElement('div');
            remainderBox.className = 'group-box';
            remainderBox.style.borderColor = '#ff6b6b'; // Alert color for remainder

            const label = document.createElement('span');
            label.className = 'group-label';
            label.style.background = '#ff6b6b';
            label.textContent = 'Leftover';
            remainderBox.appendChild(label);

            for (let k = 0; k < remainder; k++) {
                const counter = document.createElement('div');
                counter.className = 'counter';
                counter.textContent = icon;
                remainderBox.appendChild(counter);
            }
            wrapper.appendChild(remainderBox);
        }

    } else {
        // Just show all items loosely
        const looseBox = document.createElement('div');
        looseBox.className = 'group-box';
        looseBox.style.borderStyle = 'none'; // No border for total pile initially

        for (let i = 0; i < total; i++) {
            const counter = document.createElement('div');
            counter.className = 'counter';
            counter.textContent = icon;
            counter.style.animationDelay = `${i * 0.02}s`;
            looseBox.appendChild(counter);
        }
        wrapper.appendChild(looseBox);
    }

    return wrapper;
}
