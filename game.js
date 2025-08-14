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
  let difficulty = "normal"; // 'easy', 'normal', 'hard'

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
  const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');

  // Theme toggle elements
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const themeText = document.getElementById("themeText");

  // Input state
  const keys = { w: false, s: false };

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
    
    // Get selected difficulty
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked');
    difficulty = selectedDifficulty ? selectedDifficulty.value : "normal";
    
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
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "W") keys.w = false;
    if (e.key === "s" || e.key === "S") keys.s = false;
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

  // AI logic: behavior changes based on difficulty
  function updateAI() {
    let targetY = ball.y + BALL_SIZE / 2 - PADDLE_HEIGHT / 2;
    
    if (difficulty === "easy") {
      // Easy mode: AI makes mistakes
      // 1. Slower reaction time
      // 2. Occasionally moves in wrong direction  
      // 3. Sometimes overshoots or undershoots
      
      // Add random mistake chance (10% of the time)
      if (Math.random() < 0.1) {
        // Move in wrong direction occasionally
        targetY = ai.y + (Math.random() - 0.5) * PADDLE_HEIGHT;
      } else if (Math.random() < 0.15) {
        // Add noise to target position (overshoot/undershoot)
        targetY += (Math.random() - 0.5) * PADDLE_HEIGHT * 0.8;
      }
      
      const delta = targetY - ai.y;
      const aiMax = PADDLE_SPEED * 0.7; // Slower than normal
      const step = clamp(delta * 0.08, -aiMax, aiMax); // Slower reaction
      ai.y += step;
      
    } else if (difficulty === "hard") {
      // Hard mode: AI plays strategically
      // 1. Faster reaction time
      // 2. Tries to hit ball at angles that are hard for player
      // 3. Predicts ball movement better
      
      // Predict where ball will be when it reaches AI paddle
      const timeToReach = (ai.x - ball.x) / Math.abs(ball.vx);
      const predictedY = ball.y + ball.vy * timeToReach;
      
      // Try to position paddle to hit ball at strategic angles
      if (ball.vx > 0) { // Ball coming towards AI
        // Aim for edges to make it harder for player
        if (predictedY < FIELD_SIZE / 2) {
          // Ball in upper half, try to hit it even higher
          targetY = predictedY - PADDLE_HEIGHT * 0.3;
        } else {
          // Ball in lower half, try to hit it even lower  
          targetY = predictedY + PADDLE_HEIGHT * 0.3;
        }
      } else {
        // Ball moving away, just track it normally but faster
        targetY = ball.y + BALL_SIZE / 2 - PADDLE_HEIGHT / 2;
      }
      
      const delta = targetY - ai.y;
      const aiMax = PADDLE_SPEED * 1.1; // Faster than normal
      const step = clamp(delta * 0.16, -aiMax, aiMax); // Faster reaction
      ai.y += step;
      
    } else {
      // Normal mode: current behavior
      const delta = targetY - ai.y;
      const aiMax = PADDLE_SPEED * 0.95;
      const step = clamp(delta * 0.12, -aiMax, aiMax);
      ai.y += step;
    }
    
    ai.y = clamp(ai.y, 0, FIELD_SIZE - PADDLE_HEIGHT);
  }

  function updatePlayer() {
    let vy = 0;
    if (keys.w) vy -= PADDLE_SPEED;
    if (keys.s) vy += PADDLE_SPEED;
    player.y = clamp(player.y + vy, 0, FIELD_SIZE - PADDLE_HEIGHT);
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
      const winner = playerScore >= targetScore ? playerName : "AI";
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
      updateAI();
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

  // Theme management
  function initTheme() {
    // Load saved theme from localStorage
    try {
      const savedTheme = localStorage.getItem("neopong:theme");
      if (savedTheme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
        themeIcon.innerHTML =
          '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        themeText.textContent = "Light";
      }
    } catch (_) {}
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", newTheme);

    if (newTheme === "light") {
      themeIcon.innerHTML =
        '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
      themeText.textContent = "Light";
    } else {
      themeIcon.innerHTML =
        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
      themeText.textContent = "Dark";
    }

    // Save theme preference
    try {
      localStorage.setItem("neopong:theme", newTheme);
    } catch (_) {}
  }

  // Initialize
  function init() {
    // Initialize theme
    initTheme();

    // Pre-fill player name and settings from localStorage
    try {
      const saved = localStorage.getItem("neopong:playerName");
      if (saved) playerNameInput.value = saved;
      const savedTarget = localStorage.getItem("neopong:targetScore");
      if (savedTarget && winningScoreInput)
        winningScoreInput.value = savedTarget;
      
      // Load saved difficulty
      const savedDifficulty = localStorage.getItem("neopong:difficulty");
      if (savedDifficulty) {
        difficulty = savedDifficulty;
        const difficultyInput = document.querySelector(`input[name="difficulty"][value="${savedDifficulty}"]`);
        if (difficultyInput) {
          difficultyInput.checked = true;
        }
      }
    } catch (_) {}

    // Persist name, winning score, and difficulty when changed
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
    
    // Save difficulty when changed
    difficultyInputs.forEach(input => {
      input.addEventListener("change", () => {
        try {
          localStorage.setItem("neopong:difficulty", input.value);
        } catch (_) {}
      });
    });

    // Add theme toggle event listener
    themeToggle.addEventListener("click", toggleTheme);

    loop();
  }

  init();
})();
