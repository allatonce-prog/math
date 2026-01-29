/**
 * ui.js
 * Handles DOM manipulation and rendering of visual elements.
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
        card.appendChild(renderGroups(stepData.groups, stepData.itemsPerGroup, stepData.iconType));
    } else if (stepData.type === 'visual_total' || stepData.type === 'visual_grouping' || stepData.type === 'result_summary') {
        const isGrouping = stepData.type === 'visual_grouping';
        // Handle undefined groupSize gracefully
        const gSize = stepData.groupSize || 1;
        card.appendChild(renderItems(stepData.total, gSize, isGrouping, stepData.iconType));
    } else if (stepData.type === 'visual_add') {
        card.appendChild(renderAddition(stepData.initial, stepData.added, stepData.iconType));
    } else if (stepData.type === 'visual_subtract') {
        card.appendChild(renderSubtraction(stepData.total, stepData.taken, stepData.iconType));
    }

    stage.appendChild(card);
}

// --- Visual Helpers ---

function createIcon(type) {
    const div = document.createElement('div');
    div.className = `icon-sprite icon-${type}`;
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
            icon.style.animationDelay = `${(i * 0.1) + (j * 0.05)}s`;
            // Add pop-in animation
            icon.style.animation = `popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`;
            icon.style.animationDelay = `${(j * 0.1)}s`;
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
        // We aren't handling remainder visualization fully here for division yet in this new mode, 
        // but let's stick to the happy path for now or it gets complex.

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
        // If it's one of the "taken" ones, apply cross-out
        // We take from the end usually
        if (i >= total - taken) {
            icon.classList.add('crossed-out');
        }
        box.appendChild(icon);
    }
    wrapper.appendChild(box);

    return wrapper;
}
