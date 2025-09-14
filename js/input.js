/**
 * Pipeline Defender - Input Handler
 * Manages keyboard input only - spacebar to shoot, arrows/WASD to move
 */

class InputHandler {
    constructor() {
        this.keys = {};
        this.lastShot = 0;
        this.fireRate = 200; // Milliseconds between shots

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard events only
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Prevent default behavior for game keys
        document.addEventListener('keydown', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Space'].includes(e.key)) {
                e.preventDefault();
            }
        });

        // Focus management
        window.addEventListener('focus', () => this.handleWindowFocus());
        window.addEventListener('blur', () => this.handleWindowBlur());
    }

    // Keyboard Input Handling
    handleKeyDown(e) {
        // Only handle game input when game is active
        if (!window.screens || !window.screens.isGameActive()) {
            return;
        }

        this.keys[e.key] = true;
        this.keys[e.code] = true;

        // Immediate actions
        switch (e.key) {
            case ' ':
            case 'Spacebar':
                this.tryShoot('spacebar');
                break;
            case 'Escape':
                if (window.game) {
                    window.game.togglePause();
                }
                break;
        }
    }

    handleKeyUp(e) {
        this.keys[e.key] = false;
        this.keys[e.code] = false;
    }

    // Window Focus Handling
    handleWindowFocus() {
        // Reset keys when window regains focus to prevent stuck keys
        this.keys = {};
    }

    handleWindowBlur() {
        // Clear all keys when window loses focus
        this.keys = {};

        // Pause game if active
        if (window.game && window.screens && window.screens.isGameActive()) {
            window.game.autoPause();
        }
    }

    // Input Actions
    tryShoot(source = 'unknown') {
        const now = Date.now();
        if (now - this.lastShot > this.fireRate) {
            if (window.game) {
                console.error('SHOOT TRIGGERED BY:', source);
                window.game.shoot();
            }
            this.lastShot = now;
        } else {
            console.error('SHOOT BLOCKED (rate limit) - triggered by:', source);
        }
    }

    // Public Input State Methods
    isPressed(key) {
        return !!this.keys[key];
    }

    isMovingLeft() {
        return this.isPressed('ArrowLeft') ||
               this.isPressed('KeyA') ||
               this.isPressed('a') ||
               this.isPressed('A');
    }

    isMovingRight() {
        return this.isPressed('ArrowRight') ||
               this.isPressed('KeyD') ||
               this.isPressed('d') ||
               this.isPressed('D');
    }

    isShooting() {
        return this.isPressed(' ') ||
               this.isPressed('Space') ||
               this.isPressed('Spacebar');
    }

    getMovementDirection() {
        let direction = 0;

        if (this.isMovingLeft()) direction -= 1;
        if (this.isMovingRight()) direction += 1;

        return direction;
    }

    // Reset input state (called when starting new game)
    reset() {
        this.keys = {};
        this.lastShot = 0;
    }

    // Cleanup
    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('focus', this.handleWindowFocus);
        window.removeEventListener('blur', this.handleWindowBlur);
    }
}