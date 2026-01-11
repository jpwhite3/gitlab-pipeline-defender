# Pipeline Defender Context

## Project Overview
**Pipeline Defender** is a vertical arcade shooter game where players control a GitLab Tanuki to defend CI/CD pipelines from bugs. It is a "vanilla" web application built with pure HTML, CSS, and JavaScript, requiring no build tools or frameworks.

## Architecture
The project follows a modular architecture where different aspects of the game are separated into distinct JavaScript modules. These modules communicate primarily through global state or direct method calls, coordinated by the main game loop.

### Key Modules (Global Scope)
- **`window.game` (`PipelineDefenderGame`)**: The core game controller. Manages game state (`menu`, `playing`, `paused`), the game loop, object collections (`bugs`, `projectiles`), and collision detection.
- **`window.display` (`GameDisplay`)**: Handles all DOM manipulation. It renders game objects by updating their absolute CSS positions (`top`, `left`). It does **not** use HTML5 Canvas for the game entities.
- **`window.input` (`InputHandler`)**: Manages user input. Supports both Keyboard (WASD/Arrows + Space) and Mouse (Movement + Click to shoot).
- **`window.screens` (`ScreenManager`)**: Manages the UI transitions between the Main Menu, Game HUD, and Game Over screens.

## Key Files
- **`index.html`**: The single entry point. Contains the HTML structure for all screens and loads all JS modules.
- **`js/game.js`**: Contains the `PipelineDefenderGame` class. This is the "brain" of the application.
- **`js/input.js`**: Handles event listeners for keyboard and mouse.
- **`js/display.js`**: Responsible for the visual representation of the game state in the DOM.
- **`css/style.css`**: Core layout and styling.
- **`css/animations.css`**: CSS keyframe animations for visual effects.

## Development & Usage

### Running the Game
Since there are no build steps, you can run the game by serving the root directory:
```bash
python -m http.server 8000
# OR
npx serve
```
Then navigate to `http://localhost:8000`.

### Testing
Testing is manual. Open the game in a browser and verify functionality.
- **Browser Support**: Chrome, Firefox, Safari, Edge.
- **Responsive**: The game handles window resizing, but is primarily desktop-focused with mouse/keyboard controls.

## Development Conventions
*   **No Frameworks**: Do not introduce React, Vue, jQuery, or other libraries. Stick to standard Web APIs.
*   **DOM Rendering**: Game entities are `div` elements moved via CSS. Do not switch to Canvas unless explicitly refactoring the entire rendering engine.
*   **Global Access**: Main modules are exposed on the `window` object for inter-module communication (e.g., `window.game.shoot()`).
*   **Formatting**: Follow the existing indentation and naming styles (camelCase for JS, kebab-case for CSS classes/IDs).

## Game Mechanics Context
*   **Input**:
    *   **Mouse**: Movement follows cursor X position relative to the player. Left-click to shoot.
    *   **Keyboard**: Arrow keys/WASD to move. Spacebar to shoot.
*   **Entities**:
    *   **Bugs**: Enemies that fall from the top. Types: Functional (Red), Security (Black), Quality (Yellow), Secrets (Purple).
    *   **Power-ups**: Collectibles that clear all bugs of a specific type. Types: TEST, SEC, QUAL, CSM.
*   **Coordinate System**:
    *   (0,0) is the top-left of the `.game-area` container.
    *   Y increases downwards.
    *   X increases to the right.
