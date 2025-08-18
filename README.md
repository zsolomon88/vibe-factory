# Vibe Factory

Vibe Factory is a browser-based gaming platform that hosts a collection of classic and new mini-games.

### Features
- A main menu with a grid-based selector to launch different games.
- A consistent, modern UI with dark and light theme options.
- Shared styles and scripts for a unified experience across all games.

### Supported Games

#### NeoPong
A small, browser-based take on the classic Pong. Play against an AI or a friend on a 720x720 canvas with a simple, fast game loop and clean visuals.

- **Features**:
    - Start menu to enter player names and set the winning score (default 3).
    - Single-player vs. AI and two-player modes.
    - Scoreboard, goal celebrations (flash, screen shake, particles), and a centered countdown.
    - Contrasting paddle colors and a ball trail colored by the last hitter.
- **Controls**:
    - Player 1: W/S to move up/down.
    - Player 2: Up/Down arrow keys to move up/down.

#### NeoBreakout
A classic brick-breaking game where the player controls a paddle to bounce a ball and destroy all the bricks on the screen.

- **Features**:
    - Start menu with difficulty settings (Easy, Medium, Hard).
    - Five rows of bricks, with each row having a different color.
    - Scoreboard to track score and lives.
    - Particle explosion effect when a life is lost.
- **Controls**:
    - A/D to move the paddle left/right.

### File Structure
- `index.html` – Main menu and game selector.
- `styles.css` – Global layout, theme, and animations.
- `scripts/theme.js` – Theme management logic.
- `games/pong/index.html` – Markup and UI for NeoPong.
- `games/pong/game.js` – Game loop, physics, and AI for NeoPong.
- `games/breakout/index.html` – Markup and UI for NeoBreakout.
- `games/breakout/breakout.js` – Game loop and logic for NeoBreakout.


