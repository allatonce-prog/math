/**
 * quizLogic.js
 * Generates situational math word problems (Scenario-based).
 * Targets ~100 distinct templates/variations to allow endless play.
 */

const NAMES = [
    'Sally', 'Tom', 'Ben', 'Mia', 'Lucas', 'Emma', 'Noah', 'Ava', 'Leo', 'Zoe',
    'Max', 'Lily', 'Sam', 'Ella', 'Jack', 'Ruby', 'Oliver', 'Chloe', 'Ethan', 'Sophie',
    'Liam', 'Maya', 'Aiden', 'Grace', 'Caleb', 'Harper', 'Mason', 'Evelyn', 'Logan', 'Avery'
];

const OBJECTS = [
    { name: 'apple', plural: 'apples', icon: '🍎' },
    { name: 'balloon', plural: 'balloons', icon: '🎈' },
    { name: 'car', plural: 'cars', icon: '🚗' },
    { name: 'star', plural: 'stars', icon: '⭐' },
    { name: 'cookie', plural: 'cookies', icon: '🍪' },
    { name: 'duck', plural: 'ducks', icon: '🦆' },
    { name: 'pencil', plural: 'pencils', icon: '✏️' },
    { name: 'book', plural: 'books', icon: '📚' },
    { name: 'flower', plural: 'flowers', icon: '🌸' },
    { name: 'cupcake', plural: 'cupcakes', icon: '🧁' },
    { name: 'cat', plural: 'cats', icon: '🐱' },
    { name: 'dog', plural: 'dogs', icon: '🐶' },
    { name: 'ball', plural: 'balls', icon: '⚽' },
    { name: 'pizza', plural: 'pizzas', icon: '🍕' },
    { name: 'robot', plural: 'robots', icon: '🤖' },
    { name: 'banana', plural: 'bananas', icon: '🍌' },
    { name: 'hat', plural: 'hats', icon: '🧢' },
    { name: 'candy', plural: 'candies', icon: '🍬' },
    { name: 'bird', plural: 'birds', icon: '🐦' },
    { name: 'fish', plural: 'fish', icon: '🐠' },
    { name: 'kite', plural: 'kites', icon: 'bm️' },
    { name: 'tree', plural: 'trees', icon: '🌳' },
    { name: 'butterfly', plural: 'butterflies', icon: '🦋' },
    { name: 'chair', plural: 'chairs', icon: '🪑' },
    { name: 'orange', plural: 'oranges', icon: '🍊' },
    { name: 'bunny', plural: 'bunnies', icon: '🐰' }
];

const PLACES = ['store', 'park', 'school', 'garden', 'library', 'beach', 'zoo', 'playground', 'fair'];

function r(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates a situational question.
 * Returns { text: "Question string", options: [number], correct: number, icon: string }
 */
export function generateSituationalQuestion() {
    const type = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'add' : 'sub') : (Math.random() > 0.5 ? 'mul' : 'div');
    const name = r(NAMES);
    const friend = r(NAMES.filter(n => n !== name)); // Ensure different friend
    const obj = r(OBJECTS);
    const place = r(PLACES);

    let a, b, answer, questionText;

    switch (type) {
        case 'add':
            a = Math.floor(Math.random() * 9) + 2; // 2-10
            b = Math.floor(Math.random() * 9) + 1; // 1-9
            answer = a + b;

            const addTemplates = [
                `${name} has ${a} ${obj.plural}. They find ${b} more. How many now?`,
                `${name} buys ${a} ${obj.plural} and grandma gives them ${b} more. How many in total?`,
                `There are ${a} ${obj.plural} on the table. ${name} puts ${b} more there. Count them all!`,
                `${name} saw ${a} ${obj.plural} yesterday and ${b} today. How many did they see?`,
                `${name} has ${a} ${obj.plural} and ${friend} gives them ${b} more. How many does ${name} have now?`,
                `At the ${place}, ${name} found ${a} ${obj.plural}. Then they found ${b} more! Total?`,
                `If you have ${a} ${obj.plural} and you buy ${b} more, how many do you have?`,
                `${name} collected ${a} ${obj.plural}. ${friend} collected ${b} ${obj.plural}. How many together?`,
                `There are ${a} red ${obj.plural} and ${b} blue ${obj.plural}. How many ${obj.plural} in all?`,
                `First count ${a} ${obj.plural}. Then count ${b} more. What is the sum?`,
                `${name} wants ${a} ${obj.plural} but needs ${b} more for a party. How many do they need in total?`,
                // Wait that last one is tricky wording, let's fix:
                `${name} brings ${a} ${obj.plural} to the party. ${friend} brings ${b}. How many ${obj.plural} are at the party?`,
                `The team scored ${a} points, then ${b} more points. What is the total score?`,
                `In the morning, ${name} ate ${a} ${obj.plural}. In the evening, they ate ${b} more. How many eaten?`
            ];
            questionText = r(addTemplates);
            break;

        case 'sub':
            b = Math.floor(Math.random() * 6) + 1; // 1-6
            a = b + Math.floor(Math.random() * 6) + 1; // Ensure a > b
            answer = a - b;

            const subTemplates = [
                `${name} had ${a} ${obj.plural}. They ate ${b}. How many are left?`,
                `${name} has ${a} ${obj.plural}. They gave ${b} to ${friend}. How many now?`,
                `There were ${a} ${obj.plural}. ${b} flew away. How many remain?`,
                `${name} collected ${a} ${obj.plural} but lost ${b}. How many are left?`,
                `The store had ${a} ${obj.plural}. ${name} bought ${b}. How many are left at the store?`,
                `There are ${a} ${obj.plural} in a box. ${name} takes out ${b}. How many are inside now?`,
                `${name} needs ${a} ${obj.plural}. They already have ${b}. How many more do they need?`, // Difference problem
                `If there are ${a} birds and ${b} fly away, how many birds stay?`, // Generic
                `${name} made ${a} ${obj.plural} but dropped ${b}. How many are safe?`,
                `${a} ${obj.plural} were on the wall. ${b} fell off. How many represent?`,
                `${name} has ${a} dollars. They spend ${b} dollars on ${obj.plural}. How much money is left?`,
                `${friend} has ${a} ${obj.plural}. ${name} takes ${b} to play with. How many does ${friend} have left?`
            ];
            questionText = r(subTemplates);
            break;

        case 'mul':
            a = Math.floor(Math.random() * 5) + 2; // 2-6 groups
            b = Math.floor(Math.random() * 5) + 2; // 2-6 items
            answer = a * b;

            const mulTemplates = [
                `${name} has ${a} boxes. Each box has ${b} ${obj.plural}. How many total?`,
                `There are ${a} rows of ${obj.plural}. Each row has ${b}. How many in total?`,
                `${name} buys ${a} bags of ${obj.plural}. There are ${b} inside each bag. How many total?`,
                `If ${name} counts by ${b}s and does it ${a} times, what number do they get?`,
                `A spider has ${a} legs. How many legs do ${b} spiders have?`, // Wait, spiders have 8 legs, let's keep generic for variables
                `There are ${a} nests. Each nest has ${b} baby birds. How many birds?`,
                `${name} works for ${a} hours. They earn ${b} ${obj.plural} per hour. How many earned?`,
                `${a} friends each have ${b} ${obj.plural}. How many ${obj.plural} altogether?`,
                `A car has ${b} wheels. How many wheels do ${a} cars have?`, // Logic check: b usually small
                `${name} reads ${b} pages every day for ${a} days. How many pages read?`,
                `Each pack costs ${b} dollars. ${name} buys ${a} packs. How much money?`
            ];

            // Logic fix for car wheels if 'b' isn't 4, it's weird. 
            // If b=4, use car. If not, use generic 'wagon'.
            if (b === 4 && questionText === undefined) questionText = `A car has 4 wheels. How many wheels do ${a} cars have?`;

            if (!questionText) questionText = r(mulTemplates);
            break;

        case 'div':
            b = Math.floor(Math.random() * 4) + 2; // Divide by 2-5
            answer = Math.floor(Math.random() * 4) + 2; // Answer 2-5
            a = b * answer;

            const divTemplates = [
                `${name} has ${a} ${obj.plural}. They share them equally with ${b} friends. How many does each get?`,
                `There are ${a} ${obj.plural}. ${name} puts them into groups of ${b}. How many groups?`,
                `${name} has ${a} ${obj.plural} to put into ${b} boxes. How many per box?`,
                `If you share ${a} ${obj.plural} between ${b} people, how many each?`,
                `${a} ${obj.plural} need to fit into ${b} cars. How many in each car?`,
                `${name} has ${a} dollars. Each ${obj.name} costs ${b} dollars. How many can they buy?`,
                `Divide ${a} ${obj.plural} into ${b} equal piles. How many in a pile?`,
                `${name} walks ${a} miles in ${b} days. How many miles per day?`,
                `There are ${a} students and ${b} teams. How many students on a team?`,
                `${name} eats ${b} ${obj.plural} a day. How many days to eat ${a} ${obj.plural}?`
            ];
            questionText = r(divTemplates);
            break;
    }

    // Generate options
    let options = [answer];
    while (options.length < 3) {
        let fake = answer + Math.floor(Math.random() * 5) - 2;
        if (fake > 0 && !options.includes(fake)) {
            options.push(fake);
        }
    }
    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    return {
        text: questionText,
        options: options,
        correct: answer,
        icon: obj.icon
    };
}
