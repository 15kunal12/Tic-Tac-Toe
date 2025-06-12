const cells = document.querySelectorAll(".cell");
const resultDiv = document.querySelector(".result");
const restartBtn = document.getElementById("restartBtn");
const playFriendBtn = document.getElementById("playFriendBtn");
const playComputerBtn = document.getElementById("playComputerBtn");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const difficultyContainer = document.querySelector(".difficulty-buttons");

let gameBoard = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;
let playWithComputer = false;

const moveSound = new Audio('move.mp3');
const winSound = new Audio('win.wav');
const loseSound = new Audio('lose.mp3');

const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
];

// Default difficulty
let selectedDifficulty = "medium";

playFriendBtn.addEventListener("click", () => {
  playWithComputer = false;
  difficultyContainer.style.display = "none";
  currentPlayer = "X";
  isGameActive = true;
  resetBoard();
  playFriendBtn.classList.add("active");
  playComputerBtn.classList.remove("active");
  resultDiv.textContent = "";
});

playComputerBtn.addEventListener("click", () => {
  playWithComputer = true;
  difficultyContainer.style.display = "flex";
  currentPlayer = "X";
  isGameActive = true;
  resetBoard();
  playComputerBtn.classList.add("active");
  playFriendBtn.classList.remove("active");
  resultDiv.textContent = "";
});

// Difficulty buttons click handler
difficultyButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    difficultyButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedDifficulty = btn.getAttribute("data-level");
  });
});

// Cell click handler
cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    if (!isGameActive) return;
    const index = cell.getAttribute("data-index");

    if (gameBoard[index] !== "") return;

    if (!playWithComputer || currentPlayer === "X") {
      handleMove(index, cell);
      if (playWithComputer && isGameActive) {
        setTimeout(() => {
          makeComputerMove();
        }, 400);
      }
    }
  });
});

// Restart button
restartBtn.addEventListener("click", () => {
  isGameActive = true;
  currentPlayer = "X";
  resultDiv.textContent = "";
  resetBoard();
});

// Handle a move
function handleMove(index, cell) {
  gameBoard[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());

  moveSound.play();

  if (checkWin(currentPlayer)) {
    isGameActive = false;
    resultDiv.textContent = `Player ${currentPlayer} wins!`;
    winSound.play();
  } else if (gameBoard.every((cell) => cell !== "")) {
    isGameActive = false;
    resultDiv.textContent = "It's a draw!";
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
  }
}

// Reset the board visually and logically
function resetBoard() {
  gameBoard.fill("");
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("x", "o");
  });
}

// Check for win
function checkWin(player) {
  return winPatterns.some((pattern) => {
    return pattern.every((index) => gameBoard[index] === player);
  });
}

// Computer move logic
function makeComputerMove() {
  let move;

  if (selectedDifficulty === "easy") {
    move = getRandomMove();
  } else if (selectedDifficulty === "medium") {
    move = Math.random() < 0.5 ? getRandomMove() : getBestMove();
  } else {
    move = getBestMove();
  }

  if (move !== null) {
    const cell = cells[move];
    handleMove(move, cell);
  }
}

// Get random empty cell index
function getRandomMove() {
  const emptyIndices = gameBoard
    .map((val, idx) => (val === "" ? idx : null))
    .filter((val) => val !== null);

  if (emptyIndices.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * emptyIndices.length);
  return emptyIndices[randomIndex];
}

// Minimax algorithm for best move
function getBestMove() {
  let bestScore = -Infinity;
  let move = null;

  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] === "") {
      gameBoard[i] = "O";
      let score = minimax(gameBoard, 0, false);
      gameBoard[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(board, depth, isMaximizing) {
  if (checkWin("O")) return 10 - depth;
  if (checkWin("X")) return depth - 10;
  if (board.every((cell) => cell !== "")) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "O";
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "X";
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}
