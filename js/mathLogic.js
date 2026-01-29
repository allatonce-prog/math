/**
 * mathLogic.js
 * Core logic for math operations.
 * SUPER SIMPLE for Grade 1.
 */

const THEMES = [
    { name: 'apple', plural: 'apples', icon: '🍎', place: 'basket', placePlural: 'baskets' },
    { name: 'duck', plural: 'ducks', icon: '🦆', place: 'pond', placePlural: 'ponds' },
    { name: 'car', plural: 'cars', icon: '🚗', place: 'garage', placePlural: 'garages' },
    { name: 'cookie', plural: 'cookies', icon: '🍪', place: 'jar', placePlural: 'jars' },
    { name: 'cat', plural: 'cats', icon: '🐱', place: 'bed', placePlural: 'beds' }
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
        text: `Multiplication is putting equal groups together!`,
        type: 'intro'
    });

    // 2. Setup Context - Show Groups
    steps.push({
        text: `First, look! We have ${a} ${t.placePlural}.`,
        type: 'visual_groups',
        groups: a,
        itemsPerGroup: 0, // Show empty first
        icon: t.icon
    });

    // 3. Add items explanation
    steps.push({
        text: `We need to put ${b} ${t.plural} inside EACH ${t.place}.`,
        type: 'visual_groups',
        groups: a,
        itemsPerGroup: 0,
        icon: t.icon
    });

    // 4. Do it
    steps.push({
        text: `Watch! ${b} ${t.plural} go into every ${t.place}.`,
        type: 'visual_groups', // Re-render with items
        groups: a,
        itemsPerGroup: b,
        icon: t.icon
    });

    // 5. Count
    steps.push({
        text: `Now we count them all together!`,
        type: 'visual_groups',
        groups: a,
        itemsPerGroup: b,
        icon: t.icon
    });

    // 6. Final Answer
    steps.push({
        text: `There are ${result} ${t.plural} in total! So, ${a} × ${b} = ${result}.`,
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
        text: `Division is sharing equally!`,
        type: 'intro'
    });

    // 2. Show Pile
    steps.push({
        text: `We start with ${a} ${t.plural}.`,
        type: 'visual_total',
        total: a,
        icon: t.icon
    });

    // 3. Explain Grouping
    steps.push({
        text: `We want to make groups of ${b}.`,
        type: 'visual_total',
        total: a,
        icon: t.icon
    });

    // 4. Do the grouping
    steps.push({
        text: `Let's circle ${b} ${t.plural} at a time!`,
        type: 'visual_grouping',
        total: a,
        groupSize: b,
        icon: t.icon
    });

    // 5. Result
    steps.push({
        text: `Count the groups! We made ${quotient} full groups!`,
        type: 'result',
        quotient: quotient,
        icon: t.icon
    });

    return { result: quotient, remainder, steps };
}
