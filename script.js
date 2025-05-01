const gameBoard = document.getElementById("game-board");
const startBtn = document.getElementById("start-btn");
const scoreDisplay = document.getElementById("score");
const messageDisplay = document.getElementById("message");
const diffButtons = document.querySelectorAll('.diff-btn');

// Emoji pairs - we'll use different amounts based on difficulty
const allShapes = ["🐶", "🐱", "🚗", "🚲", "⚽", "🏀", "🍎", "🍕", "🐼", "🦁", "✈️", "🚀", "🏈", "🎾", "🍌", "🍔"];

// Game settings by difficulty
const difficultySettings = {
  easy: { pairs: 4, columns: 4 },
  medium: { pairs: 6, columns: 4 },
  hard: { pairs: 8, columns: 5 }
};

let currentDifficulty = 'easy';

// Sound effects with multiple fallback sources
const soundUrls = {
  flip: [
    "https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3",
    "https://www.soundjay.com/buttons/sounds/button-09.mp3"
  ],
  match: [
    "https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3",
    "https://www.soundjay.com/buttons/sounds/button-21.mp3"
  ],
  win: [
    "https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3",
    "https://www.soundjay.com/human/sounds/applause-01.mp3"
  ]
};

// Sound objects
const sounds = {
  flip: new Audio(),
  match: new Audio(),
  win: new Audio()
};

// Load sounds with fallback
function loadSound(soundName) {
  const sound = sounds[soundName];
  let currentSource = 0;
  
  sound.src = soundUrls[soundName][currentSource];
  sound.load();
  
  sound.onerror = function() {
    if (currentSource < soundUrls[soundName].length - 1) {
      currentSource++;
      sound.src = soundUrls[soundName][currentSource];
      sound.load();
    }
  };
}

// Preload all sounds
Object.keys(sounds).forEach(loadSound);

let cards = [];
let flippedCards = [];
let score = 0;
let canFlip = true;

// Set difficulty
function setDifficulty(difficulty) {
  currentDifficulty = difficulty;
  
  // Update active button styling
  diffButtons.forEach(btn => {
    if (btn.dataset.diff === difficulty) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // If game is already running, restart with new difficulty
  if (cards.length > 0) {
    initGame();
  }
}

// Initialize game
function initGame() {
  gameBoard.innerHTML = "";
  score = 0;
  scoreDisplay.textContent = score;
  messageDisplay.textContent = "Game started! Find matches!";
  flippedCards = [];
  canFlip = true;
  
  const settings = difficultySettings[currentDifficulty];
  const selectedShapes = allShapes.slice(0, settings.pairs);
  const cardPairs = [...selectedShapes, ...selectedShapes];
  cardPairs.sort(() => Math.random() - 0.5);
  
  // Set grid columns based on difficulty
  gameBoard.style.gridTemplateColumns = `repeat(${settings.columns}, 1fr)`;
  
  cardPairs.forEach((shape, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.shape = shape;
    card.addEventListener("click", () => flipCard(card));
    gameBoard.appendChild(card);
  });
  
  cards = document.querySelectorAll(".card");
}

// Play sound with error handling
function playSound(soundName) {
  const sound = sounds[soundName];
  sound.currentTime = 0;
  sound.play().catch(e => {
    console.log("Sound error:", e);
    // Try loading again if fails
    loadSound(soundName);
  });
}

// Flip card
function flipCard(card) {
  if (!canFlip || card.classList.contains("flipped") || flippedCards.length >= 2) return;
  
  playSound("flip");
  card.classList.add("flipped");
  card.textContent = card.dataset.shape;
  flippedCards.push(card);
  
  if (flippedCards.length === 2) {
    checkMatch();
  }
}

// Check match
function checkMatch() {
  canFlip = false;
  
  setTimeout(() => {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.shape === card2.dataset.shape) {
      playSound("match");
      card1.classList.add("matched");
      card2.classList.add("matched");
      score++;
      scoreDisplay.textContent = score;
      messageDisplay.textContent = "Match found! 🎉";
      
      if (document.querySelectorAll(".matched").length === cards.length) {
        winGame();
      }
    } else {
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      card1.textContent = "";
      card2.textContent = "";
      messageDisplay.textContent = "Try again!";
    }
    
    flippedCards = [];
    canFlip = true;
  }, 500);
}

// Win game
function winGame() {
  playSound("win");
  messageDisplay.textContent = `You won with ${score} points! 🏆`;
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  });
}

// Event listeners
startBtn.addEventListener("click", initGame);

diffButtons.forEach(btn => {
  btn.addEventListener('click', () => setDifficulty(btn.dataset.diff));
});

// Initialize with easy difficulty
setDifficulty('easy');