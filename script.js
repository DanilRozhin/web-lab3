function createGameBoard() {
    const container = document.createElement('div');
    container.className = 'game-container';
    document.body.appendChild(container);

    const scoreElement = document.createElement('div');
    scoreElement.className = 'score';
    scoreElement.textContent = 'Счет: 0';
    container.appendChild(scoreElement);

    const gameBoard = document.createElement('div');
    gameBoard.className = 'game-board';
    container.appendChild(gameBoard);

    const grid = document.createElement('div');
    grid.className = 'grid';
    gameBoard.appendChild(grid);

    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        grid.appendChild(cell);
    }

    return { container, gameBoard, grid, scoreElement };
}

function initGame() {
    const { grid, scoreElement } = createGameBoard();

    const gameState = {
        size: 4,
        cells: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        score: 0,
        scoreElement: scoreElement
    };

    addRandomNumber(gameState, grid);
    addRandomNumber(gameState, grid);

    setupKeyboardControls(gameState, grid);
}

function addRandomNumber(gameState, grid) {
    const emptyCells = [];
    for (let row = 0; row < gameState.size; row++) {
        for (let col = 0; col < gameState.size; col++) {
            if (gameState.cells[row][col] === 0) {
                emptyCells.push({row, col});
            }
        }
    }

    if (emptyCells.length === 0) return;

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const {row, col} = emptyCells[randomIndex];
    const value = Math.random() > 0.8 ? 4 : 2;

    gameState.cells[row][col] = value;

    createTile(value, row, col, grid);
}

function createTile(value, row, col, grid) {
    const tile = document.createElement('div');
    tile.className = `tile tile-${value}`;
    tile.textContent = value;
    
    const cellIndex = row * 4 + col;
    const cell = grid.children[cellIndex];
    cell.appendChild(tile);
}

function moveRowLeft(row) {
    let newRow = [...row];
    let score = 0;

    newRow = newRow.filter(cell => cell !== 0);

    for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
            newRow[i] *= 2;
            score += newRow[i];
            newRow.splice(i + 1, 1);
        }
    }

    while (newRow.length < 4) {
        newRow.push(0);
    }

    return { newRow, score };
}

function moveRowRight(row) {
    let newRow = [...row];
    let score = 0;

    newRow = newRow.filter(cell => cell !== 0);

    const mergedRow = [];
    let i = newRow.length - 1;

    while (i >= 0) {
        if (i > 0 && newRow[i] === newRow[i - 1]) {
            mergedRow.unshift(newRow[i] * 2);
            score += newRow[i] * 2;
            i -= 2;
        } else {
            mergedRow.unshift(newRow[i]);
            i -= 1;
        }
    }

    while (mergedRow.length < 4) {
        mergedRow.unshift(0);
    }

    return { newRow: mergedRow, score };
}

function moveLeft(gameState) {
    const newCells = [];
    let totalScore = 0;
    let moved = false;

    for (let row = 0; row < gameState.size; row++) {
        const originalRow = [...gameState.cells[row]];
        const { newRow, score } = moveRowLeft(gameState.cells[row]);

        newCells.push(newRow);
        totalScore += score;

        if (!arraysEqual(originalRow, newRow)) moved = true;
    }

    return {
        cells: newCells,
        score: gameState.score + totalScore,
        moved: moved,
    };
}

function moveRight(gameState) {
    const newCells = [];
    let totalScore = 0;
    let moved = false;

    for (let row = 0; row < gameState.size; row++) {
        const originalRow = [...gameState.cells[row]];
        const { newRow, score } = moveRowRight(gameState.cells[row]);

        newCells.push(newRow);
        totalScore += score;

        if (!arraysEqual(originalRow, newRow)) moved = true;
    }

    return {
        cells: newCells,
        score: gameState.score + totalScore,
        moved: moved,
    };
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function setupKeyboardControls(gameState, grid) {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            handleMoveLeft(gameState, grid);
        }
        else if (event.key === 'ArrowRight') {
            event.preventDefault();
            handleMoveRight(gameState, grid);
        }
    });
}

function handleMoveLeft(gameState, grid) {
    const result = moveLeft(gameState);

    if (result.moved) {
        gameState.cells = result.cells;
        gameState.score = result.score;

        renderGame(gameState, grid);
        gameState.scoreElement.textContent = `Счет: ${gameState.score}`;
        addRandomNumber(gameState, grid);
    }
}

function handleMoveRight(gameState, grid) {
    const result = moveRight(gameState);

    if (result.moved) {
        gameState.cells = result.cells;
        gameState.score = result.score;

        renderGame(gameState, grid);
        gameState.scoreElement.textContent = `Счет: ${gameState.score}`;
        addRandomNumber(gameState, grid);
    }
}


function renderGame(gameState, grid) {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => tile.remove());

    for (let row = 0; row < gameState.size; row++) {
        for (let col = 0; col < gameState.size; col++) {
            if (gameState.cells[row][col] !== 0) {
                createTile(gameState.cells[row][col], row, col, grid);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', initGame);
