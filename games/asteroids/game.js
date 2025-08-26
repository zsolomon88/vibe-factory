// NeoAsteroids Game Implementation
class NeoAsteroids {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 720;
        this.height = 720;
        
        // Game state
        this.gameRunning = false;
        this.gameStarted = false;
        this.score = 0;
        this.lives = 5;
        this.playerName = 'Space Pilot';
        this.deathAnimationMode = false;
        
        // Game objects
        this.ship = null;
        this.asteroids = [];
        this.lasers = [];
        this.particles = [];
        
        // Timing
        this.lastTime = 0;
        this.asteroidSpawnTimer = 0;
        this.asteroidSpawnInterval = 3000; // 3 seconds
        
        // Input handling
        this.keys = {
            a: false, d: false, w: false, s: false, space: false
        };
        
        // Set global reference for ship to access particles
        window.game = this;
        
        this.setupEventListeners();
        this.updateUI();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Menu controls
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('playerName').addEventListener('input', (e) => {
            this.playerName = e.target.value || 'Space Pilot';
            this.updateUI();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        if (key in this.keys) {
            this.keys[key] = true;
            e.preventDefault();
        }
        if (key === ' ') {
            this.keys.space = true;
            e.preventDefault();
        }
    }
    
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (key in this.keys) {
            this.keys[key] = false;
            e.preventDefault();
        }
        if (key === ' ') {
            this.keys.space = false;
            e.preventDefault();
        }
    }
    
    async startGame() {
        this.hideMenu();
        await this.showCountdown();
        this.initializeGame();
        this.gameRunning = true;
        this.gameStarted = true;
    }
    
    hideMenu() {
        document.getElementById('menu').style.display = 'none';
    }
    
    showMenu() {
        document.getElementById('menu').style.display = 'grid';
        this.gameRunning = false;
        this.gameStarted = false;
    }
    
    async showCountdown() {
        const countdownElement = document.getElementById('countdownOverlay');
        const countdownText = document.getElementById('countdownText');
        
        countdownElement.style.display = 'grid';
        
        const messages = ['3', '2', '1', 'START!'];
        
        for (const message of messages) {
            countdownText.textContent = message;
            countdownText.classList.add('show');
            
            await new Promise(resolve => setTimeout(resolve, 800));
            
            countdownText.classList.remove('show');
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        countdownElement.style.display = 'none';
    }
    
    initializeGame() {
        this.score = 0;
        this.lives = 5;
        this.ship = new Ship(this.width / 2, this.height / 2);
        this.asteroids = [];
        this.lasers = [];
        this.particles = [];
        
        // Delay before spawning first asteroid (2 seconds)
        this.asteroidSpawnTimer = -2000;
        
        this.updateUI();
    }
    
    spawnAsteroid() {
        // Spawn asteroid at random edge position
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch (side) {
            case 0: // top
                x = Math.random() * this.width;
                y = -50;
                break;
            case 1: // right
                x = this.width + 50;
                y = Math.random() * this.height;
                break;
            case 2: // bottom
                x = Math.random() * this.width;
                y = this.height + 50;
                break;
            case 3: // left
                x = -50;
                y = Math.random() * this.height;
                break;
        }
        
        // Random direction towards center with some spread
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const angle = Math.atan2(centerY - y, centerX - x) + (Math.random() - 0.5) * 0.5;
        
        // Randomly choose asteroid size
        const sizes = ['large', 'medium', 'small'];
        const weights = [0.5, 0.3, 0.2]; // 50% large, 30% medium, 20% small
        const random = Math.random();
        let selectedSize = 'large';
        
        if (random < weights[2]) {
            selectedSize = 'small';
        } else if (random < weights[2] + weights[1]) {
            selectedSize = 'medium';
        } else {
            selectedSize = 'large';
        }
        
        // Use proper speed based on size
        const speeds = { large: 0.02, medium: 0.025, small: 0.03 };
        const speed = speeds[selectedSize];
        
        this.asteroids.push(new Asteroid(x, y, selectedSize, Math.cos(angle) * speed, Math.sin(angle) * speed));
    }
    
    updateUI() {
        document.getElementById('playerLabel').textContent = this.playerName;
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.gameRunning) {
            this.update(deltaTime);
        }
        
        this.render();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Always update particles (for death animation)
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return particle.life > 0;
        });
        
        // If in death animation mode, only update particles
        if (this.deathAnimationMode) {
            return;
        }
        
        // Update ship
        if (this.ship) {
            this.ship.update(deltaTime, this.keys, this.width, this.height);
            
            // Ship shooting
            if (this.keys.space && this.ship.canShoot()) {
                this.lasers.push(this.ship.shoot());
            }
        }
        
        // Update asteroids
        this.asteroids.forEach(asteroid => {
            asteroid.update(deltaTime, this.width, this.height);
        });
        
        // Update lasers
        this.lasers = this.lasers.filter(laser => {
            laser.update(deltaTime);
            return laser.isAlive(this.width, this.height);
        });
        
        // Collision detection
        this.checkCollisions();
        
        // Spawn asteroids
        this.asteroidSpawnTimer += deltaTime;
        if (this.asteroidSpawnTimer >= this.asteroidSpawnInterval) {
            this.spawnAsteroid();
            this.asteroidSpawnTimer = 0;
        }
        
        // Check game over
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    checkCollisions() {
        // Laser-asteroid collisions
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                const asteroid = this.asteroids[j];
                
                if (this.isColliding(laser, asteroid)) {
                    // Remove laser
                    this.lasers.splice(i, 1);
                    
                    // Break asteroid and add score
                    this.breakAsteroid(asteroid, j);
                    break;
                }
            }
        }
        
        // Ship-asteroid collisions
        if (this.ship) {
            for (let i = this.asteroids.length - 1; i >= 0; i--) {
                const asteroid = this.asteroids[i];
                
                if (this.isColliding(this.ship, asteroid)) {
                    this.shipDestroyed();
                    break;
                }
            }
        }
    }
    
    isColliding(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (obj1.radius + obj2.radius);
    }
    
    breakAsteroid(asteroid, index) {
        // Remove the asteroid
        this.asteroids.splice(index, 1);
        
        // Add score
        this.score++;
        this.updateUI();
        
        // Create explosion particles
        this.createExplosion(asteroid.x, asteroid.y, asteroid.size);
        
        // If not small, spawn two smaller asteroids
        if (asteroid.size !== 'small') {
            const newSize = asteroid.size === 'large' ? 'medium' : 'small';
            
            for (let i = 0; i < 2; i++) {
                const angle = Math.random() * Math.PI * 2;
                // Use proper speed based on new size
                const speed = newSize === 'medium' ? 0.025 : 0.03;
                this.asteroids.push(new Asteroid(
                    asteroid.x,
                    asteroid.y,
                    newSize,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                ));
            }
        }
    }
    
    createExplosion(x, y, size) {
        const particleCount = size === 'large' ? 12 : size === 'medium' ? 8 : 4;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = 1 + Math.random() * 2;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            ));
        }
    }
    
    async shipDestroyed() {
        this.lives--;
        this.updateUI();
        
        // Create explosion
        this.createExplosion(this.ship.x, this.ship.y, 'large');
        
        // Remove ship temporarily and clear all asteroids
        this.ship = null;
        this.asteroids = [];
        this.lasers = [];
        
        if (this.lives > 0) {
            // Enter death animation mode - game keeps running but only updates particles
            this.deathAnimationMode = true;
            
            // Wait for death animation to complete (particles to fade)
            await new Promise(resolve => setTimeout(resolve, 2500)); 
            
            // Exit death animation mode
            this.deathAnimationMode = false;
            
            // Show countdown
            await this.showCountdown();
            
            // Respawn ship
            this.ship = new Ship(this.width / 2, this.height / 2);
            
            // Delay before spawning first asteroid
            this.asteroidSpawnTimer = -2000; // 2 second delay
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.showMenu();
        
        // Update menu subtitle with final score
        document.getElementById('menu-sub').textContent = 
            `Game Over! Final Score: ${this.score}. Ready for another round?`;
    }
    
    render() {
        // Clear canvas with transparent background (let CSS handle the gradient)
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Get theme colors
        const textColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--text') || '#e7eef7';
        const accentColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent') || '#00e0b8';
        
        // Render game objects
        if (this.ship) {
            this.ship.render(this.ctx, accentColor, textColor);
        }
        
        this.asteroids.forEach(asteroid => {
            asteroid.render(this.ctx, textColor);
        });
        
        this.lasers.forEach(laser => {
            laser.render(this.ctx, accentColor);
        });
        
        this.particles.forEach(particle => {
            particle.render(this.ctx, accentColor);
        });
    }
}

// Ship class
class Ship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.velocity = { x: 0, y: 0 };
        this.radius = 12;
        this.maxSpeed = 0.3;
        this.turnSpeed = 0.004;
        this.thrust = 0.0008;
        this.friction = 0.98;
        this.lastShot = 0;
        this.shootCooldown = 200; // ms
        this.trail = [];
    }
    
    update(deltaTime, keys, canvasWidth, canvasHeight) {
        // Rotation
        if (keys.a) this.angle -= this.turnSpeed * deltaTime;
        if (keys.d) this.angle += this.turnSpeed * deltaTime;
        
        // Thrust
        if (keys.w) {
            this.velocity.x += Math.cos(this.angle) * this.thrust * deltaTime;
            this.velocity.y += Math.sin(this.angle) * this.thrust * deltaTime;
        }
        if (keys.s) {
            this.velocity.x -= Math.cos(this.angle) * this.thrust * deltaTime;
            this.velocity.y -= Math.sin(this.angle) * this.thrust * deltaTime;
        }
        
        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        
        // Limit speed
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (speed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
        }
        
        // Update position
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        
        // Wrap around screen
        if (this.x < 0) this.x = canvasWidth;
        if (this.x > canvasWidth) this.x = 0;
        if (this.y < 0) this.y = canvasHeight;
        if (this.y > canvasHeight) this.y = 0;
        
        // Update trail
        this.trail.push({ x: this.x, y: this.y, time: Date.now() });
        this.trail = this.trail.filter(point => Date.now() - point.time < 300);
        
        // Generate thruster particles when moving
        const isThrusting = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2) > 0.01;
        if (isThrusting) {
            // Generate 1-2 particles per frame when thrusting
            const particleCount = Math.random() < 0.7 ? 1 : 2;
            for (let i = 0; i < particleCount; i++) {
                // Position particles at rear of ship
                const rearX = this.x - Math.cos(this.angle) * 8;
                const rearY = this.y - Math.sin(this.angle) * 8;
                
                // Add some spread to particle direction
                const spread = 0.3;
                const particleAngle = this.angle + Math.PI + (Math.random() - 0.5) * spread;
                const particleSpeed = 0.02 + Math.random() * 0.03;
                
                // Create thruster particle
                const thrusterParticle = new ThrusterParticle(
                    rearX, rearY,
                    Math.cos(particleAngle) * particleSpeed,
                    Math.sin(particleAngle) * particleSpeed
                );
                
                // Add to main particle array for rendering
                if (window.game && window.game.particles) {
                    window.game.particles.push(thrusterParticle);
                }
            }
        }
    }
    
    canShoot() {
        return Date.now() - this.lastShot > this.shootCooldown;
    }
    
    shoot() {
        this.lastShot = Date.now();
        const speed = 0.8;
        return new Laser(
            this.x + Math.cos(this.angle) * 20,
            this.y + Math.sin(this.angle) * 20,
            Math.cos(this.angle) * speed,
            Math.sin(this.angle) * speed
        );
    }
    
    render(ctx, accentColor, textColor) {
        // Render thruster trail (only when moving)
        const isThrusting = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2) > 0.01;
        
        if (isThrusting && this.trail.length > 1) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            
            // Create thruster flame effect
            const thrusterLength = 20;
            const thrusterWidth = 8;
            
            // Main thruster flame
            ctx.fillStyle = accentColor;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(-5, 0);
            ctx.lineTo(-5 - thrusterLength, -thrusterWidth/2);
            ctx.lineTo(-5 - thrusterLength * 0.8, 0);
            ctx.lineTo(-5 - thrusterLength, thrusterWidth/2);
            ctx.closePath();
            ctx.fill();
            
            // Inner flame
            ctx.fillStyle = textColor;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.moveTo(-5, 0);
            ctx.lineTo(-5 - thrusterLength * 0.6, -thrusterWidth/4);
            ctx.lineTo(-5 - thrusterLength * 0.5, 0);
            ctx.lineTo(-5 - thrusterLength * 0.6, thrusterWidth/4);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
        
        ctx.globalAlpha = 1;
        
        // Render ship
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = textColor;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-10, -8);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-10, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }
}

// Asteroid class
class Asteroid {
    constructor(x, y, size, velocityX = 0, velocityY = 0) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.velocity = { x: velocityX, y: velocityY };
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.002;
        
        // Size properties (speeds are much slower for relaxed gameplay)
        const sizes = {
            large: { radius: 40, speed: 0.02 },
            medium: { radius: 25, speed: 0.025 },
            small: { radius: 15, speed: 0.03 }
        };
        
        this.radius = sizes[size].radius;
        const baseSpeed = sizes[size].speed;
        
        // If no velocity provided, generate random movement
        if (velocityX === 0 && velocityY === 0) {
            const angle = Math.random() * Math.PI * 2;
            this.velocity.x = Math.cos(angle) * baseSpeed;
            this.velocity.y = Math.sin(angle) * baseSpeed;
        }
        
        // Generate random shape
        this.points = [];
        const pointCount = 8 + Math.floor(Math.random() * 4);
        for (let i = 0; i < pointCount; i++) {
            const angle = (Math.PI * 2 * i) / pointCount;
            const radiusVariation = 0.8 + Math.random() * 0.4;
            this.points.push({
                x: Math.cos(angle) * this.radius * radiusVariation,
                y: Math.sin(angle) * this.radius * radiusVariation
            });
        }
    }
    
    update(deltaTime, canvasWidth, canvasHeight) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        this.rotation += this.rotationSpeed * deltaTime;
        
        // Wrap around screen
        if (this.x < -this.radius) this.x = canvasWidth + this.radius;
        if (this.x > canvasWidth + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = canvasHeight + this.radius;
        if (this.y > canvasHeight + this.radius) this.y = -this.radius;
    }
    
    render(ctx, textColor) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
    }
}

// Laser class
class Laser {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.velocity = { x: velocityX, y: velocityY };
        this.radius = 3;
        this.life = 1500; // ms
        this.born = Date.now();
    }
    
    update(deltaTime) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
    }
    
    isAlive(canvasWidth, canvasHeight) {
        return Date.now() - this.born < this.life &&
               this.x >= 0 && this.x <= canvasWidth &&
               this.y >= 0 && this.y <= canvasHeight;
    }
    
    render(ctx, accentColor) {
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Particle class for explosions
class Particle {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.velocity = { x: velocityX, y: velocityY };
        this.life = 1;
        this.decay = 0.002;
        this.size = 2 + Math.random() * 3;
    }
    
    update(deltaTime) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        this.life -= this.decay * deltaTime;
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
    }
    
    render(ctx, accentColor) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ThrusterParticle class for ship exhaust effects
class ThrusterParticle {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.velocity = { x: velocityX, y: velocityY };
        this.life = 1;
        this.decay = 0.004; // Faster decay than explosion particles
        this.size = 1.5 + Math.random() * 2;
        this.isThrusterParticle = true;
    }
    
    update(deltaTime) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        this.life -= this.decay * deltaTime;
        // Add some gravity/drag effect
        this.velocity.x *= 0.995;
        this.velocity.y *= 0.995;
    }
    
    render(ctx, accentColor) {
        ctx.globalAlpha = this.life * 0.7; // More subtle than explosion particles
        
        // Use orange/yellow colors for thruster exhaust
        const orange = '#ff8c00';
        const yellow = '#ffff00';
        ctx.fillStyle = this.life > 0.5 ? orange : yellow;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new NeoAsteroids();
});
