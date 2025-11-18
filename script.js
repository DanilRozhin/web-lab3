function createGameBoard() {
    const container = document.createElement('div');
    container.className = 'game-container';
    document.body.appendChild(container);

    const topPanel = document.createElement('div');
    topPanel.className = 'top-panel';
    container.appendChild(topPanel);

    const scoreElement = document.createElement('div');
    scoreElement.className = 'score';
    scoreElement.textContent = 'Счет: 0';
    topPanel.appendChild(scoreElement);

    const leaderboardBtn = document.createElement('button');
    leaderboardBtn.className = 'leaderboard-btn';
    leaderboardBtn.textContent = 'Таблица лидеров';
    topPanel.appendChild(leaderboardBtn);

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

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buttons-container';
    container.appendChild(buttonsContainer);

    const undoBtn = document.createElement('button');
    undoBtn.className = 'undo-btn';
    undoBtn.textContent = 'Отменить ход';
    buttonsContainer.appendChild(undoBtn);

    const restartGameBtn = document.createElement('button');
    restartGameBtn.className = 'restart-game-btn';
    restartGameBtn.textContent = 'Начать заново';
    buttonsContainer.appendChild(restartGameBtn);

    const { modal, message, restartBtn } = createModal();

    return { 
        container, 
        gameBoard, 
        grid, 
        scoreElement, 
        modal, 
        message, 
        restartBtn, 
        undoBtn, 
        restartGameBtn,
        leaderboardBtn 
    };
}

function initGame() {
    const { 
        grid, 
        scoreElement, 
        modal, 
        message, 
        restartBtn, 
        undoBtn, 
        restartGameBtn,
        leaderboardBtn 
    } = createGameBoard();

    const gameState = {
        size: 4,
        cells: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        score: 0,
        scoreElement: scoreElement,
        previousState: null
    };

    addRandomNumber(gameState, grid);
    if (Math.random() > 0.5) {
        addRandomNumber(gameState, grid);
    }
    if (Math.random() < 0.3) {
        addRandomNumber(gameState, grid);
    }

    saveGameState(gameState);

    undoBtn.addEventListener('click', () => {
        undoMove(gameState, grid);
    });

    restartGameBtn.addEventListener('click', () => {
        restartGame(gameState, grid, modal);
    });

    restartBtn.addEventListener('click', () => {
        hideModal(modal);
        restartGame(gameState, grid, modal);
    });

    leaderboardBtn.addEventListener('click', () => {
        showLeaderboard(gameState);
    });

    setupKeyboardControls(gameState, grid, modal, message);
}

function showLeaderboard(gameState) {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    
    const leaderboardModal = document.createElement('div');
    leaderboardModal.className = 'modal leaderboard-modal';
    leaderboardModal.style.display = 'flex';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const title = document.createElement('h2');
    title.textContent = 'Таблица лидеров';
    
    const leaderboardList = document.createElement('div');
    leaderboardList.className = 'leaderboard-list';
    
    if (leaderboard.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Пока нет результатов';
        leaderboardList.appendChild(emptyMessage);
    } else {
        const sortedLeaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
        
        sortedLeaderboard.forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.className = 'leaderboard-entry';
            entryElement.textContent = `${index + 1}. ${entry.name} - ${entry.score} (${new Date(entry.date).toLocaleDateString()})`;
            leaderboardList.appendChild(entryElement);
        });
    }
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-leaderboard-btn';
    closeButton.textContent = 'Закрыть';
    closeButton.addEventListener('click', () => {
        leaderboardModal.remove();
    });
    
    modalContent.appendChild(title);
    modalContent.appendChild(leaderboardList);
    modalContent.appendChild(closeButton);
    leaderboardModal.appendChild(modalContent);
    
    document.body.appendChild(leaderboardModal);
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

function handleMoveLeft(gameState, grid, modal, message) {
    const result = moveLeft(gameState);

    if (result.moved) {
        saveGameState(gameState);

        gameState.cells = result.cells;
        gameState.score = result.score;

        renderGame(gameState, grid);
        gameState.scoreElement.textContent = `Счет: ${gameState.score}`;
        addRandomNumber(gameState, grid);
        const emptyCellsCount = countEmptyCells(gameState);
        if (emptyCellsCount >= 5 && Math.random() > 0.5) {
            addRandomNumber(gameState, grid);
        }

        if (isGameOver(gameState)) {
            showGameOverModal(gameState, modal, message);
        }
    } else {
        if (isGameOver(gameState)) {
            showGameOverModal(gameState, modal, message);
        }
    }
}

function handleMoveRight(gameState, grid, modal, message) {
    const result = moveRight(gameState);

    if (result.moved) {
        saveGameState(gameState);
    
        gameState.cells = result.cells;
        gameState.score = result.score;

        renderGame(gameState, grid);
        gameState.scoreElement.textContent = `Счет: ${gameState.score}`;
        addRandomNumber(gameState, grid);
        const emptyCellsCount = countEmptyCells(gameState);
        if (emptyCellsCount >= 5 && Math.random() > 0.5) {
            addRandomNumber(gameState, grid);
        }

        if (isGameOver(gameState)) {
            showGameOverModal(gameState, modal, message);
        }
    } else {
        if (isGameOver(gameState)) {
            showGameOverModal(gameState, modal, message);
        }
    }
}

function handleMoveUp(gameState, grid, modal, message) {
    const result = moveUp(gameState);

    if (result.moved) {
        saveGameState(gameState);
    
        gameState.cells = result.cells;
        gameState.score = result.score;

        renderGame(gameState, grid);
        gameState.scoreElement.textContent = `Счет: ${gameState.score}`;
        addRandomNumber(gameState, grid);
        const emptyCellsCount = countEmptyCells(gameState);
        if (emptyCellsCount >= 5 && Math.random() > 0.5) {
            addRandomNumber(gameState, grid);
        }

        if (isGameOver(gameState)) {
            showGameOverModal(gameState, modal, message);
        }
    } else {        
        if (isGameOver(gameState)) {
            showGameOverModal(gameState, modal, message);
        }
    }
}

function handleMoveDown(gameState, grid, modal, message) {
    const result = moveDown(gameState);

    if (result.moved) {
        saveGameState(gameState);
    
        gameState.cells = result.cells;
        gameState.score = result.score;

        renderGame(gameState, grid);
        gameState.scoreElement.textContent = `Счет: ${gameState.score}`;
        addRandomNumber(gameState, grid);
        const emptyCellsCount = countEmptyCells(gameState);
        if (emptyCellsCount >= 5 && Math.random() > 0.5) {
            addRandomNumber(gameState, grid);
        }

        if (isGameOver(gameState)) {
            showGameOverModal(gameState, modal, message);
        }
    } else {        
        if (isGameOver(gameState)) {
            showGameOverModal(gameState, modal, message);
        }
    }
}

function countEmptyCells(gameState) {
    let count = 0;
    for (let row = 0; row < gameState.size; row++) {
        for (let col = 0; col < gameState.size; col++) {
            if (gameState.cells[row][col] === 0) count++;
        }
    }
    return count;
}


function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'none';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const title = document.createElement('h2');
    title.textContent = 'Игра окончена!';
    
    const message = document.createElement('p');
    message.className = 'final-score-message';
    message.textContent = 'Ваш счет: 0';
    
    const restartBtn = document.createElement('button');
    restartBtn.className = 'restart-btn';
    restartBtn.textContent = 'Новая игра';
    
    modalContent.appendChild(title);
    modalContent.appendChild(message);
    modalContent.appendChild(restartBtn);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
    
    return {
        modal,
        message,
        restartBtn
    };
}

function isGameOver(gameState) {
    for (let row = 0; row < gameState.size; row++) {
        for (let col = 0; col < gameState.size; col++) {
            if (gameState.cells[row][col] === 0) {
                return false;
            }
        }
    }
    
    for (let row = 0; row < gameState.size; row++) {
        for (let col = 0; col < gameState.size; col++) {
            const current = gameState.cells[row][col];
            
            if (col < gameState.size - 1 && current === gameState.cells[row][col + 1]) {
                return false;
            }
            
            if (row < gameState.size - 1 && current === gameState.cells[row + 1][col]) {
                return false;
            }
        }
    }
    
    return true;
}

function showGameOverModal(gameState, modal, message) {
    message.textContent = `Ваш счет: ${gameState.score}`;
    modal.style.display = 'flex';
}

function hideModal(modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
}

function setupKeyboardControls(gameState, grid, modal, message) {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            handleMoveLeft(gameState, grid, modal, message);
        }
        else if (event.key === 'ArrowRight') {
            event.preventDefault();
            handleMoveRight(gameState, grid, modal, message);
        }
        else if (event.key === 'ArrowUp') {
            event.preventDefault();
            handleMoveUp(gameState, grid, modal, message);
        }
        else if (event.key === 'ArrowDown') {
            event.preventDefault();
            handleMoveDown(gameState, grid, modal, message);
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

function restartGame(gameState, grid, modal) {
    if (modal) {
        hideModal(modal);
    }

    gameState.cells = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    gameState.score = 0;
    gameState.scoreElement.textContent = 'Счет: 0';
    gameState.previousState = null;
    
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => tile.remove());
    
    addRandomNumber(gameState, grid);
    if (Math.random() > 0.5) {
        addRandomNumber(gameState, grid);
    }

    if (Math.random() < 0.3) {
        addRandomNumber(gameState, grid);
    }
}

function saveGameState(gameState) {
    gameState.previousState = {
        cells: JSON.parse(JSON.stringify(gameState.cells)),
        score: gameState.score
    };
}

function undoMove(gameState, grid) {
    if (gameState.previousState) {
        gameState.cells = JSON.parse(JSON.stringify(gameState.previousState.cells));
        gameState.score = gameState.previousState.score;
        gameState.scoreElement.textContent = `Счет: ${gameState.score}`;
        
        renderGame(gameState, grid);
        
        gameState.previousState = null;
        return true;
    }
    return false;
}

document.addEventListener('DOMContentLoaded', initGame);
