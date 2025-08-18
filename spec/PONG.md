NeoPong is a basic browser based video game inspired by the classic game Pong. The player controls a "paddle" and attempts to score goals against their opponent by bouncing the ball off the paddle.

Specifically it has the following features

### Game Design

- Main menu where the player can provide a name and start the round
- Start menu includes an input to set the winning score for the round
- The default winning score should be 3
- Single player mode where the player can play versus an AI
- Two-player mode where players can compete against each other
- Player 2 can enter their name in the main menu when two-player mode is selected
- The player's paddle is on the left side and can move in a linear direction up and down using the W and S keys
- The AI's paddle is on the right side and has the same movement restrictions as the player's paddle, however the AI will control the paddle to try and hit the ball back
- In two-player mode, the second player controls the right paddle using the up and down arrow keys
- After a goal is scored, both paddles reset to the middle before the countdown and next serve

### Game Appearance

- The map is a square containing two rectangular paddles and one square ball
- The two paddles should have contrasting colors to clearly distinguish the player and the AI
- The ball displays a short trailing animation whose color reflects the last hitter (player vs AI)
- There is a score board on the bottom of the page that counts the number of goals for the player and their AI opponent
- When a goal is scored, play a brief celebratory animation (e.g., flash, screen shake, and/or particle burst)
- Before the ball spawns at the start of the round and after each goal, display a centered countdown animation: "3... 2... 1... START!"
- All game elements (paddles, ball, net, borders, particles, text) adapt to the selected theme for optimal readability

### Non-game specific design

- Dark and light mode toggle button in the header that allows users to switch between color schemes
- Theme preference is saved in localStorage and restored on page reload

## Implementation details

- The game must be compatible with popular browsers including Google Chrome
- You are free to use any free frameworks or programing languages to accomplish the task
