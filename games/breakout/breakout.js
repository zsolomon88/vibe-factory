
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const stage = document.getElementById('stage');
const menu = document.getElementById('menu');
const startMenu = document.getElementById('start-menu');
const endMenu = document.getElementById('end-menu');
const startGameBtn = document.getElementById('startGame');
const restartGameBtn = document.getElementById('restartGame');
const countdownEl = document.getElementById('countdown');
const playerNameInput = document.getElementById('playerName');
const playerInfoEl = document.getElementById('player-info');
const livesInfoEl = document.getElementById('lives-info');
const endTitleEl = document.getElementById('end-title');
const endMessageEl = document.getElementById('end-message');

let animationFrameId;
let gameRunning = false;

// Game settings
const settings = {
    paddleWidth: 100,
    paddleHeight: 20,
    paddleSpeed: 8,
    ballRadius: 10,
    brickRowCount: 5,
    brickColumnCount: 6, // Changed from 8
    brickWidth: 100, // Changed from 75
    brickHeight: 24, // Changed from 20
    brickPadding: 12, // Changed from 10
    brickOffsetTop: 60, // Increased from 30
    brickOffsetLeft: 30,
};

// Difficulty levels
const difficultyLevels = {
    easy: { lives: 5, ballSpeed: 4 },
    medium: { lives: 3, ballSpeed: 5 },
    hard: { lives: 1, ballSpeed: 6 },
};

let player = {
    name: 'Player 1',
    score: 0,
    lives: 3,
};

let paddle = {
    x: 0,
    y: 0,
    width: settings.paddleWidth,
    height: settings.paddleHeight,
    speed: settings.paddleSpeed,
    dx: 0,
};

let ball = {
    x: 0,
    y: 0,
    radius: settings.ballRadius,
    speed: 5,
    dx: 4,
    dy: -4,
    trail: [],
};

let bricks = [];
let particles = []; // Array to hold particles
let roundOver = false; // To pause game logic for animations

const darkThemeColors = ['#58a6ff', '#1f6feb', '#e3b341', '#a371f7', '#7ee787'];
const lightThemeColors = ['#0d47a1', '#1976d2', '#f57c00', '#6a1b9a', '#2e7d32'];

function getBrickColor(row) {
    const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
    const colors = isLightTheme ? lightThemeColors : darkThemeColors;
    return colors[row];
}

function getPaddleColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
}

function initGame() {
    resizeCanvas();
    resetPlayer();
    resetPaddle();
    createBricks();
    updateScoreboard();
    draw();
}

function resizeCanvas() {
    canvas.width = stage.clientWidth;
    canvas.height = stage.clientHeight;
}

function resetPlayer() {
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    player.name = playerNameInput.value || 'Player 1';
    player.score = 0;
    player.lives = difficultyLevels[difficulty].lives;
    ball.speed = difficultyLevels[difficulty].ballSpeed;
}

function resetPaddle() {
    paddle.x = (canvas.width - paddle.width) / 2;
    paddle.y = canvas.height - paddle.height - 40; // Increased from 20
    paddle.dx = 0; // Also reset horizontal movement
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = paddle.y - ball.radius - 5;
    ball.dx = ball.speed * (Math.random() < 0.5 ? 1 : -1);
    ball.dy = -ball.speed;
    ball.trail = []; // Clear the trail
}

function createBricks() {
    bricks = [];
    for (let c = 0; c < settings.brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < settings.brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function updateScoreboard() {
    playerInfoEl.innerHTML = `<span>${player.name}</span> <span class="sep">|</span> ${player.score}`;
    livesInfoEl.innerHTML = `<span>Lives</span> <span class="sep">|</span> ${player.lives}`;
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = getPaddleColor();
    ctx.fill();
    ctx.closePath();
}

function drawBall() {
    // Don't draw ball if game isn't running (i.e. during countdown) or if round is over (explosion)
    if (!gameRunning || roundOver) return;

    // Draw trail
    for (let i = 0; i < ball.trail.length; i++) {
        const p = ball.trail[i];
        const opacity = (i + 1) / ball.trail.length * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 224, 184, ${opacity})`;
        ctx.fill();
        ctx.closePath();
    }

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = getPaddleColor();
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < settings.brickColumnCount; c++) {
        for (let r = 0; r < settings.brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (settings.brickWidth + settings.brickPadding) + settings.brickOffsetLeft;
                const brickY = r * (settings.brickHeight + settings.brickPadding) + settings.brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, settings.brickWidth, settings.brickHeight);
                ctx.fillStyle = getBrickColor(r);
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function createExplosion(x, y) {
    const particleCount = 20;
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: x,
            y: y,
            radius: Math.random() * 3 + 1,
            color: accentColor,
            dx: (Math.random() - 0.5) * 8,
            dy: (Math.random() - 0.5) * 8,
            ttl: 100, // Time to live
            opacity: 1,
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.ttl--;
        p.opacity = p.ttl / 100;

        if (p.ttl <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 224, 184, ${p.opacity})`;
        ctx.fill();
        ctx.closePath();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawBall();
    drawParticles();
}

function movePaddle() {
    paddle.x += paddle.dx;

    if (paddle.x < 0) {
        paddle.x = 0;
    }

    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

function moveBall() {
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 10) {
        ball.trail.shift();
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (left/right)
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }

    // Wall collision (top)
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // Paddle collision
    if (
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y
    ) {
        ball.dy = -ball.speed;
    }

    // Bottom wall collision (lose life)
    if (ball.y + ball.radius > canvas.height) {
        player.lives--;
        updateScoreboard();
        createExplosion(ball.x, paddle.y); // Create explosion
        roundOver = true;

        if (player.lives > 0) {
            stage.classList.add('shake');
            setTimeout(() => stage.classList.remove('shake'), 320);
            setTimeout(startRound, 1500); // Wait for explosion to play out
        } else {
            setTimeout(() => endGame(false), 1500);
        }
        return; // Stop further processing this frame
    }
}

function collisionDetection() {
    for (let c = 0; c < settings.brickColumnCount; c++) {
        for (let r = 0; r < settings.brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (
                    ball.x > b.x &&
                    ball.x < b.x + settings.brickWidth &&
                    ball.y > b.y &&
                    ball.y < b.y + settings.brickHeight
                ) {
                    ball.dy *= -1;
                    b.status = 0;
                    player.score++;
                    updateScoreboard();

                    if (player.score === settings.brickRowCount * settings.brickColumnCount) {
                        endGame(true);
                    }
                }
            }
        }
    }
}

function update() {
    if (!roundOver) {
        movePaddle();
        moveBall();
        collisionDetection();
    }
    updateParticles();
    draw();

    if (gameRunning) {
        animationFrameId = requestAnimationFrame(update);
    }
}

function keyDown(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        paddle.dx = paddle.speed;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        paddle.dx = -paddle.speed;
    }
}

function keyUp(e) {
    if (
        e.key === 'Right' ||
        e.key === 'ArrowRight' ||
        e.key.toLowerCase() === 'd' ||
        e.key === 'Left' ||
        e.key === 'ArrowLeft' ||
        e.key.toLowerCase() === 'a'
    ) {
        paddle.dx = 0;
    }
}

// Event listeners
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
window.addEventListener('resize', () => {
    resizeCanvas();
    draw();
});

startGameBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    initGame();
    startRound();
});

restartGameBtn.addEventListener('click', () => {
    endMenu.style.display = 'none';
    startMenu.style.display = 'block';
    menu.style.display = 'grid';
});

const themeChangeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
            draw();
        }
    });
});

themeChangeObserver.observe(document.documentElement, { attributes: true });

function startRound() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    resetBall();
    resetPaddle(); // Center the paddle
    roundOver = false; // Reset for the new round
    draw();
    countdown();
}

function countdown() {
    const textEl = countdownEl.querySelector('.countdown-text');
    let count = 3;

    function show(text) {
        textEl.textContent = text;
        textEl.classList.add('show');
        setTimeout(() => textEl.classList.remove('show'), 800);
    }

    const timer = setInterval(() => {
        if (count > 0) {
            show(count);
            count--;
        } else {
            clearInterval(timer);
            show('START!');
            setTimeout(() => {
                gameRunning = true;
                update();
            }, 1000);
        }
    }, 1000);
}

function endGame(isWin) {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);

    if (isWin) {
        endTitleEl.textContent = 'You Win!';
        endMessageEl.textContent = `Congratulations, ${player.name}! You destroyed all the bricks.`;
    } else {
        endTitleEl.textContent = 'Game Over!';
        endMessageEl.textContent = `Better luck next time, ${player.name}!`;
    }

    startMenu.style.display = 'none';
    endMenu.style.display = 'block';
    menu.style.display = 'grid';
}

// Initialize
initGame();
