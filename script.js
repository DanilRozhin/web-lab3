function createGameBoard() {
    const container = document.createElement('div');
    container.className = 'game-container';
    document.body.appendChild(container);

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

    return { container, gameBoard, grid };
}

function initGame() {
    const { grid } = createGameBoard();

    const gameState = {
        size: 4,
        cells: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
    };

    addRandomNumber(gameState, grid);
    addRandomNumber(gameState, grid);
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

document.addEventListener('DOMContentLoaded', initGame);
