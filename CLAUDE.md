# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pipeline Defender** is a GitLab-themed arcade shooter game built with vanilla HTML, CSS, and JavaScript. The player controls a GitLab Tanuki that defends against software bugs falling from the sky, with the goal of collecting all four pipeline power-ups (TEST, CSM, SEC, QUAL) before time runs out.

## Project Structure

### Core Architecture
- **Frontend-only**: Pure HTML/CSS/JS with no build tools or frameworks
- **Modular JS**: Separate modules handle distinct responsibilities
- **DOM-based rendering**: Game objects are rendered as positioned DOM elements (not Canvas)
- **Event-driven**: Screen management and game state handled through event systems

### File Organization
```
/
├── index.html              # Main HTML structure with all screens
├── css/
│   ├── style.css          # Core game styling and layout
│   ├── screens.css        # Screen-specific styles (menu, game, etc.)
│   └── animations.css     # CSS animations and effects
├── js/
│   ├── game.js           # Core game logic and state management
│   ├── display.js        # DOM rendering and visual updates
│   ├── input.js          # Keyboard input handling only
│   ├── screens.js        # Screen navigation and UI management
│   └── leaderboard.js    # Score persistence and leaderboard
└── images/               # Game assets (bugs, tanuki, etc.)
```

## Key Systems

### Game Object Management (game.js)
- `PipelineDefenderGame` class manages all game state
- Object arrays: `projectiles`, `bugs`, `powerUps`
- Collision detection between projectiles and bugs/power-ups
- Win condition: collect all 4 power-ups before timer expires

### Display System (display.js)
- `GameDisplay` class handles DOM element creation/positioning
- Uses absolute positioning with `style.top` and `style.left`
- Game area dimensions: 908x542px (excluding 80px HUD)
- Objects positioned using pixel coordinates

### Input System (input.js)
- `InputHandler` handles keyboard events only (no mouse/touch support)
- Arrow keys/WASD for movement, **SPACEBAR ONLY** for shooting
- No mobile/touch support - keyboard-only game

## Common Development Commands

### Running the Game
```bash
# Open index.html in browser (no build required)
open index.html
# or serve locally
python -m http.server 8000
# or use any local server
```

### Testing
- No automated test suite - manual testing in browser required
- Test on multiple browsers (Chrome, Firefox, Safari)
- Keyboard-only input - no mobile/touch support needed

### Debugging
- Use browser DevTools console for game state inspection
- Console logging available in `game.js` for object positions/collisions
- Visual debugging: add CSS borders to game objects for positioning verification

## Architecture Notes

### Coordinate System
- Game area uses CSS `calc(100% - 80px)` to account for 80px HUD height
- Y-axis: 0 = top of game area, increases downward
- X-axis: 0 = left edge, increases rightward
- Player spawns at bottom center, bugs spawn from top

### Performance Considerations
- DOM rendering (not Canvas) - less performant but simpler
- Game objects created/destroyed frequently
- CSS animations used for visual effects

### Known Issues
- CSS rendering occasionally shows visual-logic disconnect (see css-issue-plan.md)
- Objects may appear positioned incorrectly despite correct coordinate logic

## Game Mechanics

### Bug Types
- **Functional Errors**: Red, eliminated by TEST power-up
- **Security Bugs**: Black, eliminated by SEC power-up
- **Quality Bugs**: Yellow, eliminated by QUAL power-up
- **Embedded Secrets**: Purple, eliminated by CSM power-up

### Power-ups
- Collecting a power-up eliminates all bugs of that type on screen
- Prevents future spawning of that bug type
- Awards 1000 points vs 10 points for shooting individual bugs

### Win/Lose Conditions
- **Win**: Collect all 4 power-ups
- **Lose**: Timer expires OR any bug reaches bottom of screen