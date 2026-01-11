/**
 * Pipeline Defender - Input Handler
 * Manages keyboard input only - spacebar to shoot, arrows/WASD to move
 */

class InputHandler {
    constructor() {
        this.keys = {};
        this.lastShot = 0;
        this.fireRate = 500; // Milliseconds between shots - forces strategic aiming

        // Mouse input state
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false,
            lastMoveTime: 0
        };
        this.mouseInterval = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Mouse events
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Safety: clear mouse interval on window blur too
        window.addEventListener('blur', () => this.handleMouseUp({}));

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

    // Mouse Input Handling
    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.lastMoveTime = Date.now();
    }

    handleMouseDown(e) {
        if (!window.screens || !window.screens.isGameActive()) return;

        // Left button only (0)
        if (e.button === 0) {
            this.mouse.isDown = true;
            this.tryShoot('mouse');
            
            // Auto-fire while holding mouse
            if (this.mouseInterval) clearInterval(this.mouseInterval);
            this.mouseInterval = setInterval(() => {
                this.tryShoot('mouse_hold');
            }, 100); // Check frequently, tryShoot handles rate limiting
        }
    }

    handleMouseUp(e) {
        // Left button or cleanup
        if (e.button === 0 || e.button === undefined) {
            this.mouse.isDown = false;
            if (this.mouseInterval) {
                clearInterval(this.mouseInterval);
                this.mouseInterval = null;
            }
        }
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
        
        // Clear mouse state
        this.mouse.isDown = false;
        if (this.mouseInterval) {
            clearInterval(this.mouseInterval);
            this.mouseInterval = null;
        }

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
                // console.log('SHOOT TRIGGERED BY:', source); // Reduced log noise
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
        // Keyboard check only - Mouse moved to game.js priority logic
        return this.isPressed('ArrowLeft') || 
               this.isPressed('KeyA') || 
               this.isPressed('a') || 
               this.isPressed('A');
    }

    isMovingRight() {
        // Keyboard check only - Mouse moved to game.js priority logic
        return this.isPressed('ArrowRight') || 
               this.isPressed('KeyD') || 
               this.isPressed('d') || 
               this.isPressed('D');
    }

    isShooting() {
        return this.isPressed(' ') ||
               this.isPressed('Space') ||
               this.isPressed('Spacebar') ||
               this.mouse.isDown;
    }

    getMouseDirection() {
        if (!window.game || !window.game.player || !window.display || !window.display.gameArea) return 0;

        // Get player screen position
        // We need to compare mouse screen X with player screen X
        try {
            const playerRect = window.display.gameArea.getBoundingClientRect();
            
            // Map game coordinates to screen coordinates
            // This is an approximation since scaling might be involved, 
            // but assuming gameArea is the container:
            
            // Player game coordinates (relative to gameArea)
            const playerGameX = window.game.player.x;
            const playerWidth = window.game.player.width;
            const playerCenterGameX = playerGameX + playerWidth / 2;
            
            // Convert to screen coordinates
            // We need to know the scale factor if the game is scaled.
            // Assuming 1:1 for now or that gameArea IS the canvas bound
            
            // Better approach: Calculate relative mouse position within game area
            const relativeMouseX = this.mouse.x - playerRect.left;
            
            // Scale factor if gameResolution != displayedResolution
            const scaleX = window.game.gameWidth / playerRect.width;
            
            const scaledMouseX = relativeMouseX * scaleX;
            
            const deadzone = 10; // Pixel deadzone to stop jitter
            
            if (scaledMouseX < playerCenterGameX - deadzone) {
                return -1;
            } else if (scaledMouseX > playerCenterGameX + deadzone) {
                return 1;
            }
            return 0;
            
        } catch (e) {
            console.warn('Error calculating mouse direction:', e);
            return 0;
        }
    }

    // Helper methods for game loop
    isMouseActive(timeout = 200) {
        return (Date.now() - this.mouse.lastMoveTime) < timeout;
    }

    getMouseX() {
        return this.mouse.x;
    }

    getMovementDirection() {
        let direction = 0;

        if (this.isMovingLeft()) direction -= 1;
        if (this.isMovingRight()) direction += 1;
        
        // Clamp result in case both are true (though existing logic cancels them out naturally)
        return Math.max(-1, Math.min(1, direction));
    }

    // Reset input state (called when starting new game)
    reset() {
        this.keys = {};
        this.lastShot = 0;
        this.mouse.isDown = false;
        if (this.mouseInterval) {
            clearInterval(this.mouseInterval);
            this.mouseInterval = null;
        }
    }

    // Cleanup
    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
        
        window.removeEventListener('focus', this.handleWindowFocus);
        window.removeEventListener('blur', this.handleWindowBlur);
        
        if (this.mouseInterval) {
            clearInterval(this.mouseInterval);
        }
    }
}

// Make InputHandler available globally
window.InputHandler = InputHandler;