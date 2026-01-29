/**
 * mathLogic.js
 * Core logic for math operations.
 * Updated with Addition and Subtraction.
 */

const THEMES = [
    { name: 'apple', plural: 'apples', type: 'apple', place: 'basket', placePlural: 'baskets' },
    { name: 'duck', plural: 'ducks', type: 'duck', place: 'pond', placePlural: 'ponds' },
    { name: 'car', plural: 'cars', type: 'car', place: 'garage', placePlural: 'garages' },
    { name: 'cookie', plural: 'cookies', type: 'cookie', place: 'jar', placePlural: 'jars' }
];

function getTheme() {
    return THEMES[Math.floor(Math.random() * THEMES.length)];
}

/**
 * Addition (A + B)
 */
export function generateAdditionSteps(a, b) {
    const result = a + b;
    const steps = [];
    const t = getTheme();

    // 1. Intro
    steps.push({
        text: `Addition means putting things together!`,
        type: 'intro'
    });

    // 2. Show first group
    steps.push({
        text: `First, we have ${a} ${t.plural}.`,
        type: 'visual_total',
        total: a,
        iconType: t.type
    });

    // 3. Show second group adding in
    steps.push({
        text: `Then, we add ${b} more ${t.plural}.`,
        type: 'visual_add',
        initial: a,
        added: b,
        iconType: t.type
    });

    // 4. Count together
    steps.push({
        text: `Now, let's count them all! 1, 2, 3...`,
        type: 'visual_total',
        total: result,
        iconType: t.type
    });

    // 5. Result
    steps.push({
        text: `Wow! We have ${result} ${t.plural} now! So, ${a} + ${b} = ${result}.`,
        type: 'result_summary',
        total: result,
        iconType: t.type
    });

    return { result, steps };
}

/**
 * Subtraction (A - B)
 */
export function generateSubtractionSteps(a, b) {
    // Basic check for negative results (for Grade 1 usually A >= B)
    if (b > a) {
        return {
            result: null,
            steps: [{ text: `Oops! In basic math, we can't take ${b} from ${a}. Try a bigger first number!`, type: 'error' }]
        };
    }

    const result = a - b;
    const steps = [];
    const t = getTheme();

    // 1. Intro
    steps.push({
        text: `Subtraction means taking things away!`,
        type: 'intro'
    });

    // 2. Show Total
    steps.push({
        text: `We start with ${a} ${t.plural}.`,
        type: 'visual_total',
        total: a,
        iconType: t.type
    });

    // 3. Take away explanation
    steps.push({
        text: `Now, we take away ${b} ${t.plural}. Bye bye!`,
        type: 'visual_subtract', // Special visual to cross out items
        total: a,
        taken: b,
        iconType: t.type
    });

    // 4. Count remaining
    steps.push({
        text: `How many are left? Let's count the ones still here.`,
        type: 'visual_subtract', // Keep the visual representation
        total: a,
        taken: b,
        iconType: t.type
    });

    // 5. Result
    steps.push({
        text: `There are ${result} left! So, ${a} - ${b} = ${result}.`,
        type: 'result_summary', // Show final clean state? 
        // Actually rendering just the result is better for the final step
        total: result,
        iconType: t.type
    });

    return { result, steps };
}

/**
 * Multiplication (A x B)
 */
export function generateMultiplicationSteps(a, b) {
    const result = a * b;
    const steps = [];
    const t = getTheme();

    steps.push({ text: `Multiplication is putting equal groups together!`, type: 'intro' });
    steps.push({ text: `Look! We have ${a} ${t.placePlural}.`, type: 'visual_groups', groups: a, itemsPerGroup: 0, iconType: t.type });
    steps.push({ text: `Put ${b} ${t.plural} in EACH ${t.place}.`, type: 'visual_groups', groups: a, itemsPerGroup: 0, iconType: t.type });
    steps.push({ text: `Watch! ${b} ${t.plural} go into every ${t.place}.`, type: 'visual_groups', groups: a, itemsPerGroup: b, iconType: t.type });
    steps.push({ text: `Count them all together!`, type: 'visual_groups', groups: a, itemsPerGroup: b, iconType: t.type });
    steps.push({ text: `There are ${result} ${t.plural} in total! ${a} × ${b} = ${result}.`, type: 'result_summary', total: result, iconType: t.type });

    return { result, steps };
}

/**
 * Division (A / B)
 */
export function generateDivisionSteps(a, b) {
    if (b === 0) return { result: null, steps: [{ text: "Can't share with zero!", type: 'error' }] };
    const quotient = Math.floor(a / b);
    const steps = [];
    const t = getTheme();

    steps.push({ text: `Division is sharing equally!`, type: 'intro' });
    steps.push({ text: `We start with ${a} ${t.plural}.`, type: 'visual_total', total: a, iconType: t.type });
    steps.push({ text: `We want to make groups of ${b}.`, type: 'visual_total', total: a, iconType: t.type });
    steps.push({ text: `Circle ${b} ${t.plural} at a time!`, type: 'visual_grouping', total: a, groupSize: b, iconType: t.type });
    steps.push({ text: `Count the groups! We made ${quotient} groups!`, type: 'result', quotient: quotient, iconType: t.type });

    return { result: quotient, remainder: a % b, steps };
}
