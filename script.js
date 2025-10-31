// Audios
const flapSound = document.getElementById("flapSound");
const pointSound = document.getElementById("pointSound");
const hitSound = document.getElementById("hitSound");
const bgMusic = document.getElementById("bgMusic");
const startFlySound = document.getElementById("startFlySound");
let firstStartPlayed = false; // flag to track if it's already played


// Valid variables
const bird = document.getElementById("bird");
const gamePath = document.getElementById("gamepath");
const gameOverText = document.getElementById("gameOver");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");

// Physics
let gravity = 0.5;
let lift = -8;
let velocity = 0;
let position = 100;

// Game state
let gameRunning = false;
let gameOver = false;
let scrollSpeed = 3;
let backgroundX = 0;
let pipes = [];
let lastPipeTime = 0;
const pipeInterval = 2000; // minimum 2s between pipes
let score = 0;
let highScore = sessionStorage.getItem("highScore") || 0;
highScoreDisplay.textContent = highScore;


// Detect device type for instructions
const startText = document.getElementById("startText");

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

const isMobile = screenWidth <= 900 && screenHeight <= 1400;

startText.textContent = isMobile
    ? "👆 Tap the screen to start!"
    : "🕹️ Press Spacebar or Click to start!";


// Generate clouds
for (let i = 0; i < 60; i++) {
    const cloud = document.createElement("div");
    cloud.classList.add("cloud");
    cloud.style.marginTop = Math.random() * 200 + "px";
    cloud.style.transform = `scale(${0.8 + Math.random() * 1.2})`;
    gamePath.appendChild(cloud);
}

// Genarating pipes as obstacle
function createPipe() {
    const gapHeight = 180; // consistent vertical gap
    const birdHeight = 50;
    const safeGap = gapHeight + birdHeight; // total passable gap
    const minTop = 80;
    const maxTop = window.innerHeight - safeGap - 80;
    const topHeight = Math.floor(Math.random() * (maxTop - minTop) + minTop);
    const bottomHeight = window.innerHeight - topHeight - safeGap;

    const topPipe = document.createElement("div");
    topPipe.classList.add("pipe", "top");
    topPipe.style.height = topHeight + "px";
    topPipe.style.top = "0px";
    topPipe.style.left = window.innerWidth + "px";

    const bottomPipe = document.createElement("div");
    bottomPipe.classList.add("pipe", "bottom");
    bottomPipe.style.height = bottomHeight + "px";
    bottomPipe.style.bottom = "0px";
    bottomPipe.style.left = window.innerWidth + "px";

    document.body.appendChild(topPipe);
    document.body.appendChild(bottomPipe);
    pipes.push({ top: topPipe, bottom: bottomPipe, passed: false });
}

// === GAME LOOP ===
function gameLoop(timestamp) {
    if (!gameRunning || gameOver) return;

    // Gravity
    velocity += gravity;
    position += velocity;
    bird.style.top = position + "px";

    // Boundaries
    if (position >= window.innerHeight - 50 || position <= 0) {
        endGame();
    }

    // Scroll background
    backgroundX -= scrollSpeed;
    gamePath.style.transform = `translateX(${backgroundX}px)`;

    // Pipe movement
    pipes.forEach((pipe) => {
        const left = parseFloat(pipe.top.style.left);
        pipe.top.style.left = left - scrollSpeed + "px";
        pipe.bottom.style.left = left - scrollSpeed + "px";

        // Collision detection
        const birdRect = bird.getBoundingClientRect();
        const topRect = pipe.top.getBoundingClientRect();
        const bottomRect = pipe.bottom.getBoundingClientRect();

        const hitTop =
            birdRect.right > topRect.left &&
            birdRect.left < topRect.right &&
            birdRect.top < topRect.bottom;

        const hitBottom =
            birdRect.right > bottomRect.left &&
            birdRect.left < bottomRect.right &&
            birdRect.bottom > bottomRect.top;

        if (hitTop || hitBottom) {
            endGame();
        }

        // Score update
        if (!pipe.passed && left + 80 < birdRect.left) {
            pipe.passed = true;
            score++;
            scoreDisplay.textContent = score;
            pointSound.currentTime = 0;
            pointSound.play();
            if (score > highScore) {
                highScore = score;
                sessionStorage.setItem("highScore", highScore);
                highScoreDisplay.textContent = highScore;
            }
        }

        // Remove off-screen pipes
        if (left < -100) {
            pipe.top.remove();
            pipe.bottom.remove();
        }
    });

    // Add pipes at regular distance (controlled timing)
    if (timestamp - lastPipeTime > pipeInterval) {
        createPipe();
        lastPipeTime = timestamp;
    }

    requestAnimationFrame(gameLoop);
}

function startGame() {
    if (gameOver) return;

    startText.style.display = "none";

    // Play "fly" sound only once at the very first click
    if (!firstStartPlayed) {
        startFlySound.currentTime = 0;
        startFlySound.play();
        firstStartPlayed = true;
    }

    if (!gameRunning) {
        gameRunning = true;
        setTimeout(() => {
        bgMusic.play();
        }, 600);
        requestAnimationFrame(gameLoop);
    }
    
    velocity = lift;
    flapSound.currentTime = 0;
    flapSound.play();
}

function endGame() {
    gameOver = true;
    gameRunning = false;
    hitSound.play();
    bgMusic.pause(); // stop background music
    gameOverText.style.display = "block";
}

document.addEventListener("click", startGame);
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        startGame();
    }
});