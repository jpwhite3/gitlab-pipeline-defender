<!--
Sync Impact Report:
- Version change: 0.0.0 -> 1.0.0
- List of modified principles:
  - Defined [PRINCIPLE_1_NAME] -> Vanilla Architecture
  - Defined [PRINCIPLE_2_NAME] -> Modular Design
  - Defined [PRINCIPLE_3_NAME] -> No Build Tools
  - Defined [PRINCIPLE_4_NAME] -> Accessibility & Compatibility
  - Defined [PRINCIPLE_5_NAME] -> Educational Focus
- Added sections: None
- Removed sections: None
- Templates requiring updates: ✅ None (Generic templates align with new principles)
- Follow-up TODOs: None
-->

# Pipeline Defender Constitution

## Core Principles

### I. Vanilla Architecture
**NON-NEGOTIABLE**: The project must be built using pure HTML, CSS, and JavaScript. No external runtime frameworks (React, Vue, Angular, jQuery) are permitted. Code must be directly executable by modern web browsers.

### II. Modular Design
Code must be organized into distinct modules with clear responsibilities (e.g., `game.js` for logic, `display.js` for rendering, `input.js` for controls). Modules should interact through well-defined global interfaces (e.g., `window.game`) or event systems, avoiding tight coupling where possible.

### III. No Build Tools
**NON-NEGOTIABLE**: The application must run locally by simply opening `index.html` or serving the directory. No compilation, transpilation (Babel/TypeScript), or bundling (Webpack/Vite) steps are allowed for the core runtime.

### IV. Accessibility & Compatibility
The game must support both Keyboard (Arrow keys/WASD + Space) and Mouse controls. It must be playable on all major modern browsers (Chrome, Firefox, Safari, Edge) and maintain functionality on different screen sizes (though primarily desktop-focused).

### V. Educational Focus
All features and game mechanics should reinforce CI/CD and software security concepts. Game elements (bugs, power-ups) must map to real-world software engineering terminology (e.g., "Functional Errors", "Security Bugs", "TEST", "CI/CD").

## Development Constraints

### DOM-Based Rendering
Game entities are rendered using DOM manipulation (absolute positioning of `div` elements), not HTML5 Canvas (except for specific visual effects if necessary, but core gameplay remains DOM-based). This simplifies inspection and debugging.

### Testing Strategy
Due to the visual and interactive nature of the game and the lack of build tools, testing is primarily manual. Developers must verify changes across supported browsers. Automated unit tests are optional and must not introduce build dependencies.

## Governance

### Amendment Process
Amendments to this constitution require a Pull Request with clear justification. Changes to "NON-NEGOTIABLE" principles (I & III) require explicit approval from project maintainers and a Major version bump.

### Compliance
All Pull Requests must be reviewed against these principles. Code that introduces framework dependencies or build steps will be rejected automatically.

**Version**: 1.0.0 | **Ratified**: 2025-09-14 | **Last Amended**: 2026-01-10