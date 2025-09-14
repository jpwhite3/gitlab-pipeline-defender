/**
 * Pipeline Defender - Input Handler
 * Manages keyboard, mouse, and touch input for the game
 */

class InputHandler {
    constructor() {
        this.keys = {};
        this.lastShot = 0;
        this.fireRate = 200; // Milliseconds between shots
        this.gameArea = null;

        this.touchStart = { x: 0, y: 0 };
        this.touchEnd = { x: 0, y: 0 };
        this.isTouching = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Prevent default behavior for game keys
        document.addEventListener('keydown', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Space'].includes(e.key)) {
                e.preventDefault();
            }
        });

        // Touch events for mobile
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

        // Mouse events as fallback
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

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
                this.tryShoot();
                break;
            case 'z':
            case 'Z':
            case 'x':
            case 'X':
                this.tryShoot();
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

    // Touch Input Handling
    handleTouchStart(e) {
        if (!window.screens || !window.screens.isGameActive()) {
            return;
        }

        e.preventDefault();
        this.isTouching = true;

        const touch = e.touches[0];
        this.touchStart.x = touch.clientX;
        this.touchStart.y = touch.clientY;

        // Get game area bounds for relative positioning
        if (!this.gameArea) {
            this.gameArea = document.getElementById('game-area');
        }

        if (this.gameArea) {
            const rect = this.gameArea.getBoundingClientRect();
            const relativeX = touch.clientX - rect.left;
            const relativeY = touch.clientY - rect.top;

            // If touching upper area, shoot
            if (relativeY < rect.height * 0.7) {
                this.tryShoot();
            }

            // Store initial touch position for movement
            this.touchStart.relativeX = relativeX;
        }
    }

    handleTouchMove(e) {
        if (!window.screens || !window.screens.isGameActive() || !this.isTouching) {
            return;
        }

        e.preventDefault();

        const touch = e.touches[0];
        if (!this.gameArea) {
            this.gameArea = document.getElementById('game-area');
        }

        if (this.gameArea && window.game) {
            const rect = this.gameArea.getBoundingClientRect();
            const relativeX = touch.clientX - rect.left;
            const deltaX = relativeX - this.touchStart.relativeX;

            // Move player based on touch movement
            if (Math.abs(deltaX) > 5) { // Minimum movement threshold
                const direction = deltaX > 0 ? 1 : -1;
                window.game.movePlayer(direction * Math.abs(deltaX) * 0.5);
                this.touchStart.relativeX = relativeX;
            }
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.isTouching = false;

        // Calculate swipe direction for additional controls
        const touch = e.changedTouches[0];
        this.touchEnd.x = touch.clientX;
        this.touchEnd.y = touch.clientY;

        const swipeThreshold = 50;
        const deltaX = this.touchEnd.x - this.touchStart.x;
        const deltaY = this.touchEnd.y - this.touchStart.y;

        // Quick tap to shoot
        if (Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
            this.tryShoot();
        }
    }

    // Mouse Input Handling (for desktop without keyboard)
    handleMouseDown(e) {
        if (!window.screens || !window.screens.isGameActive()) {
            return;
        }

        // Left click to shoot
        if (e.button === 0) {
            this.tryShoot();
        }
    }

    handleMouseMove(e) {
        if (!window.screens || !window.screens.isGameActive()) {
            return;
        }

        // Optional: Move player with mouse movement
        // Can be enabled for additional control scheme
    }

    handleMouseUp(e) {
        // Mouse up handling if needed
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
    tryShoot() {
        const now = Date.now();
        if (now - this.lastShot > this.fireRate) {
            if (window.game) {
                window.game.shoot();
            }
            this.lastShot = now;
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
               this.isPressed('Spacebar') ||
               this.isPressed('z') ||
               this.isPressed('Z') ||
               this.isPressed('x') ||
               this.isPressed('X');
    }

    getMovementDirection() {
        let direction = 0;

        if (this.isMovingLeft()) direction -= 1;
        if (this.isMovingRight()) direction += 1;

        return direction;
    }

    // Touch feedback for better user experience
    createTouchFeedback(x, y) {
        const feedback = document.createElement('div');
        feedback.className = 'touch-feedback';
        feedback.style.cssText = `
            position: fixed;
            left: ${x - 15}px;
            top: ${y - 15}px;
            width: 30px;
            height: 30px;
            border: 2px solid var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
        `;

        document.body.appendChild(feedback);

        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 600);
    }

    // Vibration for mobile devices (if supported)
    vibrate(pattern = [50]) {
        if ('vibrate' in navigator && window.screens && window.screens.isGameActive()) {
            navigator.vibrate(pattern);
        }
    }

    // Configuration methods
    setFireRate(rate) {
        this.fireRate = Math.max(50, Math.min(1000, rate)); // Clamp between 50-1000ms
    }

    getFireRate() {
        return this.fireRate;
    }

    // Reset input state (useful for game restart)
    reset() {
        this.keys = {};
        this.lastShot = 0;
        this.isTouching = false;
    }

    // Debug method to check input state
    getInputState() {
        return {
            keys: { ...this.keys },
            movingLeft: this.isMovingLeft(),
            movingRight: this.isMovingRight(),
            shooting: this.isShooting(),
            direction: this.getMovementDirection(),
            lastShot: this.lastShot,
            fireRate: this.fireRate,
            isTouching: this.isTouching
        };
    }
}

// Initialize input handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.input = new InputHandler();
});