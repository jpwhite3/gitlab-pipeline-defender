/**
 * Pipeline Defender - Canvas Display Manager
 * Handles all rendering using HTML5 Canvas for reliable visual output
 */

class CanvasDisplayManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.images = {};
        this.gameWidth = 1136;
        this.gameHeight = 626;
    }

    async init() {
        // Get canvas element
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }

        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.canvas.width = this.gameWidth;
        this.canvas.height = this.gameHeight;

        // Add gameArea property for compatibility
        this.gameArea = this.canvas;

        console.error('Canvas display initialized:', this.gameWidth, 'x', this.gameHeight);

        // Load images - will work when served via HTTP server
        await this.loadImages();
        console.error('Canvas: Images loaded:', Object.keys(this.images));
    }

    async loadImages() {
        const imageUrls = {
            tanuki: 'images/gitlab-tanuki.png',
            functionalBug: 'images/functional-bug.png',
            securityBug: 'images/security-bug.png',
            qualityBug: 'images/code-quality-bug.png',
            secretsBug: 'images/embedded-secret-bug.png'
        };

        const loadPromises = Object.entries(imageUrls).map(([key, url]) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.images[key] = img;
                    console.log(`✅ Loaded image: ${key}`);
                    resolve();
                };
                img.onerror = (err) => {
                    console.warn(`❌ Failed to load image: ${url}`, err);
                    resolve(); // Don't fail the whole loading process
                };
                img.src = url;
            });
        });

        await Promise.all(loadPromises);
    }

    // Clear the entire canvas
    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
    }

    // Draw the player (tanuki)
    drawPlayer(player) {
        if (this.images.tanuki) {
            // Draw the actual Tanuki image
            this.ctx.drawImage(
                this.images.tanuki,
                player.x,
                player.y,
                player.width,
                player.height
            );

            // Add GitLab orange glow effect like original CSS
            this.ctx.shadowColor = '#FC6D26'; // GitLab orange
            this.ctx.shadowBlur = 6;
            this.ctx.drawImage(
                this.images.tanuki,
                player.x,
                player.y,
                player.width,
                player.height
            );
            this.ctx.shadowBlur = 0; // Reset shadow
        } else {
            // Fallback: Use bright gold rectangle with better styling
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(player.x, player.y, player.width, player.height);

            // Add white border
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(player.x, player.y, player.width, player.height);

            // Add "🦝" tanuki emoji if available, otherwise "P"
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 20px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🦝', player.x + player.width/2, player.y + player.height/2 + 6);
            this.ctx.textAlign = 'start';
        }
    }

    // Draw a projectile - recreate the beautiful CSS original
    drawProjectile(projectile) {
        const time = Date.now() * 0.01;

        // Main projectile body - rounded rectangle like original
        this.ctx.fillStyle = '#00ff41'; // Primary color
        this.ctx.beginPath();
        this.ctx.roundRect(projectile.x, projectile.y, 12, 24, 6);
        this.ctx.fill();

        // White border like original
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(projectile.x, projectile.y, 12, 24, 6);
        this.ctx.stroke();

        // Animated glow effect like original CSS animation
        const glowIntensity = Math.sin(time) * 0.3 + 0.7;
        this.ctx.shadowColor = '#00ff41';
        this.ctx.shadowBlur = 5 + (glowIntensity * 5);

        // Trail effect
        this.ctx.fillStyle = `rgba(0, 255, 65, ${glowIntensity * 0.3})`;
        this.ctx.fillRect(projectile.x - 2, projectile.y + 24, 16, 8);

        // Reset shadow for other objects
        this.ctx.shadowBlur = 0;
    }

    // Draw a bug using actual images
    drawBug(bug) {
        let bugImage = null;
        let fallbackColor = '#FF0000';

        // Map bug types to images
        switch(bug.type) {
            case 'Functional Errors':
                bugImage = this.images.functionalBug;
                fallbackColor = '#FF4444';
                break;
            case 'Security Bugs':
                bugImage = this.images.securityBug;
                fallbackColor = '#444444';
                break;
            case 'Quality Bugs':
                bugImage = this.images.qualityBug;
                fallbackColor = '#FFFF44';
                break;
            case 'Embedded Secrets':
                bugImage = this.images.secretsBug;
                fallbackColor = '#FF44FF';
                break;
        }

        if (bugImage) {
            // Draw the actual bug image
            this.ctx.drawImage(
                bugImage,
                bug.x,
                bug.y,
                bug.width,
                bug.height
            );

            // Add subtle drop shadow like original CSS
            this.ctx.shadowColor = fallbackColor;
            this.ctx.shadowBlur = 5;
            this.ctx.drawImage(
                bugImage,
                bug.x,
                bug.y,
                bug.width,
                bug.height
            );
            this.ctx.shadowBlur = 0; // Reset shadow
        } else {
            // Fallback: colored rectangles if images don't load
            this.ctx.fillStyle = fallbackColor;
            this.ctx.fillRect(bug.x, bug.y, bug.width, bug.height);

            // Add border
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(bug.x, bug.y, bug.width, bug.height);

            // Add type indicator text
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px monospace';
            this.ctx.fillText(
                bug.type.charAt(0), // First letter of type
                bug.x + 5,
                bug.y + 15
            );
        }
    }

    // Draw a power-up - recreate the beautiful CSS floating and glowing effect
    drawPowerUp(powerUp) {
        const time = Date.now() * 0.001;

        // Float animation like original CSS
        const floatOffset = Math.sin(time * 2) * 5;
        const scaleFloat = 1 + Math.sin(time * 2) * 0.05; // Scale animation
        const currentY = powerUp.y + floatOffset;

        // Glow animation like original CSS
        const glowIntensity = Math.sin(time * 1.5) * 0.5 + 0.5;
        const glowSize = 5 + (glowIntensity * 10);

        // Outer glow
        this.ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
        this.ctx.shadowBlur = glowSize;

        // Power-up colors based on type with lower opacity backgrounds
        let bgColor = '#00ff41';
        let textColor = '#FFFFFF'; // White icons for better contrast
        let text = 'PWR';

        if (powerUp.type) {
            switch(powerUp.type) {
                case 'TEST':
                    bgColor = 'rgba(0, 255, 65, 0.3)'; // Lower opacity green
                    text = '🧪';
                    break;
                case 'CSM':
                    bgColor = 'rgba(255, 102, 0, 0.3)'; // Lower opacity orange
                    text = '🔐';
                    break;
                case 'SEC':
                    bgColor = 'rgba(65, 105, 225, 0.3)'; // Lower opacity blue
                    text = '🛡️';
                    break;
                case 'QUAL':
                    bgColor = 'rgba(255, 255, 0, 0.3)'; // Lower opacity yellow
                    text = '✅';
                    break;
            }
        }

        // Save context for scaling
        this.ctx.save();
        this.ctx.translate(powerUp.x + powerUp.width/2, currentY + powerUp.height/2);
        this.ctx.scale(scaleFloat, scaleFloat);

        // Main power-up body with rounded corners and lower opacity
        this.ctx.fillStyle = bgColor;
        this.ctx.beginPath();
        this.ctx.roundRect(-powerUp.width/2, -powerUp.height/2, powerUp.width, powerUp.height, 8);
        this.ctx.fill();

        // Border with glow effect
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(-powerUp.width/2, -powerUp.height/2, powerUp.width, powerUp.height, 8);
        this.ctx.stroke();

        // Much larger power-up icon - fill most of the box
        this.ctx.fillStyle = textColor;
        this.ctx.font = 'bold 32px monospace'; // Much larger - fills most of the box
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, 0, 8); // Adjusted y offset for larger text

        this.ctx.restore();

        // Reset shadow for other objects
        this.ctx.shadowBlur = 0;
        this.ctx.textAlign = 'start';
    }

    // Draw explosion effect - recreate CSS animation
    drawExplosion(explosion) {
        const elapsed = Date.now() - explosion.startTime;
        const progress = elapsed / explosion.duration;

        if (progress >= 1) return false; // Explosion finished

        // Recreate CSS explosion animation: scale(0.1->1->1.5) + rotate(0->360) + fade
        const scale = progress < 0.5
            ? 0.1 + (progress * 2) * 0.9  // 0.1 to 1.0 in first half
            : 1.0 + (progress - 0.5) * 2 * 0.5; // 1.0 to 1.5 in second half

        const rotation = progress * Math.PI * 2; // 0 to 360 degrees
        const opacity = progress < 0.5 ? 1 : 1 - ((progress - 0.5) * 2); // Fade in second half

        this.ctx.save();
        this.ctx.translate(explosion.x, explosion.y);
        this.ctx.rotate(rotation);
        this.ctx.scale(scale, scale);

        // Multiple explosion rings with different colors
        const colors = ['#ff6600', '#ffff00', '#ff0000', '#ffffff'];
        for (let i = 0; i < colors.length; i++) {
            const ringScale = 1 - (i * 0.2);
            this.ctx.globalAlpha = opacity * (1 - i * 0.2);
            this.ctx.fillStyle = colors[i];

            this.ctx.beginPath();
            this.ctx.arc(0, 0, 30 * ringScale, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
        return true; // Continue animating
    }

    // Draw score popup - recreate CSS animation
    drawScorePopup(popup) {
        const elapsed = Date.now() - popup.startTime;
        const progress = elapsed / popup.duration;

        if (progress >= 1) return false; // Popup finished

        // Recreate CSS score-rise animation: translateY(-60px) + scale(1->1.2->0.8) + fade
        let yOffset, scale, opacity;

        if (progress < 0.3) {
            // First 30%: rise and scale up
            yOffset = -20 * (progress / 0.3);
            scale = 1 + 0.2 * (progress / 0.3);
            opacity = 1;
        } else {
            // Last 70%: continue rising, scale down, fade out
            yOffset = -20 - 40 * ((progress - 0.3) / 0.7);
            scale = 1.2 - 0.4 * ((progress - 0.3) / 0.7);
            opacity = 1 - ((progress - 0.3) / 0.7);
        }

        this.ctx.save();
        this.ctx.translate(popup.x, popup.y + yOffset);
        this.ctx.scale(scale, scale);
        this.ctx.globalAlpha = opacity;

        // Score text with glow - different styling for big scores
        if (popup.isBig) {
            this.ctx.fillStyle = '#FC6D26'; // GitLab orange for big scores
            this.ctx.font = 'bold 24px VT323, monospace';
            this.ctx.shadowColor = '#FC6D26';
        } else {
            this.ctx.fillStyle = '#00ff41';
            this.ctx.font = 'bold 18px VT323, monospace';
            this.ctx.shadowColor = '#00ff41';
        }

        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 10;

        this.ctx.fillText(`+${popup.score}`, 0, 0);

        this.ctx.restore();
        return true; // Continue animating
    }

    // Draw power-up effect
    drawPowerUpEffect(effect) {
        const elapsed = Date.now() - effect.startTime;
        const progress = elapsed / effect.duration;

        if (progress >= 1) return false; // Effect finished

        // Bright expanding circle effect
        const radius = progress * 100;
        const opacity = 1 - progress;

        this.ctx.save();
        this.ctx.globalAlpha = opacity;

        // Colored ring based on power-up type
        let color = '#00ff41';
        if (effect.type === 'SUCCESS') color = '#FFD700';
        else if (effect.type === 'CSM') color = '#ff6600';
        else if (effect.type === 'SEC') color = '#4169e1';
        else if (effect.type === 'QUAL') color = '#ffff00';

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 4;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10;

        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.restore();
        return true; // Continue animating
    }

    // Apply screen shake effect
    applyScreenShake() {
        if (!this.screenShake) return;

        const elapsed = Date.now() - this.screenShake.startTime;
        if (elapsed >= this.screenShake.duration) {
            this.screenShake = null;
            return;
        }

        const progress = elapsed / this.screenShake.duration;
        const intensity = this.screenShake.intensity * (1 - progress);

        const shakeX = (Math.random() - 0.5) * intensity * 2;
        const shakeY = (Math.random() - 0.5) * intensity * 2;

        this.ctx.translate(shakeX, shakeY);
    }

    // Apply warning flash effect
    applyWarningFlash() {
        if (!this.warningFlash) return;

        const elapsed = Date.now() - this.warningFlash.startTime;
        if (elapsed >= this.warningFlash.duration) {
            this.warningFlash = null;
            return;
        }

        // Flash every 300ms
        const flashCycle = (elapsed % 300) / 300;
        const opacity = flashCycle < 0.5 ? 0.3 : 0;

        if (opacity > 0) {
            this.ctx.save();
            this.ctx.fillStyle = `rgba(255, 51, 51, ${opacity})`;
            this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
            this.ctx.restore();
        }
    }

    // Main render method - called every frame
    render(gameState) {
        // Clear canvas
        this.clear();

        // Apply screen shake before drawing anything
        this.ctx.save();
        this.applyScreenShake();

        // Draw all game objects
        if (gameState.player) {
            this.drawPlayer(gameState.player);
        }

        if (gameState.projectiles) {
            gameState.projectiles.forEach(projectile => {
                this.drawProjectile(projectile);
            });
        }

        if (gameState.bugs) {
            gameState.bugs.forEach(bug => {
                this.drawBug(bug);
            });
        }

        if (gameState.powerUps) {
            gameState.powerUps.forEach(powerUp => {
                this.drawPowerUp(powerUp);
            });
        }

        // Draw explosions
        if (this.explosions) {
            this.explosions = this.explosions.filter(explosion => {
                return this.drawExplosion(explosion);
            });
        }

        // Draw power-up effects
        if (this.powerUpEffects) {
            this.powerUpEffects = this.powerUpEffects.filter(effect => {
                return this.drawPowerUpEffect(effect);
            });
        }

        // Draw score popups
        if (this.scorePopups) {
            this.scorePopups = this.scorePopups.filter(popup => {
                return this.drawScorePopup(popup);
            });
        }

        // Restore transform after screen shake
        this.ctx.restore();

        // Apply warning flash overlay (after restoring transform)
        this.applyWarningFlash();

        // Debug info on canvas
        this.drawDebugInfo(gameState);
    }

    drawDebugInfo(gameState) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 300, 100);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px monospace';

        let y = 25;
        this.ctx.fillText(`Player: (${Math.round(gameState.player?.x || 0)}, ${Math.round(gameState.player?.y || 0)})`, 15, y);
        y += 15;
        this.ctx.fillText(`Projectiles: ${gameState.projectiles?.length || 0}`, 15, y);
        y += 15;
        this.ctx.fillText(`Bugs: ${gameState.bugs?.length || 0}`, 15, y);
        y += 15;
        this.ctx.fillText(`PowerUps: ${gameState.powerUps?.length || 0}`, 15, y);
    }

    // Legacy methods for compatibility (will be no-ops or simple implementations)
    updatePlayer() { /* Canvas renders everything in render() */ }
    createProjectile() { /* Canvas renders everything in render() */ }
    updateProjectile() { /* Canvas renders everything in render() */ }
    removeProjectile() { /* Canvas renders everything in render() */ }
    createBug() { /* Canvas renders everything in render() */ }
    updateBug() { /* Canvas renders everything in render() */ }
    removeBug() { /* Canvas renders everything in render() */ }
    createPowerUp() { /* Canvas renders everything in render() */ }
    updatePowerUp() { /* Canvas renders everything in render() */ }
    removePowerUp() { /* Canvas renders everything in render() */ }

    createExplosion(x, y) {
        // For canvas, we'll handle explosions in the render loop
        // Store explosion data for rendering
        if (!this.explosions) {
            this.explosions = [];
        }

        this.explosions.push({
            x: x,
            y: y,
            startTime: Date.now(),
            duration: 500 // milliseconds
        });

        console.log('Canvas: Explosion created at', x, y);
    }

    createScorePopup(x, y, score, isBig = false) {
        // For canvas, we'll handle score popups in the render loop
        if (!this.scorePopups) {
            this.scorePopups = [];
        }

        this.scorePopups.push({
            x: x,
            y: y,
            score: score,
            startTime: Date.now(),
            duration: 1500, // milliseconds like CSS animation
            isBig: isBig
        });

        console.log('Canvas: Score popup created:', score, 'at', x, y, isBig ? '(big)' : '');
    }

    createPowerUpEffect(x, y, type) {
        // Create a special effect for power-up collection
        if (!this.powerUpEffects) {
            this.powerUpEffects = [];
        }

        this.powerUpEffects.push({
            x: x,
            y: y,
            type: type,
            startTime: Date.now(),
            duration: 1000 // milliseconds
        });

        console.log('Canvas: Power-up effect created:', type, 'at', x, y);
    }

    flashWarning() {
        // Create a warning flash effect
        this.warningFlash = {
            startTime: Date.now(),
            duration: 900 // 3 flashes * 300ms each
        };

        console.log('Canvas: Warning flash triggered');
    }

    shakeScreen(intensity, duration) {
        // Create a screen shake effect
        this.screenShake = {
            intensity: intensity || 2,
            startTime: Date.now(),
            duration: duration || 500
        };

        console.log('Canvas: Screen shake triggered:', intensity, 'for', duration, 'ms');
    }

    // Additional required methods
    clearGameObjects() {
        console.log('Canvas: clearGameObjects called (no-op for canvas)');
    }

    updateScore(score) {
        const scoreElement = document.getElementById('score-display');
        if (scoreElement) {
            scoreElement.textContent = score;
        }
    }

    updateTimer(timeLeft) {
        const timerElement = document.getElementById('timer-display');
        if (timerElement) {
            timerElement.textContent = timeLeft;
        }
    }

    ensureHUDVisible() {
        console.log('Canvas: ensureHUDVisible called');
    }

    updatePipelineStatus(collectedPowerUps) {
        // Update the pipeline status indicators in the DOM HUD
        const pipelineItems = ['test', 'csm', 'sec', 'qual'];
        const powerUpMapping = {
            'TEST': 'test',
            'CSM': 'csm',
            'SEC': 'sec',
            'QUAL': 'qual'
        };

        pipelineItems.forEach(item => {
            const element = document.getElementById(`pipeline-${item}`);
            if (element) {
                const powerUpName = Object.keys(powerUpMapping).find(key => powerUpMapping[key] === item);
                const isCollected = collectedPowerUps.includes(powerUpName);

                if (isCollected) {
                    element.classList.add('collected');
                } else {
                    element.classList.remove('collected');
                }
            }
        });
    }

    // Canvas dimensions method
    getCanvasDimensions() {
        return {
            width: this.gameWidth,
            height: this.gameHeight,
            getBoundingClientRect: () => ({
                left: 0,
                top: 0,
                width: this.gameWidth,
                height: this.gameHeight
            })
        };
    }

    // Game area dimensions for game.js compatibility
    getGameAreaDimensions() {
        return {
            width: this.gameWidth,
            height: this.gameHeight
        };
    }
}

// Make CanvasDisplayManager available globally
window.CanvasDisplayManager = CanvasDisplayManager;