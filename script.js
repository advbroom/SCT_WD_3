const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const modeSelect = document.getElementById('mode');
const themeSelect = document.getElementById('theme');
const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');
const drawSound = document.getElementById('drawSound');
const themeToggle = document.getElementById('themeToggle');
const playerXInput = document.getElementById('playerXName');
const playerOInput = document.getElementById('playerOName');
const leaderboardList = document.getElementById('leaderboardList');

let board = Array(9).fill('');
let currentPlayer = 'X';
let isGameOver = false;
let score = { X: 0, O: 0 };
let icons = { X: '❌', O: '⭕' };

const winningCombinations = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function applyTheme() {
  const selected = themeSelect.value;
  if (selected === 'classic') icons = { X: '❌', O: '⭕' };
  else if (selected === 'emoji') icons = { X: '😼', O: '🐶' };
  else if (selected === 'sunmoon') icons = { X: '🌞', O: '🌙' };
  updateBoardVisuals();
}

function updateBoardVisuals() {
  board.forEach((val, i) => {
    cells[i].textContent = val ? icons[val] : '';
  });
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (board[index] !== '' || isGameOver) return;

  clickSound.play();
  board[index] = currentPlayer;
  updateBoardVisuals();

  if (checkWin()) {
    const name = currentPlayer === 'X' ? playerXInput.value || 'Player X' : playerOInput.value || 'Player O';
    statusText.textContent = `🎉 ${name} Wins!`;
    highlightWin();
    winSound.play();
    score[currentPlayer]++;
    updateScore();
    isGameOver = true;
    saveScore();
    updateLeaderboard(currentPlayer);
  } else if (board.every(cell => cell !== '')) {
    statusText.textContent = "It's a Draw! 😐";
    drawSound.play();
    isGameOver = true;
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    const next = currentPlayer === 'X' ? (playerXInput.value || 'Player X') : (playerOInput.value || 'Player O');
    statusText.textContent = `${next}'s Turn`;
    if (modeSelect.value === 'ai' && currentPlayer === 'O') {
      setTimeout(aiMove, 500);
    }
  }
}

function aiMove() {
  let emptyIndexes = board.map((val, i) => val === '' ? i : null).filter(i => i !== null);
  let move = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  if (move !== undefined) {
    board[move] = 'O';
    updateBoardVisuals();
    clickSound.play();
    if (checkWin()) {
      statusText.textContent = `🤖 AI (O) Wins!`;
      highlightWin();
      winSound.play();
      score.O++;
      updateScore();
      isGameOver = true;
      saveScore();
      updateLeaderboard('O');
    } else if (board.every(cell => cell !== '')) {
      statusText.textContent = "It's a Draw!";
      drawSound.play();
      isGameOver = true;
    } else {
      currentPlayer = 'X';
      statusText.textContent = "Player X's Turn";
    }
  }
}

function highlightWin() {
  const combo = winningCombinations.find(combo => combo.every(i => board[i] === currentPlayer));
  if (combo) combo.forEach(i => cells[i].classList.add('win'));
}

function checkWin() {
  return winningCombinations.some(combo => combo.every(index => board[index] === currentPlayer));
}

function resetGame() {
  board = Array(9).fill('');
  isGameOver = false;
  currentPlayer = 'X';
  statusText.textContent = "Player X's Turn";
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('win');
  });
  if (modeSelect.value === 'ai' && currentPlayer === 'O') aiMove();
}

function updateScore() {
  scoreXEl.textContent = score.X;
  scoreOEl.textContent = score.O;
}

function saveScore() {
  localStorage.setItem('tictoe-score', JSON.stringify(score));
}

function loadScore() {
  const stored = localStorage.getItem('tictoe-score');
  if (stored) {
    score = JSON.parse(stored);
    updateScore();
  }
}

function updateLeaderboard(winner) {
  const playerName = winner === 'X' ? playerXInput.value || 'Player X' : playerOInput.value || 'Player O';
  let history = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  history.push({ name: playerName, time: new Date().toLocaleString() });
  history = history.slice(-5);
  localStorage.setItem('leaderboard', JSON.stringify(history));
  renderLeaderboard();
}

function renderLeaderboard() {
  const history = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  leaderboardList.innerHTML = history
    .map(item => `<li>${item.name} - ${item.time}</li>`)
    .reverse()
    .join('');
}

// DARK/LIGHT MODE
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
});

function loadTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') document.body.classList.add('light-mode');
}

// Initial setup
cells.forEach(cell => cell.addEventListener('click', handleClick));
resetBtn.addEventListener('click', resetGame);
themeSelect.addEventListener('change', applyTheme);
modeSelect.addEventListener('change', resetGame);

loadScore();
applyTheme();
loadTheme();
renderLeaderboard();