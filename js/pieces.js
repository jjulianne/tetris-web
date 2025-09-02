const COLORS = {
    I: "#00f0f0",
    J: "#0000f0",
    L: "#f0a000",
    O: "#f0f000",
    S: "#00f000",
    T: "#a000f0",
    Z: "#f00000"
};

const SHAPES = {
    I: [
        [[0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]],
    ],
    J: [
        [[1,0,0],
        [1,1,1],
        [0,0,0]]
    ],
    L: [
        [[0,0,1],
        [1,1,1],
        [0,0,0]]
    ],
    O: [
        [[1,1],
        [1,1]]
    ],
    S: [
        [[0,1,1],
        [1,1,0],
        [0,0,0]]
    ],
    T: [
        [[0,1,0],
        [1,1,1],
        [0,0,0]]
    ],
    Z: [
        [[1,1,0],
        [0,1,1],
        [0,0,0]]
    ]
};

export function randomPiece() {
    const keys = Object.keys(SHAPES);
    const randKey = keys[Math.floor(Math.random() * keys.length)];
    return {
        shape: SHAPES[randKey][0],
        color: COLORS[randKey],
        x: 3,
        y: 0,
        type: randKey
    };
}

export const HOLD_OFFSETS = {
    'I': { x: 0.5, y: 1.5 },
    'O': { x: 1, y: 1 },
    'T': { x: 1, y: 1 },
    'J': { x: 1, y: 1 },
    'L': { x: 1, y: 1 },
    'S': { x: 1, y: 1 },
    'Z': { x: 1, y: 1 }
};

