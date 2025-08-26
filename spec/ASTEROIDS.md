NeoAsteroids is a browser-based video game inspired by the classic game Asteroids. The player controls a "ship" and attempts to destroy all the asteroids with the ship's laser. The game features progressive difficulty and enhanced visual effects.

Specifically it has the following features

### Game Design

- Start menu where the player can provide a name and start the round
- "Back to Menu" button to return to the main game selection screen
- Single player game
- The player's Ship spawns in the middle of the map
- The player can steer their ship left and right with the A and D keys, and move backwards and forwards with the W and S keys
- If the player's ship exits the end of the map, the ship will appear on the opposite side of the map
- The player can shoot their laser using the Space key, the laser will fire straight forward from the ship in the direction the ship is facing
- Asteroids randomly spawn at a fixed interval around the map in random sizes (large, medium, or small)
- Asteroids move at varying speeds based on their size (small asteroids are fastest)
- Progressive difficulty: asteroid speeds increase by 2% per point scored, capping at 500% speed
- When the ship's laser comes in contact with an Asteroid, it will break and spawn two asteroids that are one size smaller. Breaking a small asteroid will destroy it completely
- If the player's ship comes in contact with an asteroid, the ship is destroyed
- The player has 5 lives, once all lives are gone, the game is over
- A running score is kept, the player earns one point for each asteroid destroyed

### Enhanced Features

- Progressive difficulty scaling: asteroids get faster as score increases (100% to 500% speed)
- Visual difficulty indicator in scoreboard showing current speed percentage
- Realistic thruster flame effects that activate when ship is moving
- Particle trail effects behind thrusters with orange/yellow exhaust particles
- Enhanced death sequence with proper explosion animation timing
- Random asteroid size spawning for varied gameplay from start
- All asteroids and debris cleared when player dies for clean respawn

### Game Appearance

- The map is a square containing one triangular ship, and various circular asteroids of varying size
- The ship displays realistic thruster flame effects with particle trails when moving
- Explosion particle effects when asteroids are destroyed or ship is hit
- Enhanced scoreboard showing Score | Lives | Speed percentage
- Before the game starts and before the ship spawns after each death, display a centered countdown animation: "3... 2... 1... START!"
- Death animation plays completely before respawn countdown begins
- All game elements (ships, asteroids, lasers, particles) adapt to the selected theme for optimal readability

