NeoBreakout is a basic browser based video game inspired by the classic game Breakout. The player controls a "paddle" and attempts to break all the bricks by bouncing the ball off the paddle.

Specifically it has the following features

### Game Design

- Start menu where the player can provide a name and start the round
- On the start menu, you can select from three difficulty modes: Easy, Medium, Hard
- "Back to Menu" button to return to the main game selection screen
- Single player game
- The player's paddle is on the bottom of the play area and can move in a linear direction left and right using the A and D keys
- Above the player's paddle, occupying the top part of the play area, are five rows of bricks, each row has 6 bricks
- A ball spawns at the start of the round and can bounce off the player's paddle, the walls, and the bricks
- If a ball contacts a brick, have the ball bounce off and then destroy the brick
- If the ball contacts the bottom of the screen, below the player's paddle, the player loses one life. An explosion animation will play.
- The number of lives depends on the difficulty: 
-- Easy: 5 lives
-- Medium: 3 lives
-- Hard: 1 life
- If the player loses all lives, the game is lost
- If all bricks are destroyed, the game is won

### Game Appearance

- The map is a square containing one rectangular paddle, one square ball, and many rectangular bricks
- The ball displays a short trailing animation
- There is a score board on the bottom of the page that counts the number of bricks destroyed and the number of lives remaining
- Before the ball spawns at the start of the round and after each goal, display a centered countdown animation: "3... 2... 1... START!"
- All game elements (paddles, ball, net, borders, particles, text) adapt to the selected theme for optimal readability
- Each row of bricks has a different color.

