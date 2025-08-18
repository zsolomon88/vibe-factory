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

### File Structure
- `index.html` – Main menu and game selector.
- `styles.css` – Global layout, theme, and animations.
- `scripts/theme.js` – Theme management logic.
- `games/pong/index.html` – Markup and UI for NeoPong.
- `games/pong/game.js` – Game loop, physics, and AI for NeoPong.


