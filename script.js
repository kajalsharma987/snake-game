const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScoreElement = document.getElementById("final-score");
const restartButton = document.getElementById("restart-button");
const highScoreElement = document.getElementById("high-score");
const soundToggleButton = document.getElementById("sound-toggle");
const eatSound = new Audio("apple-bite-short.mp3");
const gameOverSound = new Audio("game-over.mp3");

let snake = [
  { x: 200, y: 200 },
  { x: 190, y: 200 },
  { x: 180, y: 200 }
];
let food = generateFood();
let direction = "right";
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let level = 3;
let soundOn = true;
let gameRunning = true;
let touchStartX = 0;
let touchStartY = 0;

highScoreElement.innerHTML = `High Score: ${highScore}`;

function generateFood() {
  return {
    x: Math.floor(Math.random() * 60) * 10,
    y: Math.floor(Math.random() * 60) * 10
  };
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Snake
  snake.forEach((segment) => {
    ctx.fillStyle = "#8bc34a";
    ctx.fillRect(segment.x, segment.y, 10, 10);
  });

  // Food
  ctx.fillStyle = "#ff0000";
  ctx.beginPath();
  ctx.arc(food.x + 5, food.y + 5, 5, 0, Math.PI * 2);
  ctx.fill();

  // Score Display
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`Level: ${level.toFixed(1)}`, 10, 60);
  ctx.fillText(`High Score: ${highScore}`, 10, 90);
}

function update() {
  const head = { ...snake[0] };

  switch (direction) {
    case "right":
      head.x += 10;
      break;
    case "left":
      head.x -= 10;
      break;
    case "up":
      head.y -= 10;
      break;
    case "down":
      head.y += 10;
      break;
  }

  snake.unshift(head);

  // Collision with food
  if (head.x === food.x && head.y === food.y) {
    score++;
    level *= 1.5;
    if (soundOn) eatSound.play();
    food = generateFood();
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      highScoreElement.innerHTML = `High Score: ${highScore}`;
    }
  } else {
    snake.pop();
  }

  // Collision with wall or self
  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height ||
    snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    gameOver();
  }
}

function gameOver() {
  if (soundOn) gameOverSound.play();
  gameRunning = false;
  gameOverScreen.style.display = "block";
  finalScoreElement.textContent = `Your final score is ${score}`;
}

function gameLoop() {
  if (!gameRunning) return;
  update();
  draw();
  setTimeout(gameLoop, 1000 / level);
}

restartButton.addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  resetGame();
  gameLoop();
});

function resetGame() {
  score = 0;
  level = 3;
  snake = [
    { x: 200, y: 200 },
    { x: 190, y: 200 },
    { x: 180, y: 200 }
  ];
  direction = "right";
  food = generateFood();
  gameRunning = true;
}
document.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

document.addEventListener("touchmove", (e) => {
  let touchMoveX = e.touches[0].clientX;
  let touchMoveY = e.touches[0].clientY;

  let diffX = touchMoveX - touchStartX;
  let diffY = touchMoveY - touchStartY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 0 && direction !== "left") {
      direction = "right";
    } else if (diffX < 0 && direction !== "right") {
      direction = "left";
    }
  } else {
    if (diffY > 0 && direction !== "up") {
      direction = "down";
    } else if (diffY < 0 && direction !== "down") {
      direction = "up";
    }
  }

  touchStartX = touchMoveX;
  touchStartY = touchMoveY;
});

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowRight": if (direction !== "left") direction = "right"; break;
        case "ArrowLeft": if (direction !== "right") direction = "left"; break;
        case "ArrowUp": if (direction !== "down") direction = "up"; break;
        case "ArrowDown": if (direction !== "up") direction = "down"; break;
    }
});

soundToggleButton.addEventListener("click", () => {
    soundOn = !soundOn;
    soundToggleButton.textContent = soundOn ? "Sound: ON" : "Sound: OFF";
});

gameLoop();

