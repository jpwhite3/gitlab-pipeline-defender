/**
 * Pipeline Defender - Core Game Logic
 * Handles game state, mechanics, and coordination between all systems
 */

class PipelineDefenderGame {
    constructor() {
        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.isRunning = false;
        this.isPaused = false;

        // Game configuration
        this.config = {
            gameTime: 90, // seconds
            playerSpeed: 6,
            projectileSpeed: 6,
            bugSpeed: 1.0,
            powerUpSpeed: 0.6,
            playerSize: 50,
            projectileSize: 4,
            bugSize: 40,
            powerUpSize: 60,
            spawnRate: 0.03, // probability per frame (increased)
            powerUpSpawnRate: 0.008 // increased spawn rate
        };

        // Game objects
        this.player = null;
        this.projectiles = [];
        this.bugs = [];
        this.powerUps = [];

        // Game state
        this.score = 0;
        this.timeLeft = this.config.gameTime;
        this.gameStartTime = 0;
        this.collectedPowerUps = [];
        this.bugStats = {
            'Functional Errors': 0,
            'Security Bugs': 0,
            'Quality Bugs': 0,
            'Embedded Secrets': 0
        };

        // Game loop
        this.gameLoop = null;
        this.lastFrameTime = 0;

        // Object ID generators
        this.nextProjectileId = 1;
        this.nextBugId = 1;
        this.nextPowerUpId = 1;

        // Bug types and their corresponding power-ups
        this.bugTypes = ['Functional Errors', 'Security Bugs', 'Quality Bugs', 'Embedded Secrets'];
        this.powerUpTypes = ['TEST', 'CSM', 'SEC', 'QUAL'];
        this.bugToPowerUpMap = {
            'Functional Errors': 'TEST',
            'Security Bugs': 'SEC',
            'Quality Bugs': 'QUAL',
            'Embedded Secrets': 'CSM'
        };

        this.initializeGame();
    }

    initializeGame() {
        // Get game area dimensions for boundaries
        this.updateGameBounds();

        // Initialize player
        this.resetPlayer();

        // Set up game loop
        this.setupGameLoop();
    }

    updateGameBounds() {
        if (window.display) {
            const dimensions = window.display.getGameAreaDimensions();
            // Debug: dimensions logged for development
            this.gameWidth = Math.max(dimensions.width, 400); // Minimum width
            this.gameHeight = Math.max(dimensions.height, 300); // Minimum height
        } else {
            this.gameWidth = 800; // fallback
            this.gameHeight = 600;
        }
        // Game bounds updated successfully

        // Debug: Log actual game area element dimensions
        if (window.display && window.display.gameArea) {
            const rect = window.display.gameArea.getBoundingClientRect();
            // Debug: game area rect logged for development
        }
    }

    resetPlayer() {
        this.player = {
            x: this.gameWidth / 2 - this.config.playerSize / 2,
            y: this.gameHeight - this.config.playerSize - 20, // 20px from bottom, converted to top-based
            width: this.config.playerSize,
            height: this.config.playerSize,
            velocity: 0
        };
    }

    startNewGame() {
        // Starting new game

        // Ensure any previous game is fully stopped
        this.isRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Reset game state
        this.gameState = 'playing';
        this.isRunning = true;
        this.isPaused = false;

        // Reset game data
        this.score = 0;
        this.timeLeft = this.config.gameTime;
        this.gameStartTime = Date.now();
        this.collectedPowerUps = [];
        this.bugStats = {
            'Functional Errors': 0,
            'Security Bugs': 0,
            'Quality Bugs': 0,
            'Embedded Secrets': 0
        };

        // Clear objects
        this.projectiles = [];
        this.bugs = [];
        this.powerUps = [];

        // Reset IDs
        this.nextProjectileId = 1;
        this.nextBugId = 1;
        this.nextPowerUpId = 1;

        // Update game bounds in case of resize
        this.updateGameBounds();
        this.resetPlayer();

        // Clear display with error handling
        if (window.display) {
            try {
                window.display.clearGameObjects();
            } catch (error) {
                console.error('Error during cleanup, continuing anyway:', error);
            }
            window.display.updateScore(this.score);
            window.display.updateTimer(this.timeLeft);
            window.display.updatePipelineStatus(this.collectedPowerUps);
        }

        // Reset input
        if (window.input) {
            window.input.reset();
        }

        // Start game loop
        this.startGameLoop();

        // Game started successfully
    }

    setupGameLoop() {
        this.gameLoop = (timestamp) => {
            if (!this.isRunning) return;

            const deltaTime = timestamp - this.lastFrameTime;
            this.lastFrameTime = timestamp;

            if (!this.isPaused) {
                this.update(deltaTime);
            }

            requestAnimationFrame(this.gameLoop);
        };
    }

    startGameLoop() {
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.gameLoop);

        // Start timer
        this.startTimer();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.isPaused && this.isRunning) {
                this.timeLeft--;

                if (window.display) {
                    window.display.updateTimer(this.timeLeft);
                }

                if (this.timeLeft <= 0) {
                    this.endGame(false, 'Time up! Mission failed.');
                }
            }
        }, 1000);
    }

    update(deltaTime) {
        // Handle input
        this.handleInput();

        // Update game objects
        this.updatePlayer();
        this.updateProjectiles();
        this.updateBugs();
        this.updatePowerUps();

        // Spawn new objects
        this.spawnObjects();

        // Check collisions
        this.checkCollisions();

        // Update display
        this.updateDisplay();
    }

    handleInput() {
        if (!window.input) return;

        const direction = window.input.getMovementDirection();
        this.player.velocity = direction * this.config.playerSpeed;
    }

    updatePlayer() {
        // Update position
        this.player.x += this.player.velocity;

        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(this.gameWidth - this.player.width, this.player.x));

        // Update display
        if (window.display) {
            window.display.updatePlayer({
                x: this.player.x,
                y: this.player.y,
                velocity: this.player.velocity
            });
        }
    }

    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.y -= this.config.projectileSpeed; // Move up (decrease y)

            // Remove if off screen (top)
            if (projectile.y < -projectile.height) {
                if (window.display) {
                    window.display.removeProjectile(projectile.id);
                }
                this.projectiles.splice(i, 1);
                continue;
            }

            // Update display
            if (window.display) {
                window.display.updateProjectile(projectile);
            }
        }
    }

    updateBugs() {
        for (let i = this.bugs.length - 1; i >= 0; i--) {
            const bug = this.bugs[i];
            bug.y += this.config.bugSpeed;

            // Check if bug reached the player (game over)
            if (bug.y + bug.height >= this.player.y) {
                this.endGame(false, 'A bug breached the pipeline! Mission failed.');
                return;
            }

            // Remove if off screen (shouldn't happen due to above check)
            if (bug.y > this.gameHeight) {
                if (window.display) {
                    window.display.removeBug(bug.id);
                }
                this.bugs.splice(i, 1);
                continue;
            }

            // Update display
            if (window.display) {
                window.display.updateBug(bug);
            }
        }
    }

    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += this.config.powerUpSpeed;

            // Remove if off screen
            if (powerUp.y > this.gameHeight) {
                if (window.display) {
                    window.display.removePowerUp(powerUp.id);
                }
                this.powerUps.splice(i, 1);
                continue;
            }

            // Update display
            if (window.display) {
                window.display.updatePowerUp(powerUp);
            }
        }
    }

    spawnObjects() {
        // Spawn bugs
        if (Math.random() < this.config.spawnRate) {
            this.spawnBug();
        }

        // Spawn power-ups
        if (Math.random() < this.config.powerUpSpawnRate) {
            this.spawnPowerUp();
        }
    }

    spawnBug() {
        // Don't spawn bugs of types that have been eliminated
        const availableBugTypes = this.bugTypes.filter(type => {
            const powerUp = this.bugToPowerUpMap[type];
            return !this.collectedPowerUps.includes(powerUp);
        });

        if (availableBugTypes.length === 0) return;

        const bugType = availableBugTypes[Math.floor(Math.random() * availableBugTypes.length)];

        const bug = {
            id: this.nextBugId++,
            x: Math.random() * (this.gameWidth - this.config.bugSize),
            y: -this.config.bugSize,
            width: this.config.bugSize,
            height: this.config.bugSize,
            type: bugType,
            size: this.config.bugSize
        };

        this.bugs.push(bug);
        // Bug spawned successfully

        if (window.display) {
            try {
                window.display.createBug(bug);
                // Bug display created successfully
            } catch (error) {
                console.error('❌ Error creating bug display:', error);
                console.error('Bug data:', bug);
            }
        } else {
            console.error('❌ window.display not available for bug creation');
        }
    }

    spawnPowerUp() {
        // Only spawn power-ups that haven't been collected
        const availablePowerUps = this.powerUpTypes.filter(type =>
            !this.collectedPowerUps.includes(type)
        );

        if (availablePowerUps.length === 0) return;

        const powerUpType = availablePowerUps[Math.floor(Math.random() * availablePowerUps.length)];

        const powerUp = {
            id: this.nextPowerUpId++,
            x: Math.random() * (this.gameWidth - this.config.powerUpSize),
            y: -this.config.powerUpSize,
            width: this.config.powerUpSize,
            height: this.config.powerUpSize,
            type: powerUpType,
            size: this.config.powerUpSize
        };

        this.powerUps.push(powerUp);

        if (window.display) {
            window.display.createPowerUp(powerUp);
        }
    }

    checkCollisions() {
        // Projectile vs Bug collisions
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];

            for (let j = this.bugs.length - 1; j >= 0; j--) {
                const bug = this.bugs[j];

                if (this.isColliding(projectile, bug)) {
                    // Collision detected and processed

                    // Remove projectile and bug
                    this.removeProjectile(i);
                    this.removeBug(j);

                    // Update score and stats
                    this.addScore(10);
                    this.bugStats[bug.type]++;

                    // Visual effects
                    if (window.display) {
                        window.display.createExplosion(bug.x + bug.width/2, bug.y + bug.height/2);
                        window.display.createScorePopup(bug.x + bug.width/2, bug.y, 10);
                    }

                    break; // Projectile can only hit one bug
                }
            }
        }

        // Projectile vs PowerUp collisions
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];

            for (let j = this.powerUps.length - 1; j >= 0; j--) {
                const powerUp = this.powerUps[j];

                if (this.isColliding(projectile, powerUp)) {
                    // Remove projectile and power-up
                    this.removeProjectile(i);
                    this.removePowerUp(j);

                    // Collect power-up
                    this.collectPowerUp(powerUp);

                    break; // Projectile can only hit one power-up
                }
            }
        }
    }

    isColliding(obj1, obj2) {
        const collision = obj1.x < obj2.x + obj2.width &&
                         obj1.x + obj1.width > obj2.x &&
                         obj1.y < obj2.y + obj2.height &&
                         obj1.y + obj1.height > obj2.y;

        // Debug collision bounds
        if (collision) {
            // Debug: Collision bounds calculated
            // Debug: Collision bounds calculated
        }

        return collision;
    }

    removeProjectile(index) {
        const projectile = this.projectiles[index];
        if (window.display) {
            window.display.removeProjectile(projectile.id);
        }
        this.projectiles.splice(index, 1);
    }

    removeBug(index) {
        const bug = this.bugs[index];
        if (window.display) {
            window.display.removeBug(bug.id);
        }
        this.bugs.splice(index, 1);
    }

    removePowerUp(index) {
        const powerUp = this.powerUps[index];
        if (window.display) {
            window.display.removePowerUp(powerUp.id);
        }
        this.powerUps.splice(index, 1);
    }

    collectPowerUp(powerUp) {
        this.collectedPowerUps.push(powerUp.type);
        this.addScore(1000);

        // Remove all bugs of the corresponding type
        const bugTypeToRemove = Object.keys(this.bugToPowerUpMap).find(
            key => this.bugToPowerUpMap[key] === powerUp.type
        );

        if (bugTypeToRemove) {
            for (let i = this.bugs.length - 1; i >= 0; i--) {
                const bug = this.bugs[i];
                if (bug.type === bugTypeToRemove) {
                    if (window.display) {
                        window.display.createExplosion(bug.x + bug.width/2, bug.y + bug.height/2);
                    }
                    this.removeBug(i);
                }
            }
        }

        // Visual effects
        if (window.display) {
            window.display.createScorePopup(powerUp.x + powerUp.width/2, powerUp.y, 1000, true);
            window.display.createPowerUpEffect(powerUp.x + powerUp.width/2, powerUp.y, powerUp.type);
            window.display.updatePipelineStatus(this.collectedPowerUps);
        }

        // Check win condition
        if (this.collectedPowerUps.length === 4) {
            this.endGame(true, 'Pipeline secured! Mission complete!');
        }
    }

    addScore(points) {
        this.score += points;

        if (window.display) {
            window.display.updateScore(this.score);
        }
    }

    shoot() {
        if (!this.isRunning || this.isPaused) return;

        const projectile = {
            id: this.nextProjectileId++,
            x: this.player.x + this.player.width / 2 - this.config.projectileSize / 2,
            y: this.player.y - 15, // Start 15px above player (both using top-based coordinates)
            width: this.config.projectileSize,
            height: 12,
            size: this.config.projectileSize
        };

        this.projectiles.push(projectile);

        if (window.display) {
            try {
                window.display.createProjectile(projectile);
                // Projectile display created successfully
            } catch (error) {
                console.error('❌ Error creating projectile display:', error);
                console.error('Projectile data:', projectile);
            }
            // Debug: Projectile spawn coordinates calculated
        } else {
            console.error('❌ window.display not available for projectile creation');
        }

        // Vibration feedback on mobile
        if (window.input) {
            window.input.vibrate([30]);
        }
    }

    movePlayer(deltaX) {
        this.player.x += deltaX;
        this.player.x = Math.max(0, Math.min(this.gameWidth - this.player.width, this.player.x));

        if (window.display) {
            window.display.updatePlayer({
                x: this.player.x,
                y: this.player.y,
                velocity: deltaX > 0 ? 1 : -1
            });
        }
    }

    updateDisplay() {
        // This is called every frame to update any dynamic elements
        // Most updates are handled by the specific update methods above
    }

    pauseGame() {
        this.isPaused = true;
        // Game paused
    }

    resumeGame() {
        this.isPaused = false;
        // Game resumed
    }

    togglePause() {
        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    autoPause() {
        // Called when window loses focus
        if (this.isRunning && !this.isPaused) {
            this.pauseGame();
        }
    }

    endGame(success, message) {
        // Game ending

        this.isRunning = false;
        this.gameState = 'gameover';

        // Stop timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Calculate final stats
        const timeTaken = this.config.gameTime - this.timeLeft;
        const totalBugsKilled = Object.values(this.bugStats).reduce((a, b) => a + b, 0);

        const gameResult = {
            success: success,
            score: this.score,
            timeTaken: timeTaken,
            bugsKilled: totalBugsKilled,
            powerupsCollected: this.collectedPowerUps.length,
            bugStats: { ...this.bugStats },
            message: message
        };

        this.lastGameResult = gameResult;

        // Show end screen
        if (window.screens) {
            window.screens.endGame(gameResult);
        }

        // Visual feedback
        if (window.display) {
            if (success) {
                window.display.createPowerUpEffect(this.gameWidth / 2, this.gameHeight / 2, 'SUCCESS');
            } else {
                window.display.flashWarning();
                window.display.shakeScreen(2, 500);
            }
        }
    }

    getGameResult() {
        return this.lastGameResult || {
            success: false,
            score: this.score,
            timeTaken: this.config.gameTime - this.timeLeft,
            bugsKilled: Object.values(this.bugStats).reduce((a, b) => a + b, 0),
            powerupsCollected: this.collectedPowerUps.length,
            bugStats: { ...this.bugStats },
            message: 'Game incomplete'
        };
    }

    // Debug methods
    getGameState() {
        return {
            gameState: this.gameState,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            score: this.score,
            timeLeft: this.timeLeft,
            player: this.player,
            projectileCount: this.projectiles.length,
            bugCount: this.bugs.length,
            powerUpCount: this.powerUps.length,
            collectedPowerUps: this.collectedPowerUps,
            bugStats: this.bugStats
        };
    }

    // Cleanup
    destroy() {
        this.isRunning = false;

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        if (window.display) {
            window.display.clearGameObjects();
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new PipelineDefenderGame();

    // Handle window unload
    window.addEventListener('beforeunload', () => {
        if (window.game) {
            window.game.destroy();
        }
    });
});