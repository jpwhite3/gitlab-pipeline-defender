/**
 * Pipeline Defender - Core Game Logic
 * Handles game state, mechanics, and coordination between all systems
 */

class PipelineDefenderGame {
    constructor() {
        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.isRunning = false;
        this.isPaused = false;
        this.frameCounter = 0;

        // Game configuration
        this.config = {
            gameTime: 60, // seconds - survival time for score-based gameplay
            playerSpeed: 6,
            projectileSpeed: 6,
            bugSpeed: 1.0,
            powerUpSpeed: 0.6,
            playerSize: 50,
            projectileSize: 3, // Decreased from 4 - smaller projectiles for more challenging aim
            bugSize: 45, // Increased from 40 - slightly larger bugs for better visibility
            powerUpSize: 55,
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
        this.collectedPowerUps = []; // All power-ups collected (allows duplicates)
        this.uniquePowerUps = new Set(); // Unique power-ups for pipeline status display
        this.bugStats = {
            'Functional Errors': 0,
            'Security Bugs': 0,
            'Quality Bugs': 0,
            'Embedded Secrets': 0
        };

        // Bug escape tracking for penalty system
        this.bugsEscaped = 0;

        // Issue #12: Power-up frequency control (1 every 10 seconds with type cycling)
        this.powerUpTimer = 0;
        this.powerUpInterval = 10; // seconds between power-ups
        this.currentPowerUpIndex = 0; // for cycling through power-up types

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
        if (window.display && window.display.gameArea && typeof window.display.getGameAreaDimensions === 'function') {
            try {
                const dimensions = window.display.getGameAreaDimensions();
                console.log('Display dimensions:', dimensions);
                // Ensure we have valid dimensions
                if (dimensions.width > 0 && dimensions.height > 0) {
                    this.gameWidth = Math.max(dimensions.width, 400); // Minimum width
                    this.gameHeight = Math.max(dimensions.height, 300); // Minimum height
                } else {
                    throw new Error('Invalid dimensions returned');
                }
            } catch (error) {
                console.warn('Error getting display dimensions, using fallback:', error);
                this.gameWidth = 800; // fallback
                this.gameHeight = 600;
            }
        } else {
            console.log('Display not fully available, using fallback dimensions');
            this.gameWidth = 800; // fallback
            this.gameHeight = 600;
        }

        console.log('Game bounds set to:', { width: this.gameWidth, height: this.gameHeight });

        // Debug: Log actual game area element dimensions
        if (window.display && window.display.gameArea) {
            try {
                const rect = window.display.gameArea.getBoundingClientRect();
                console.log('Game area DOM rect:', rect);
            } catch (error) {
                console.warn('Error getting game area rect:', error);
            }
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
        console.log('🎮 Starting new game...');

        // Ensure any previous game is fully stopped
        this.isRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Update game bounds first
        this.updateGameBounds();

        // Reset game state
        this.gameState = 'playing';
        this.isRunning = true;
        this.isPaused = false;

        // Reset game data
        this.score = 0;
        this.timeLeft = this.config.gameTime;
        this.gameStartTime = Date.now();
        this.collectedPowerUps = [];
        this.uniquePowerUps = new Set();
        this.bugStats = {
            'Functional Errors': 0,
            'Security Bugs': 0,
            'Quality Bugs': 0,
            'Embedded Secrets': 0
        };

        // Issue #12: Reset power-up timer and cycling index
        this.powerUpTimer = 0;
        this.currentPowerUpIndex = 0;

        // Reset bug escape counter
        this.bugsEscaped = 0;

        // Clear objects
        this.projectiles = [];
        this.bugs = [];
        this.powerUps = [];

        // Reset IDs
        this.nextProjectileId = 1;
        this.nextBugId = 1;
        this.nextPowerUpId = 1;

        // Reset player after bounds are set
        this.resetPlayer();

        console.log('Game state reset:', {
            gameState: this.gameState,
            gameWidth: this.gameWidth,
            gameHeight: this.gameHeight,
            playerPosition: this.player,
            isRunning: this.isRunning
        });

        // Clear display with error handling
        if (window.display) {
            try {
                window.display.clearGameObjects();
                window.display.ensureHUDVisible(); // Ensure HUD is visible
            } catch (error) {
                console.error('Error during cleanup, continuing anyway:', error);
            }
            window.display.updateScore(this.score);
            window.display.updateTimer(this.timeLeft);
            window.display.updatePipelineStatus(Array.from(this.uniquePowerUps));
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
                try {
                    this.update(deltaTime);
                    this.render(); // Add canvas rendering
                } catch (error) {
                    console.error('Error in game loop:', error);
                    this.endGame(false, 'Game error occurred');
                    return;
                }
            }

            // Only continue game loop if still running
            if (this.isRunning) {
                requestAnimationFrame(this.gameLoop);
            }
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

                // Issue #12: Power-up timing control (1 every 10 seconds)
                this.powerUpTimer++;
                if (this.powerUpTimer >= this.powerUpInterval) {
                    this.spawnPowerUp();
                    this.powerUpTimer = 0; // Reset timer
                }

                if (window.display) {
                    window.display.updateTimer(this.timeLeft);
                }

                if (this.timeLeft <= 0) {
                    this.endGame(true, 'Mission complete! You survived the full 60 seconds!');
                }
            }
        }, 1000);
    }

    update(deltaTime) {
        this.frameCounter++;

        // Handle input
        this.handleInput();

        // Update game objects
        this.updatePlayer();
        this.updateProjectiles();
        this.updateBugs();
        this.updatePowerUps();

        // Spawn new objects
        this.spawnObjects();

        // Check collisions after movement
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

            // Store old position for collision detection
            // If this is the first frame, oldY should be the current Y
            if (projectile.oldY === undefined) {
                projectile.oldY = projectile.y;
            } else {
                projectile.oldY = projectile.y;
            }

            projectile.y -= this.config.projectileSpeed; // Move up (decrease y)

            // Removed verbose projectile logging

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

            // Remove bugs that reach the bottom (Issue #13: score-based survival, no game over from bugs reaching bottom)
            if (bug.y + bug.height >= this.gameHeight) {
                // Bug escaped - apply penalty and count
                this.bugsEscaped++;
                this.score = Math.max(0, this.score - 1); // -1 point penalty, don't go below 0

                // Update score display
                if (window.display) {
                    window.display.updateScore(this.score);
                }

                this.removeBug(i);
                continue;
            }
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

        // Issue #12: Power-ups now spawn via timer (every 10 seconds) instead of random probability
        // Power-up spawning moved to startTimer() method
    }

    spawnBug() {
        // All bug types continue to spawn for continuous gameplay
        // Power-ups clear existing bugs but don't prevent respawning
        const bugType = this.bugTypes[Math.floor(Math.random() * this.bugTypes.length)];

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
        // Issue #12: Cycle through power-up types instead of random selection
        const powerUpType = this.powerUpTypes[this.currentPowerUpIndex];
        this.currentPowerUpIndex = (this.currentPowerUpIndex + 1) % this.powerUpTypes.length;

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
        // Simple, direct collision detection - no complex deferred removal
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (!projectile) continue;

            let hasHit = false;

            // Check bugs first - remove projectile immediately after first hit
            for (let j = this.bugs.length - 1; j >= 0 && !hasHit; j--) {
                const bug = this.bugs[j];

                if (this.isColliding(projectile, bug)) {
                    // Immediate removal - no deferred processing
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

                    hasHit = true; // Prevent checking other targets
                }
            }

            // Only check power-ups if projectile hasn't hit a bug and still exists
            if (!hasHit && i < this.projectiles.length && this.projectiles[i]) {
                for (let j = this.powerUps.length - 1; j >= 0 && !hasHit; j--) {
                    const powerUp = this.powerUps[j];

                    if (this.isColliding(projectile, powerUp)) {
                        // Immediate removal
                        this.removeProjectile(i);
                        this.removePowerUp(j);

                        // Collect power-up
                        this.collectPowerUp(powerUp);

                        hasHit = true; // Prevent further processing
                    }
                }
            }
        }
    }

    isColliding(projectile, target) {
        // Simple box collision detection - reliable and fast
        return projectile.x < target.x + target.width &&
               projectile.x + projectile.width > target.x &&
               projectile.y < target.y + target.height &&
               projectile.y + projectile.height > target.y;
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
        // Add to collected list (allows duplicates for scoring)
        this.collectedPowerUps.push(powerUp.type);
        // Track unique power-ups for pipeline status display
        this.uniquePowerUps.add(powerUp.type);
        this.addScore(1000);

        // Remove all bugs of the corresponding type currently on screen
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
            // Use unique power-ups for pipeline status (shows which types have been collected at least once)
            window.display.updatePipelineStatus(Array.from(this.uniquePowerUps));
        }

        // Score-based gameplay: Power-ups clear current bugs but don't prevent respawning
        // Players survive 60 seconds and maximize score through repeated power-up collection
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
            size: this.config.projectileSize,
            hasCollided: false
        };

        console.error('SHOOT: Player at Y:', this.player.y, 'Projectile created at Y:', projectile.y);

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

        // Vibration feedback on mobile (disabled - not supported in all browsers)
        if (window.input && window.input.vibrate) {
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
            bugsEscaped: this.bugsEscaped,
            powerupsCollected: this.collectedPowerUps.length,
            uniquePowerUpsCollected: this.uniquePowerUps.size,
            totalPowerUpTypes: this.powerUpTypes.length,
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

    // Canvas rendering method
    render() {
        if (window.display && window.display.render) {
            const gameState = {
                player: this.player,
                projectiles: this.projectiles,
                bugs: this.bugs,
                powerUps: this.powerUps
            };
            window.display.render(gameState);
        }
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

// Make PipelineDefenderGame available globally
window.PipelineDefenderGame = PipelineDefenderGame;