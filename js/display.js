/**
 * Pipeline Defender - Display System
 * Handles DOM-based rendering and visual effects using real PNG assets
 */

class DisplayManager {
    constructor() {
        this.gameArea = null;
        this.gameObjects = new Map(); // Track all game objects
        this.animations = new Set(); // Track active animations
        this.effectsContainer = null;

        this.initializeDisplay();
    }

    initializeDisplay() {
        this.gameArea = document.getElementById('game-area');
        if (!this.gameArea) {
            console.error('Game area not found!');
            return;
        }

        // Create effects container for explosions, score popups, etc.
        this.effectsContainer = document.createElement('div');
        this.effectsContainer.id = 'effects-container';
        this.effectsContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
        `;
        this.gameArea.appendChild(this.effectsContainer);

        // Set up game area styles for proper positioning
        this.gameArea.style.position = 'relative';
    }

    // Player rendering
    updatePlayer(playerData) {
        let playerElement = document.getElementById('tanuki');

        if (!playerElement) {
            playerElement = this.createElement('tanuki', 'player');
            playerElement.innerHTML = `
                <img src="images/gitlab-tanuki.png" alt="Tanuki Player" style="width: 45px; height: 45px;">
            `;
            this.gameArea.appendChild(playerElement);
        }

        // Update position - both game logic and display now use top-based coordinates
        playerElement.style.left = `${playerData.x}px`;
        playerElement.style.top = `${playerData.y}px`;
        playerElement.style.bottom = 'auto'; // Clear any bottom positioning

        // Add movement animation class when moving
        if (playerData.velocity && playerData.velocity !== 0) {
            playerElement.classList.add('moving');
        } else {
            playerElement.classList.remove('moving');
        }
    }

    // Projectile rendering
    createProjectile(projectileData) {
        const projectileElement = this.createElement(
            `projectile-${projectileData.id}`,
            'projectile game-object'
        );

        projectileElement.style.cssText = `
            position: absolute;
            left: ${projectileData.x}px;
            top: ${projectileData.y}px;
            width: 8px; /* Fixed width */
            height: 20px; /* Fixed height */
            background: radial-gradient(circle, var(--primary-color) 0%, #66fcf1 100%);
            border-radius: clamp(3px, 0.3vw, 5px); /* Smaller responsive radius */
            box-shadow: 0 0 clamp(8px, 1.5vw, 15px) var(--primary-color),
                        0 0 clamp(3px, 0.5vw, 6px) rgba(255, 255, 255, 0.5); /* Smaller responsive glow */
            border: clamp(1px, 0.2vw, 2px) solid rgba(255, 255, 255, 0.8); /* Smaller responsive border */
            z-index: 3;
            animation: projectile-glow 0.3s ease-out;
        `;

        this.gameArea.appendChild(projectileElement);
        this.gameObjects.set(projectileData.id, projectileElement);
        console.log('➕ CREATED projectile:', projectileData.id, 'Type:', typeof projectileData.id, 'Map size now:', this.gameObjects.size);

        return projectileElement;
    }

    updateProjectile(projectileData) {
        const element = this.gameObjects.get(projectileData.id);
        if (element) {
            element.style.top = `${projectileData.y}px`;
        }
    }

    removeProjectile(projectileId) {
        const element = this.gameObjects.get(projectileId);
        if (element) {
            // Always remove from tracking map first
            this.gameObjects.delete(projectileId);

            // Then try to remove from DOM if it exists
            if (element.parentNode) {
                element.parentNode.removeChild(element);
                console.log('➖ REMOVED projectile:', projectileId, 'Map size now:', this.gameObjects.size);
            } else {
                console.log('➖ REMOVED projectile from map only:', projectileId, '(element already removed from DOM)');
            }
        } else {
            // Element not in map, try to find and remove from DOM anyway
            const domElement = document.getElementById(`projectile-${projectileId}`);
            if (domElement && domElement.parentNode) {
                domElement.parentNode.removeChild(domElement);
                console.log('➖ FORCE REMOVED orphaned projectile:', projectileId);
            }
        }
    }

    // Bug rendering
    createBug(bugData) {
        const bugElement = this.createElement(`bug-${bugData.id}`, 'bug game-object');

        const bugImages = {
            'Functional Errors': 'images/functional-bug.png',
            'Security Bugs': 'images/security-bug.png',
            'Quality Bugs': 'images/code-quality-bug.png',
            'Embedded Secrets': 'images/embedded-secret-bug.png'
        };

        bugElement.innerHTML = `
            <img src="${bugImages[bugData.type]}" alt="${bugData.type}"
                 style="width: ${bugData.size}px; height: ${bugData.size}px;">
        `;

        bugElement.style.cssText = `
            position: absolute;
            left: ${bugData.x}px;
            top: ${bugData.y}px;
            z-index: 2;
            transition: none;
        `;

        // Add type-specific styling with responsive drop shadow
        switch (bugData.type) {
            case 'Functional Errors':
                bugElement.style.filter = 'drop-shadow(0 0 clamp(5px, 0.8vw, 12px) #ff3333)'; /* Responsive shadow */
                break;
            case 'Security Bugs':
                bugElement.style.filter = 'drop-shadow(0 0 clamp(5px, 0.8vw, 12px) #000000)';
                break;
            case 'Quality Bugs':
                bugElement.style.filter = 'drop-shadow(0 0 clamp(5px, 0.8vw, 12px) #ffff00)';
                break;
            case 'Embedded Secrets':
                bugElement.style.filter = 'drop-shadow(0 0 clamp(5px, 0.8vw, 12px) #8a2be2)';
                break;
        }

        this.gameArea.appendChild(bugElement);
        this.gameObjects.set(bugData.id, bugElement);
        console.log('➕ CREATED bug:', bugData.id, 'Type:', typeof bugData.id, 'Map size now:', this.gameObjects.size);

        return bugElement;
    }

    updateBug(bugData) {
        const element = this.gameObjects.get(bugData.id);
        if (element) {
            element.style.top = `${bugData.y}px`;
            element.style.left = `${bugData.x}px`;
        }
    }

    removeBug(bugId) {
        const element = this.gameObjects.get(bugId);
        if (element) {
            // Always remove from tracking map first
            this.gameObjects.delete(bugId);

            // Then try to remove from DOM if it exists
            if (element.parentNode) {
                element.parentNode.removeChild(element);
                console.log('➖ REMOVED bug:', bugId, 'Map size now:', this.gameObjects.size);
            } else {
                console.log('➖ REMOVED bug from map only:', bugId, '(element already removed from DOM)');
            }
        } else {
            // Element not in map, try to find and remove from DOM anyway
            const domElement = document.getElementById(`bug-${bugId}`);
            if (domElement && domElement.parentNode) {
                domElement.parentNode.removeChild(domElement);
                console.log('➖ FORCE REMOVED orphaned bug:', bugId);
            }
        }
    }

    // Power-up rendering
    createPowerUp(powerUpData) {
        const powerUpElement = this.createElement(`powerup-${powerUpData.id}`, 'power-up game-object');

        // Create power-up visual with icon
        const icons = {
            'TEST': '🧪',
            'CSM': '🔐',
            'SEC': '🛡️',
            'QUAL': '✅'
        };

        const colors = {
            'TEST': '#45a29e',
            'CSM': '#8a2be2',
            'SEC': '#ff3333',
            'QUAL': '#ffff00'
        };

        powerUpElement.innerHTML = `
            <div style="
                width: ${powerUpData.size}px; /* Fixed size */
                height: ${powerUpData.size}px; /* Fixed size */
                background: linear-gradient(45deg, ${colors[powerUpData.type]}, transparent);
                border: 2px solid ${colors[powerUpData.type]}; /* Fixed border */
                border-radius: 8px; /* Fixed radius */
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px; /* Fixed font size */
                box-shadow: 0 0 20px ${colors[powerUpData.type]}; /* Fixed shadow */
                position: relative;
                overflow: hidden;
            ">
                <span style="z-index: 1;">${icons[powerUpData.type]}</span>
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
                    animation: shine 2s infinite ease-in-out;
                "></div>
            </div>
        `;

        powerUpElement.style.cssText = `
            position: absolute;
            left: ${powerUpData.x}px;
            top: ${powerUpData.y}px;
            z-index: 4;
            animation: power-up-float 2s ease-in-out infinite;
        `;

        this.gameArea.appendChild(powerUpElement);
        this.gameObjects.set(powerUpData.id, powerUpElement);
        console.log('➕ CREATED power-up:', powerUpData.id, 'Type:', typeof powerUpData.id, 'Map size now:', this.gameObjects.size);

        return powerUpElement;
    }

    updatePowerUp(powerUpData) {
        const element = this.gameObjects.get(powerUpData.id);
        if (element) {
            element.style.top = `${powerUpData.y}px`;
            element.style.left = `${powerUpData.x}px`;
        }
    }

    removePowerUp(powerUpId) {
        const element = this.gameObjects.get(powerUpId);
        if (element) {
            // Always remove from tracking map first
            this.gameObjects.delete(powerUpId);

            // Then try to remove from DOM if it exists
            if (element.parentNode) {
                element.parentNode.removeChild(element);
                console.log('➖ REMOVED power-up:', powerUpId, 'Map size now:', this.gameObjects.size);
            } else {
                console.log('➖ REMOVED power-up from map only:', powerUpId, '(element already removed from DOM)');
            }
        } else {
            // Element not in map, try to find and remove from DOM anyway
            const domElement = document.getElementById(`powerup-${powerUpId}`);
            if (domElement && domElement.parentNode) {
                domElement.parentNode.removeChild(domElement);
                console.log('➖ FORCE REMOVED orphaned power-up:', powerUpId);
            }
        }
    }

    // Visual Effects
    createExplosion(x, y, scale = 1) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.innerHTML = `<img src="images/explosion.png" alt="Explosion" style="width: ${80 * scale}px; height: ${80 * scale}px;">`;

        explosion.style.cssText = `
            position: absolute;
            left: ${x - (40 * scale)}px; /* 2x from 20 * scale */
            top: ${y - (40 * scale)}px; /* 2x from 20 * scale */
            z-index: 999;
            pointer-events: none;
        `;

        this.effectsContainer.appendChild(explosion);

        // Remove after animation
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 500);

        return explosion;
    }

    createScorePopup(x, y, score, isBig = false) {
        const popup = document.createElement('div');
        popup.className = `score-popup ${isBig ? 'big' : ''}`;
        popup.textContent = `+${score}`;

        popup.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            z-index: 998;
            pointer-events: none;
        `;

        this.effectsContainer.appendChild(popup);

        // Remove after animation
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1500);

        return popup;
    }

    createPowerUpEffect(x, y, type) {
        const effect = document.createElement('div');
        effect.className = 'power-up-effect';

        const messages = {
            'TEST': 'TESTS ACTIVE!',
            'CSM': 'SECRETS MANAGED!',
            'SEC': 'SECURITY ENABLED!',
            'QUAL': 'QUALITY ASSURED!'
        };

        effect.textContent = messages[type] || 'POWER-UP!';

        effect.style.cssText = `
            position: absolute;
            left: ${x - 50}px;
            top: ${y - 20}px;
            width: 100px;
            text-align: center;
            font-size: 1.2em;
            font-weight: bold;
            color: var(--gitlab-orange);
            text-shadow: 0 0 10px var(--gitlab-orange);
            z-index: 997;
            pointer-events: none;
            animation: power-up-text 2s ease-out forwards;
        `;

        this.effectsContainer.appendChild(effect);

        // Remove after animation
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 2000);

        return effect;
    }

    // Pipeline status updates
    updatePipelineStatus(collectedPowerUps) {
        const pipelineItems = {
            'TEST': document.getElementById('pipeline-test'),
            'CSM': document.getElementById('pipeline-csm'),
            'SEC': document.getElementById('pipeline-sec'),
            'QUAL': document.getElementById('pipeline-qual')
        };

        Object.keys(pipelineItems).forEach(type => {
            const element = pipelineItems[type];
            if (element) {
                if (collectedPowerUps.includes(type)) {
                    element.classList.add('collected');
                    if (!element.hasAttribute('data-animated')) {
                        element.classList.add('collecting');
                        element.setAttribute('data-animated', 'true');

                        // Remove animation class after animation
                        setTimeout(() => {
                            element.classList.remove('collecting');
                        }, 800);
                    }
                } else {
                    element.classList.remove('collected');
                    element.removeAttribute('data-animated');
                }
            }
        });
    }

    // HUD updates
    updateScore(score) {
        const scoreElement = document.getElementById('score-display');
        if (scoreElement) {
            const prevScore = parseInt(scoreElement.textContent) || 0;
            scoreElement.textContent = score.toLocaleString();

            // Animate score change
            if (score > prevScore) {
                scoreElement.style.animation = 'none';
                setTimeout(() => {
                    scoreElement.style.animation = 'glow 0.5s ease-out';
                }, 10);
            }
        }
    }

    updateTimer(timeLeft) {
        const timerElement = document.getElementById('timer-display');
        if (timerElement) {
            timerElement.textContent = timeLeft;

            // Add warning styling for low time
            if (timeLeft <= 10) {
                timerElement.classList.add('warning');
                timerElement.style.color = 'var(--error-color)';
                timerElement.style.animation = 'blink 0.5s infinite';
            } else if (timeLeft <= 30) {
                timerElement.style.color = 'var(--warning-color)';
                timerElement.style.animation = 'none';
            } else {
                timerElement.classList.remove('warning');
                timerElement.style.color = 'var(--primary-color)';
                timerElement.style.animation = 'none';
            }
        }
    }

    // Screen shake effect for impacts
    shakeScreen(intensity = 1, duration = 300) {
        const gameArea = this.gameArea;
        if (!gameArea) return;

        gameArea.style.animation = `shake 0.1s ease-in-out ${Math.floor(duration / 100)}`;

        setTimeout(() => {
            gameArea.style.animation = '';
        }, duration);
    }

    // Flash effect for warnings
    flashWarning() {
        const gameArea = this.gameArea;
        if (!gameArea) return;

        gameArea.classList.add('warning-flash');

        setTimeout(() => {
            gameArea.classList.remove('warning-flash');
        }, 1000);
    }

    // Utility methods
    createElement(id, className = '') {
        const element = document.createElement('div');
        element.id = id;
        element.className = className;
        return element;
    }

    clearGameObjects() {
        console.log('🧹 CLEANUP START: Map has', this.gameObjects.size, 'tracked objects');

        // First, audit all DOM elements in game area
        if (this.gameArea) {
            const allGameAreaChildren = Array.from(this.gameArea.children);
            console.log('🔍 DOM AUDIT: Game area has', allGameAreaChildren.length, 'child elements:');
            allGameAreaChildren.forEach(child => {
                console.log('  - Element:', child.tagName, 'ID:', child.id, 'Classes:', child.className);
            });
        }

        // Remove all game objects except player from Map
        const objectsToRemove = [];
        this.gameObjects.forEach((element, id) => {
            console.log('🔍 CHECKING MAP OBJECT:', id, 'Type:', typeof id, 'Element:', element?.tagName, 'ID:', element?.id);

            // Check if id is a string and doesn't contain 'tanuki'
            if (typeof id === 'string' && !id.includes('tanuki')) {
                console.log('  → REMOVING string-keyed object:', id);
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                    console.log('    ✓ Removed from DOM');
                } else {
                    console.log('    ⚠️ Element not in DOM or null:', !!element, !!element?.parentNode);
                }
                objectsToRemove.push(id);
            } else if (typeof id !== 'string') {
                console.log('  → REMOVING non-string-keyed object:', id);
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                    console.log('    ✓ Removed from DOM');
                } else {
                    console.log('    ⚠️ Element not in DOM or null:', !!element, !!element?.parentNode);
                }
                objectsToRemove.push(id);
            } else {
                console.log('  → KEEPING player object:', id);
            }
        });

        // Remove from tracking Map
        objectsToRemove.forEach(id => {
            this.gameObjects.delete(id);
        });

        // Additional DOM cleanup - remove any game objects that might not be tracked
        if (this.gameArea) {
            const gameObjectElements = this.gameArea.querySelectorAll('.game-object');
            console.log('🔍 ADDITIONAL DOM CLEANUP: Found', gameObjectElements.length, 'elements with .game-object class');
            gameObjectElements.forEach(element => {
                if (element.id !== 'tanuki') {
                    console.log('  → FORCE REMOVING untracked game object:', element.id, element.className);
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }
            });
        }

        // Clear effects
        if (this.effectsContainer) {
            this.effectsContainer.innerHTML = '';
            console.log('🧹 EFFECTS: Cleared effects container');
        }

        console.log('🧹 CLEANUP COMPLETE: Removed', objectsToRemove.length, 'tracked objects. Map now has:', this.gameObjects.size, 'objects');

        // Final audit
        if (this.gameArea) {
            const finalChildren = Array.from(this.gameArea.children);
            console.log('🔍 FINAL AUDIT: Game area now has', finalChildren.length, 'child elements:');
            finalChildren.forEach(child => {
                console.log('  - Element:', child.tagName, 'ID:', child.id, 'Classes:', child.className);
            });
        }
    }

    // Animation management
    addAnimation(animationFn) {
        this.animations.add(animationFn);
    }

    removeAnimation(animationFn) {
        this.animations.delete(animationFn);
    }

    // Game area dimensions
    getGameAreaDimensions() {
        if (!this.gameArea) return { width: 0, height: 0 };

        const rect = this.gameArea.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height,
            left: rect.left,
            top: rect.top
        };
    }

    // Responsive handling
    handleResize() {
        // Update any responsive elements if needed
        const dimensions = this.getGameAreaDimensions();
        console.log('Game area dimensions:', dimensions);
    }

    // Debug method
    getObjectCount() {
        return {
            gameObjects: this.gameObjects.size,
            activeAnimations: this.animations.size
        };
    }
}

// Add CSS for additional animations not in main CSS files
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
    }

    @keyframes shine {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }

    @keyframes power-up-text {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        50% {
            opacity: 1;
            transform: translateY(-30px) scale(1.2);
        }
        100% {
            opacity: 0;
            transform: translateY(-60px) scale(0.8);
        }
    }

    @keyframes projectile-glow {
        0% {
            transform: scale(0.5);
            opacity: 0.5;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    .player.moving {
        animation: player-move 0.3s ease-in-out;
    }

    @keyframes player-move {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;

document.head.appendChild(additionalStyles);

// Initialize display manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.display = new DisplayManager();

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.display) {
            window.display.handleResize();
        }
    });
});