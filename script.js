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
    let score = 0;

    const nonZero = row.filter(cell => cell !== 0);

    if (nonZero.length === 0) {
        return { newRow: Array(row.length).fill(0), score: 0 };
    }

    const newRow = [];
    let i = 0;

    while (i < nonZero.length) {
        if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
            newRow.push(nonZero[i] * 2);
            score += nonZero[i] * 2;
            i += 2;
        }
        else {
            newRow.push(nonZero[i]);
            i += 1;
        }
    }

    while (newRow.length < row.length) {
        newRow.push(0);
    }

    return { newRow, score };
}

function moveRowRight(row) {
    let score = 0;

    const nonZero = row.filter(cell => cell !== 0);

    if (nonZero.length === 0) {
        return { newRow: Array(row.length).fill(0), score: 0 };
    }

    const newRow = [];
    let i = nonZero.length - 1;

    while (i >= 0) {
        if (i > 0 && nonZero[i] === nonZero[i - 1]) {
            newRow.unshift(nonZero[i] * 2);
            score += nonZero[i] * 2;
            i -= 2;
        }
        else {
            newRow.unshift(nonZero[i]);
            i -= 1;
        }
    }

    while (newRow.length < row.length) {
        newRow.unshift(0);
    }

    return { newRow, score };
}

function moveColumnUp(column) {
    let score = 0;

    const nonZero = column.filter(cell => cell !== 0);

    if (nonZero.length === 0) {
        return { newColumn: Array(column.length).fill(0), score: 0 };
    }

    const newColumn = [];
    let i = 0;

    while (i < nonZero.length) {
        if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
            newColumn.push(nonZero[i] * 2);
            score += nonZero[i] * 2;
            i += 2;
        }
        else {
            newColumn.push(nonZero[i]);
            i += 1;
        }
    }

    while (newColumn.length < column.length) {
        newColumn.push(0);
    }

    return { newColumn, score };
}

function moveColumnDown(column) {
    let score = 0;

    const nonZero = column.filter(cell => cell !== 0);

    if (nonZero.length === 0) {
        return { newColumn: Array(column.length).fill(0), score: 0 };
    }

    const newColumn = [];
    let i = nonZero.length - 1;

    while (i >= 0) {
        if (i > 0 && nonZero[i] === nonZero[i - 1]) {
            newColumn.unshift(nonZero[i] * 2);
            score += nonZero[i] * 2;
            i -= 2;
        }
        else {
            newColumn.unshift(nonZero[i]);
            i -= 1;
        }
    }

    while (newColumn.length < column.length) {
        newColumn.unshift(0);
    }

    return { newColumn, score };
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

function moveUp(gameState) {
    const newCells = [];
    for (let i = 0; i < gameState.size; i++) {
        newCells.push(Array(gameState.size).fill(0));
    }
    let totalScore = 0;
    let moved = false;

    for (let col = 0; col < gameState.size; col++) {
        const column = [];
        for (let row = 0; row < gameState.size; row++) {
            column.push(gameState.cells[row][col]);
        }

        const originalColumn = [...column];
        const { newColumn, score } = moveColumnUp(column);

        for (let row = 0; row < gameState.size; row++) {
            newCells[row][col] = newColumn[row];
        }
        
        totalScore += score;
        if (!arraysEqual(originalColumn, newColumn)) moved = true;
    }

    return {
        cells: newCells,
        score: gameState.score + totalScore,
        moved: moved,
    };
}

function moveDown(gameState) {
    const newCells = [];
    for (let i = 0; i < gameState.size; i++) {
        newCells.push(Array(gameState.size).fill(0));
    }
    let totalScore = 0;
    let moved = false;

    for (let col = 0; col < gameState.size; col++) {
        const column = [];
        for (let row = 0; row < gameState.size; row++) {
            column.push(gameState.cells[row][col]);
        }

        const originalColumn = [...column];
        const { newColumn, score } = moveColumnDown(column);

        for (let row = 0; row < gameState.size; row++) {
            newCells[row][col] = newColumn[row];
        }
        
        totalScore += score;
        if (!arraysEqual(originalColumn, newColumn)) moved = true;
    }

    return {
        cells: newCells,
        score: gameState.score + totalScore,
        moved: moved,
    };
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

function handleMoveUp(gameState, grid) {
    const result = moveUp(gameState);

    if (result.moved) {
        gameState.cells = result.cells;
        gameState.score = result.score;

        renderGame(gameState, grid);
        gameState.scoreElement.textContent = `Счет: ${gameState.score}`;
        addRandomNumber(gameState, grid);
    }
}

function handleMoveDown(gameState, grid) {
    const result = moveDown(gameState);

    if (result.moved) {
        gameState.cells = result.cells;
        gameState.score = result.score;

        renderGame(gameState, grid);
        gameState.scoreElement.textContent = `Счет: ${gameState.score}`;
        addRandomNumber(gameState, grid);
    }
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
        else if (event.key === 'ArrowUp') {
            event.preventDefault();
            handleMoveUp(gameState, grid);
        }
        else if (event.key === 'ArrowDown') {
            event.preventDefault();
            handleMoveDown(gameState, grid);
        }
    });
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
