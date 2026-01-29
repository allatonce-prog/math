/**
 * mathLogic.js
 * Core logic for math operations.
 * SUPER BASIC for Grade 1.
 * Short sentences. Simple words.
 */

const THEMES = [
    { name: 'apple', plural: 'apples', icon: '🍎', place: 'basket', placePlural: 'baskets' },
    { name: 'duck', plural: 'ducks', icon: '🦆', place: 'pond', placePlural: 'ponds' },
    { name: 'car', plural: 'cars', icon: '🚗', place: 'box', placePlural: 'boxes' },
    { name: 'cookie', plural: 'cookies', icon: '🍪', place: 'jar', placePlural: 'jars' },
    { name: 'cat', plural: 'cats', icon: '🐱', place: 'mat', placePlural: 'mats' }
];

function getTheme() {
    return THEMES[Math.floor(Math.random() * THEMES.length)];
}

/**
 * Multiplication (A x B)
 * "A groups of B"
 */
export function generateMultiplicationSteps(a, b) {
    const result = a * b;
    const steps = [];
    const t = getTheme();

    // 1. Intro
    steps.push({
        text: `Let's multiply ${a} times ${b}.`,
        type: 'intro'
    });

    // 2. Setup Context
    steps.push({
        text: `Look! We have ${a} ${t.placePlural}.`,
        type: 'visual_groups',
        groups: a,
        itemsPerGroup: 0, // Show empty first
        icon: t.icon
    });

    // 3. Add items
    steps.push({
        text: `Now, put ${b} ${t.plural} in every ${t.place}.`,
        type: 'visual_groups', // Re-render with items
        groups: a,
        itemsPerGroup: b,
        icon: t.icon
    });

    // 4. Count
    steps.push({
        text: `Count them with me: 1, 2, ... all the way to ${result}!`,
        type: 'result',
        total: result,
        icon: t.icon
    });

    // 5. Final Answer
    steps.push({
        text: `So, the answer is ${result}. Great job!`,
        type: 'result_summary',
        total: result,
        icon: t.icon
    });

    return { result, steps };
}

/**
 * Division (A / B)
 * "Sharing A into groups of B"
 */
export function generateDivisionSteps(a, b) {
    if (b === 0) return { result: null, steps: [{ text: "Can't share with zero!", type: 'error' }] };

    const quotient = Math.floor(a / b);
    const remainder = a % b;
    const steps = [];
    const t = getTheme();

    // 1. Intro
    steps.push({
        text: `Let's divide ${a} by ${b}.`,
        type: 'intro'
    });

    // 2. Show Pile
    steps.push({
        text: `Here are ${a} ${t.plural}.`,
        type: 'visual_total',
        total: a,
        icon: t.icon
    });

    // 3. Explain Grouping
    steps.push({
        text: `We need to put ${b} ${t.plural} in each ${t.place}.`,
        type: 'explanation_only',
    });

    // 4. Do the grouping
    steps.push({
        text: `Circle groups of ${b}...`,
        type: 'visual_grouping',
        total: a,
        groupSize: b,
        icon: t.icon
    });

    // 5. Result
    steps.push({
        text: `See? We filled ${quotient} ${t.placePlural}!`,
        type: 'result',
        quotient: quotient,
        icon: t.icon
    });

    return { result: quotient, remainder, steps };
}
