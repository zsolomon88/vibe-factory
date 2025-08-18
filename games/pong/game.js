(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // Square map size (720x720) already set via HTML
  const FIELD_SIZE = canvas.width; // 720

  // Gameplay constants
  const PADDLE_WIDTH = 16;
  const PADDLE_HEIGHT = 110;
  const BALL_SIZE = 14; // square
  const PLAYER_X = 24; // left paddle x
  const AI_X = FIELD_SIZE - 24 - PADDLE_WIDTH; // right paddle x

  const PADDLE_SPEED = 6.0; // px per frame
  const BALL_START_SPEED = 5.0;
  const BALL_MAX_SPEED = 14.0;
  const BALL_SPEEDUP_ON_HIT = 1.05;
  const TRAIL_MAX_POINTS = 18;

  // State
  let playerName = "Player";
  let playerScore = 0;
  let aiScore = 0;

  const player = { x: PLAYER_X, y: (FIELD_SIZE - PADDLE_HEIGHT) / 2, vy: 0 };
  const ai = { x: AI_X, y: (FIELD_SIZE - PADDLE_HEIGHT) / 2, vy: 0 };
  const ball = {
    x: FIELD_SIZE / 2,
    y: FIELD_SIZE / 2,
    vx: 0,
    vy: 0,
    speed: BALL_START_SPEED,
  };
  let lastHitBy = null; // 'player' | 'ai' | null
  const trailPoints = [];

  // UI elements
  const menu = document.getElementById("menu");
  const menuSub = document.getElementById("menu-sub");
  const startBtn = document.getElementById("startBtn");
  const playerNameInput = document.getElementById("playerName");
  const winningScoreInput = document.getElementById("winningScore");
  const playerLabel = document.getElementById("playerLabel");
  const aiLabel = document.getElementById("aiLabel");
  const playerScoreEl = document.getElementById("playerScore");
  const aiScoreEl = document.getElementById("aiScore");
  const goalFlashEl = document.getElementById("goalFlash");
  const countdownEl = document.getElementById("countdown");
  const countdownTextEl = document.getElementById("countdownText");
  const gameModeSelector = document.querySelector('input[name="gamemode"]:checked');
  const controlsHelp = document.querySelector(".menu-help ul");
  const player2NameField = document.getElementById("player2-name-field");
  const player2NameInput = document.getElementById("player2Name");

  // Theme toggle elements
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const themeText = document.getElementById("themeText");

  // Input state
  const keys = { w: false, s: false, up: false, down: false };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function resetBall(direction = Math.random() > 0.5 ? 1 : -1) {
    ball.x = FIELD_SIZE / 2 - BALL_SIZE / 2;
    ball.y = FIELD_SIZE / 2 - BALL_SIZE / 2;
    ball.speed = BALL_START_SPEED;
    const angle = Math.random() * 0.6 - 0.3; // -0.3..0.3 radians for mild vertical variation
    ball.vx = Math.cos(angle) * ball.speed * direction;
    ball.vy = Math.sin(angle) * ball.speed;
  }

  let targetScore = 3;
  let isPlaying = false;
  let showBall = false;
  let gameMode = "vs-ai";

  function showCountdown(done) {
    if (!countdownEl || !countdownTextEl) {
      done();
      return;
    }
    const steps = ["3", "2", "1", "START!"];
    let idx = 0;
    countdownEl.style.display = "grid";
    countdownEl.setAttribute("aria-hidden", "false");

    const runStep = () => {
      if (idx >= steps.length) {
        countdownEl.style.display = "none";
        countdownEl.setAttribute("aria-hidden", "true");
        done();
        return;
      }
      countdownTextEl.textContent = steps[idx++];
      countdownTextEl.classList.add("show");
      setTimeout(() => {
        countdownTextEl.classList.remove("show");
        setTimeout(runStep, 160);
      }, 520);
    };
    runStep();
  }

  function startRound(direction) {
    isPlaying = false;
    showBall = false;
    // park ball in the center while waiting
    ball.x = FIELD_SIZE / 2 - BALL_SIZE / 2;
    ball.y = FIELD_SIZE / 2 - BALL_SIZE / 2;
    ball.vx = 0;
    ball.vy = 0;
    trailPoints.length = 0;
    lastHitBy = null;
    showCountdown(() => {
      resetBall(direction);
      showBall = true;
      isPlaying = true;
    });
  }

  function centerPaddles() {
    player.y = (FIELD_SIZE - PADDLE_HEIGHT) / 2;
    ai.y = (FIELD_SIZE - PADDLE_HEIGHT) / 2;
  }

  function startGame() {
    const name = playerNameInput.value.trim();
    playerName = name || "Player";
    const parsedTarget = parseInt(
      winningScoreInput && winningScoreInput.value
        ? winningScoreInput.value
        : "3",
      10
    );
    targetScore = Number.isFinite(parsedTarget)
      ? clamp(parsedTarget, 1, 21)
      : 3;
    if (winningScoreInput) winningScoreInput.value = String(targetScore);
    playerLabel.textContent = playerName;
    aiLabel.textContent = "AI";
    playerScore = 0;
    aiScore = 0;
    updateScoreboard();
    centerPaddles();
    menu.style.display = "none";
    if (menuSub)
      menuSub.textContent =
        "Enter your name and winning score, then press Start.";
    gameMode = document.querySelector('input[name="gamemode"]:checked').value;
    if (gameMode === "vs-player") {
      const player2Name = player2NameInput.value.trim() || "Player 2";
      aiLabel.textContent = player2Name;
    }
    startRound(Math.random() > 0.5 ? 1 : -1);
  }

  function updateScoreboard() {
    playerScoreEl.textContent = String(playerScore);
    aiScoreEl.textContent = String(aiScore);
  }

  // Input handlers
  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    if (e.key === "w" || e.key === "W") keys.w = true;
    if (e.key === "s" || e.key === "S") keys.s = true;
    if (e.key === "ArrowUp") keys.up = true;
    if (e.key === "ArrowDown") keys.down = true;
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "W") keys.w = false;
    if (e.key === "s" || e.key === "S") keys.s = false;
    if (e.key === "ArrowUp") keys.up = false;
    if (e.key === "ArrowDown") keys.down = false;
  });

  startBtn.addEventListener("click", () => startGame());
  playerNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startGame();
  });
  if (winningScoreInput) {
    winningScoreInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") startGame();
    });
  }

  document.querySelectorAll('input[name="gamemode"]').forEach((elem) => {
      elem.addEventListener("change", (event) => {
          const mode = event.target.value;
          if (mode === "vs-ai") {
              controlsHelp.innerHTML = `
                  <li>W: move up</li>
                  <li>S: move down</li>
              `;
              player2NameField.style.display = "none";
          } else {
              controlsHelp.innerHTML = `
                  <li>Player 1: W/S</li>
                  <li>Player 2: Up/Down</li>
              `;
              player2NameField.style.display = "block";
          }
      });
  });

  // AI logic: simple proportional controller toward ball y with reaction delay and max speed
  function updateAI() {
    const targetY = ball.y + BALL_SIZE / 2 - PADDLE_HEIGHT / 2;
    const delta = targetY - ai.y;
    const aiMax = PADDLE_SPEED * 0.95;
    const step = clamp(delta * 0.12, -aiMax, aiMax);
    ai.y += step;
    ai.y = clamp(ai.y, 0, FIELD_SIZE - PADDLE_HEIGHT);
  }

  function updatePlayer() {
    let vy = 0;
    if (keys.w) vy -= PADDLE_SPEED;
    if (keys.s) vy += PADDLE_SPEED;
    player.y = clamp(player.y + vy, 0, FIELD_SIZE - PADDLE_HEIGHT);
  }

  function updatePlayer2() {
    let vy = 0;
    if (keys.up) vy -= PADDLE_SPEED;
    if (keys.down) vy += PADDLE_SPEED;
    ai.y = clamp(ai.y + vy, 0, FIELD_SIZE - PADDLE_HEIGHT);
  }

  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  // Trail helpers
  function getTrailRgb() {
    const isLightTheme =
      document.documentElement.getAttribute("data-theme") === "light";
    if (lastHitBy === "player") {
      return isLightTheme ? [30, 41, 59] : [231, 238, 247]; // dark in light theme, light in dark theme
    }
    if (lastHitBy === "ai") return [41, 163, 255]; // blue (same in both themes)
    return isLightTheme ? [0, 184, 148] : [0, 224, 184]; // slightly darker green in light theme
  }

  function updateTrail() {
    if (showBall) {
      trailPoints.push({ x: ball.x, y: ball.y });
      if (trailPoints.length > TRAIL_MAX_POINTS) trailPoints.shift();
    }
  }

  function drawTrail() {
    if (trailPoints.length === 0) return;
    const [r, g, b] = getTrailRgb();
    for (let i = 0; i < trailPoints.length; i++) {
      const p = trailPoints[i];
      const t = (i + 1) / trailPoints.length;
      const alpha = 0.05 + t * 0.35;
      const size = BALL_SIZE * (0.65 + t * 0.35);
      const offset = (BALL_SIZE - size) / 2;
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fillRect(p.x + offset, p.y + offset, size, size);
    }
  }

  // Particle effects for goal animation
  const particles = [];
  function spawnGoalParticles(x, y) {
    const count = 36;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.25;
      const speed = 3 + Math.random() * 4;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 34 + Math.random() * 18,
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= 1;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    const isLightTheme =
      document.documentElement.getAttribute("data-theme") === "light";
    for (const p of particles) {
      const alpha = Math.max(0, Math.min(1, p.life / 40));
      const color = isLightTheme ? [0, 184, 148] : [0, 224, 184]; // slightly darker green in light theme
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
      ctx.fillRect(p.x, p.y, 3, 3);
    }
  }

  function triggerGoalFX(scoredByPlayer) {
    if (goalFlashEl) {
      goalFlashEl.style.opacity = "1";
      setTimeout(() => {
        goalFlashEl.style.opacity = "0";
      }, 200);
    }
    const stage = document.querySelector(".stage-wrapper");
    if (stage) {
      stage.classList.remove("shake");
      // reflow to restart animation
      void stage.offsetHeight;
      stage.classList.add("shake");
    }
    const x = scoredByPlayer ? FIELD_SIZE - 40 : 40;
    const y = FIELD_SIZE / 2;
    spawnGoalParticles(x, y);
  }

  function maybeEndRound() {
    if (playerScore >= targetScore || aiScore >= targetScore) {
      const winner = playerScore >= targetScore ? playerName : (gameMode === "vs-ai" ? "AI" : "Player 2");
      if (menuSub)
        menuSub.textContent = `${winner} wins! Enter details to play again.`;
      menu.style.display = "grid";
      isPlaying = false;
      return true;
    }
    return false;
  }

  function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top/bottom collisions
    if (ball.y <= 0) {
      ball.y = 0;
      ball.vy *= -1;
    } else if (ball.y + BALL_SIZE >= FIELD_SIZE) {
      ball.y = FIELD_SIZE - BALL_SIZE;
      ball.vy *= -1;
    }

    // Paddle collisions
    if (
      rectsOverlap(
        ball.x,
        ball.y,
        BALL_SIZE,
        BALL_SIZE,
        player.x,
        player.y,
        PADDLE_WIDTH,
        PADDLE_HEIGHT
      )
    ) {
      ball.x = player.x + PADDLE_WIDTH; // avoid sticking
      const hitPos = ball.y + BALL_SIZE / 2 - (player.y + PADDLE_HEIGHT / 2);
      const norm = hitPos / (PADDLE_HEIGHT / 2);
      const angle = norm * 0.75; // max ~43 degrees
      const speed = clamp(
        Math.hypot(ball.vx, ball.vy) * BALL_SPEEDUP_ON_HIT,
        BALL_START_SPEED,
        BALL_MAX_SPEED
      );
      ball.vx = Math.cos(angle) * speed;
      ball.vy = Math.sin(angle) * speed;
      lastHitBy = "player";
    } else if (
      rectsOverlap(
        ball.x,
        ball.y,
        BALL_SIZE,
        BALL_SIZE,
        ai.x,
        ai.y,
        PADDLE_WIDTH,
        PADDLE_HEIGHT
      )
    ) {
      ball.x = ai.x - BALL_SIZE;
      const hitPos = ball.y + BALL_SIZE / 2 - (ai.y + PADDLE_HEIGHT / 2);
      const norm = hitPos / (PADDLE_HEIGHT / 2);
      const angle = norm * 0.75;
      const speed = clamp(
        Math.hypot(ball.vx, ball.vy) * BALL_SPEEDUP_ON_HIT,
        BALL_START_SPEED,
        BALL_MAX_SPEED
      );
      ball.vx = -Math.cos(angle) * speed;
      ball.vy = Math.sin(angle) * speed;
      lastHitBy = "ai";
    }

    // Goals
    if (ball.x + BALL_SIZE < 0) {
      aiScore += 1;
      updateScoreboard();
      centerPaddles();
      triggerGoalFX(false);
      if (!maybeEndRound()) startRound(1);
    } else if (ball.x > FIELD_SIZE) {
      playerScore += 1;
      updateScoreboard();
      centerPaddles();
      triggerGoalFX(true);
      if (!maybeEndRound()) startRound(-1);
    }
  }

  function drawNet() {
    ctx.save();
    const isLightTheme =
      document.documentElement.getAttribute("data-theme") === "light";
    ctx.strokeStyle = isLightTheme
      ? "rgba(0,0,0,0.15)"
      : "rgba(255,255,255,0.1)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(FIELD_SIZE / 2, 0);
    ctx.lineTo(FIELD_SIZE / 2, FIELD_SIZE);
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, FIELD_SIZE, FIELD_SIZE);

    const isLightTheme =
      document.documentElement.getAttribute("data-theme") === "light";

    // field border glow
    ctx.save();
    ctx.shadowBlur = 24;
    ctx.shadowColor = isLightTheme
      ? "rgba(0,224,184,0.15)"
      : "rgba(0,224,184,0.25)";
    ctx.strokeStyle = isLightTheme
      ? "rgba(0,0,0,0.1)"
      : "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, FIELD_SIZE - 2, FIELD_SIZE - 2);
    ctx.restore();

    drawNet();

    // paddles with contrasting colors
    ctx.fillStyle = isLightTheme ? "#1e293b" : "#e7eef7"; // player: dark in light theme, light in dark theme
    ctx.fillRect(player.x, player.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = "#29a3ff"; // AI: blue (same in both themes)
    ctx.fillRect(ai.x, ai.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // trail and ball
    drawTrail();
    if (showBall) {
      ctx.fillStyle = isLightTheme ? "#00b894" : "#00e0b8"; // slightly darker green in light theme
      ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
    }
    // particles on top
    drawParticles();
  }

  function update() {
    if (isPlaying) {
      updatePlayer();
      if (gameMode === "vs-ai") {
        updateAI();
      } else {
        updatePlayer2();
      }
      updateBall();
    }
    updateParticles();
    updateTrail();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // Initialize
  function init() {
    // Pre-fill player name from localStorage
    try {
      const saved = localStorage.getItem("neopong:playerName");
      if (saved) playerNameInput.value = saved;
      const savedTarget = localStorage.getItem("neopong:targetScore");
      if (savedTarget && winningScoreInput)
        winningScoreInput.value = savedTarget;
    } catch (_) {}

    // Persist name and winning score when changed
    playerNameInput.addEventListener("change", () => {
        try {
            localStorage.setItem(
                "neopong:playerName",
                playerNameInput.value.trim()
            );
        } catch (_) {}
    });
    if (winningScoreInput) {
        winningScoreInput.addEventListener("change", () => {
            try {
                localStorage.setItem(
                    "neopong:targetScore",
                    winningScoreInput.value.trim()
                );
            } catch (_) {}
        });
    }

    loop();
  }

  init();
})();
