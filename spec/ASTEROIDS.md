NeoAsteroids is a basic browser based video game inspired by the classic game Asteroids. The player controls a "ship" and attempts to break all the asteroids with the ships laser

Specifically it has the following features

### Game Design

- Start menu where the player can provide a name and start the round
- "Back to Menu" button to return to the main game selection screen
- Single player game
- The player's Ship spawns in the middle of the map
- The player can steer their ship left and right with the A and D keys, and move backwards and forewards with the W and S keys
- If the player's ship exits the end of the map, the ship will appear on the opposite side of the map
- The player can shoot their laser using the Space key, the laser will fire straight forward from the ship in the direction the ship is facing
- Asteroids randomly spawn at a fixed interval around the map, they move at a slow speed in a fixed direction
- Asteroids can have three sizes, small, medium, or large
- When the ship's laser comes in contact with an Asteroid, it will break and spawn two asteroids that are one size smaller. Breaking a small asteroid will destroy it completely
- If the player's ship comes in contact with an asteroid, the ship is destroyed
- The player has 5 lives, once all lives are gone, the game is over
- A running score is kept, the player earns one point for each asteroid destroyed

### Game Appearance

- The map is a square containing one triangular ship, and various circular asteroids of varrying size
- The ship displays a short trailing animation
- There is a score board on the bottom of the page that counts the number of asteroids destroyed and lives remaining
- Before the game starts and before the ship spawns after each death, display a centered countdown animation: "3... 2... 1... START!"
- All game elements (ships, meteors, the laser) adapt to the selected theme for optimal readability

