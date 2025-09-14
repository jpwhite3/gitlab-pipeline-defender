/**
 * Pipeline Defender - Screen Management System
 * Handles navigation between different game screens
 */

class ScreenManager {
    constructor() {
        this.screens = document.querySelectorAll('.game-screen');
        this.currentScreen = null;
        this.isTransitioning = false;
        this.introSequenceCompleted = false;

        this.initializeScreens();
        this.attachEventListeners();
        this.startInitialSequence();
    }

    initializeScreens() {
        // Hide all screens initially
        this.screens.forEach(screen => {
            screen.classList.remove('active');
        });

        // Screen references for easy access
        this.loadingScreen = document.getElementById('loading-screen');
        this.introScreen = document.getElementById('intro-screen');
        this.menuScreen = document.getElementById('menu-screen');
        this.instructionsScreen = document.getElementById('instructions-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.leaderboardScreen = document.getElementById('leaderboard-screen');

        // Set initial screen
        this.showScreen('loading-screen');
    }

    attachEventListeners() {
        // Menu navigation buttons
        document.getElementById('start-new-game-btn').addEventListener('click', () => {
            this.showScreen('instructions-screen');
        });

        document.getElementById('view-instructions-btn').addEventListener('click', () => {
            this.showScreen('instructions-screen');
        });

        document.getElementById('view-leaderboard-btn').addEventListener('click', () => {
            this.showScreen('leaderboard-screen');
            if (window.leaderboard) {
                window.leaderboard.displayLeaderboard();
            }
        });

        // Instructions screen buttons
        document.getElementById('start-from-instructions-btn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.showScreen('menu-screen');
        });

        // Game over screen buttons
        document.getElementById('submit-score-btn').addEventListener('click', () => {
            this.handleScoreSubmission();
        });

        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('menu-from-game-over-btn').addEventListener('click', () => {
            this.showScreen('menu-screen');
        });

        // Leaderboard screen buttons
        document.getElementById('menu-from-leaderboard-btn').addEventListener('click', () => {
            this.showScreen('menu-screen');
        });

        document.getElementById('reset-scores-btn').addEventListener('click', () => {
            this.handleResetScores();
        });

        document.getElementById('export-data-btn').addEventListener('click', () => {
            this.handleExportData();
        });

        // Global keyboard navigation
        document.addEventListener('keydown', (e) => this.handleGlobalKeyNavigation(e));

        // Name input enter key
        document.getElementById('player-name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleScoreSubmission();
            }
        });
    }

    startInitialSequence() {
        console.log('🎬 Starting initial sequence...');

        // Simulate loading progress
        const progressBar = document.querySelector('.progress-bar-fill');
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 500);

        // Wait for game initialization to complete
        this.waitForInitialization();
    }

    waitForInitialization() {
        console.log('⏳ Waiting for system initialization...');

        const startTime = Date.now();
        const maxWaitTime = 10000; // 10 seconds max wait time

        const checkInitialization = () => {
            const elapsed = Date.now() - startTime;

            if (elapsed > maxWaitTime) {
                console.warn('⚠️ Initialization timeout, proceeding anyway');
                this.proceedToNextScreen();
                return;
            }

            if (window.gameInitializer) {
                const status = window.gameInitializer.getStatus();
                const allInitialized = Object.values(status.initialized).every(val => val === true);

                if (allInitialized) {
                    console.log('✅ All systems initialized, proceeding to intro');
                    this.proceedToNextScreen();
                } else {
                    console.log('⏳ Still waiting for:', Object.entries(status.initialized).filter(([k, v]) => !v).map(([k]) => k));
                    setTimeout(checkInitialization, 500);
                }
            } else {
                console.log('⏳ Game initializer not ready yet');
                setTimeout(checkInitialization, 500);
            }
        };

        // Start checking after a brief delay
        setTimeout(checkInitialization, 1000);
    }

    proceedToNextScreen() {
        if (!this.introSequenceCompleted) {
            this.showScreen('intro-screen');
            this.playIntroSequence();
        } else {
            this.showScreen('menu-screen');
        }
    }

    playIntroSequence() {
        // Transition to menu after intro
        setTimeout(() => {
            this.introSequenceCompleted = true;
            this.showScreen('menu-screen');
        }, 9000);

        // Allow skipping intro with any key or click
        const skipIntro = (e) => {
            if (!this.introSequenceCompleted && e.type === 'keydown' &&
                ['Escape', 'Enter', ' ', 'Space'].includes(e.key)) {
                this.introSequenceCompleted = true;
                this.showScreen('menu-screen');
                document.removeEventListener('keydown', skipIntro);
                document.removeEventListener('click', skipIntro);
            } else if (!this.introSequenceCompleted && e.type === 'click') {
                this.introSequenceCompleted = true;
                this.showScreen('menu-screen');
                document.removeEventListener('keydown', skipIntro);
                document.removeEventListener('click', skipIntro);
            }
        };

        document.addEventListener('keydown', skipIntro);
        document.addEventListener('click', skipIntro);
    }

    showScreen(screenId, options = {}) {
        if (this.isTransitioning) return;

        const targetScreen = document.getElementById(screenId);
        if (!targetScreen) {
            console.error(`Screen not found: ${screenId}`);
            return;
        }

        this.isTransitioning = true;

        // Hide current screen
        if (this.currentScreen) {
            this.currentScreen.classList.remove('active');
            if (options.transition !== false) {
                this.currentScreen.classList.add('screen-transition-out');
            }
        }

        // Show new screen
        setTimeout(() => {
            this.screens.forEach(screen => {
                screen.classList.remove('active', 'screen-transition-out', 'screen-transition-in');
            });

            targetScreen.classList.add('active');
            if (options.transition !== false) {
                targetScreen.classList.add('screen-transition-in');
            }

            this.currentScreen = targetScreen;
            this.isTransitioning = false;

            // Focus management
            this.focusFirstElement(targetScreen);

            // Screen-specific initialization
            this.onScreenShow(screenId);

        }, options.transition !== false ? 300 : 0);
    }

    focusFirstElement(screen) {
        // Find and focus the first interactive element
        const focusableElements = Array.from(
            screen.querySelectorAll('button, input[type="text"]')
        ).filter((el) => el.offsetParent !== null && !el.disabled);

        if (focusableElements.length > 0) {
            // Use multiple timeouts to ensure focus works reliably
            setTimeout(() => {
                try {
                    focusableElements[0].focus();
                    // Double-check focus was applied
                    if (document.activeElement !== focusableElements[0]) {
                        setTimeout(() => {
                            focusableElements[0].focus();
                        }, 100);
                    }
                } catch (e) {
                    console.warn('Could not focus element:', focusableElements[0], e);
                }
            }, 200);
        }
    }

    onScreenShow(screenId) {
        // Handle screen-specific initialization
        switch (screenId) {
            case 'game-screen':
                // Game screen initialization handled by game.js
                break;
            case 'game-over-screen':
                this.setupGameOverScreen();
                break;
            case 'leaderboard-screen':
                if (window.leaderboard) {
                    window.leaderboard.displayLeaderboard();
                }
                break;
        }
    }

    setupGameOverScreen() {
        // Clear previous name
        document.getElementById('player-name-input').value = '';

        // Generate random default name
        const defaultNames = ['DEFENDER', 'GUARDIAN', 'WARRIOR', 'HERO', 'CODER', 'HACKER'];
        const randomName = defaultNames[Math.floor(Math.random() * defaultNames.length)];
        document.getElementById('player-name-input').placeholder = randomName;
    }

    startGame() {
        this.showScreen('game-screen');
        // Wait for screen transition to complete before starting game
        setTimeout(() => {
            if (window.game) {
                window.game.startNewGame();
            }
        }, 400); // Slightly longer than the 300ms transition
    }

    endGame(result) {
        // Handle game end - called by game.js
        const resultTitle = document.getElementById('game-result-title');
        const completionStatus = document.getElementById('completion-status');
        const completionText = document.getElementById('pipeline-completion-text');

        if (result.success) {
            resultTitle.textContent = 'MISSION COMPLETE';
            resultTitle.className = 'game-over-success';
            completionStatus.className = 'completion-status success';
            completionText.textContent = 'Pipeline Status: SECURED ✅';
        } else {
            resultTitle.textContent = 'MISSION FAILED';
            resultTitle.className = 'game-over-failure';
            completionStatus.className = 'completion-status failure';
            completionText.textContent = 'Pipeline Status: COMPROMISED ❌';
        }

        // Update stats
        document.getElementById('final-score-display').textContent = result.score;
        document.getElementById('stat-time-taken').textContent = result.timeTaken;
        document.getElementById('stat-bugs-killed').textContent = result.bugsKilled;
        document.getElementById('stat-functional').textContent = result.bugStats['Functional Errors'] || 0;
        document.getElementById('stat-security').textContent = result.bugStats['Security Bugs'] || 0;
        document.getElementById('stat-quality').textContent = result.bugStats['Quality Bugs'] || 0;
        document.getElementById('stat-secrets').textContent = result.bugStats['Embedded Secrets'] || 0;
        document.getElementById('stat-powerups').textContent = `${result.powerupsCollected}/4`;

        this.showScreen('game-over-screen');
    }

    handleScoreSubmission() {
        const nameInput = document.getElementById('player-name-input');
        let playerName = nameInput.value.trim().toUpperCase();

        if (!playerName) {
            // No name entered - skip leaderboard and go back to menu
            this.showScreen('menu-screen');
            return;
        }

        if (window.leaderboard && window.game) {
            const gameResult = window.game.getGameResult();
            window.leaderboard.submitScore(playerName, gameResult);
        }

        this.showScreen('leaderboard-screen');
        if (window.leaderboard) {
            window.leaderboard.displayLeaderboard();
        }
    }

    handleResetScores() {
        if (confirm('Are you sure you want to reset all scores and stats? This action cannot be undone.')) {
            if (window.leaderboard) {
                window.leaderboard.resetData();
            }

            // Show confirmation
            setTimeout(() => {
                if (window.leaderboard) {
                    window.leaderboard.displayLeaderboard();
                }
            }, 100);
        }
    }

    handleExportData() {
        if (window.leaderboard) {
            window.leaderboard.exportData();
        }
    }

    handleGlobalKeyNavigation(e) {
        // Global keyboard navigation following command-prompt-heroes pattern
        if (this.isTransitioning) return;

        const activeScreen = this.currentScreen;
        if (!activeScreen) return;

        // During gameplay, only handle ESC for game exit, let game handle other keys
        if (activeScreen.id === 'game-screen') {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.handleEscapeNavigation(activeScreen);
            }
            return; // Let game handle all other keys during gameplay
        }

        // ESC key navigation - go back to previous/main screen
        if (e.key === 'Escape') {
            e.preventDefault();
            this.handleEscapeNavigation(activeScreen);
            return;
        }

        const focusedElement = document.activeElement;

        // Enter key - activate focused button or submit name input
        if (e.key === 'Enter') {
            if (focusedElement && focusedElement.tagName === 'BUTTON' && activeScreen.contains(focusedElement)) {
                e.preventDefault();
                focusedElement.click();
            } else if (focusedElement && focusedElement.id === 'player-name-input' && activeScreen.id === 'game-over-screen') {
                e.preventDefault();
                document.getElementById('submit-score-btn').click();
            }
            return;
        }

        // Tab key - cycle through focusable elements
        if (e.key === 'Tab') {
            const focusableElements = Array.from(
                activeScreen.querySelectorAll('button, input[type="text"]')
            ).filter((el) => el.offsetParent !== null && !el.disabled);

            if (focusableElements.length > 0) {
                e.preventDefault();
                const currentIndex = focusableElements.indexOf(focusedElement);

                if (currentIndex >= 0) {
                    // Currently focused element is in the screen - cycle to next/prev
                    const nextIndex = e.shiftKey
                        ? (currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1)
                        : (currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1);
                    focusableElements[nextIndex].focus();
                } else {
                    // No element in screen is focused - focus the first one
                    focusableElements[0].focus();
                }
            }
            return;
        }
    }

    handleEscapeNavigation(activeScreen) {
        // Handle ESC key navigation based on current screen
        switch (activeScreen.id) {
            case 'game-screen':
                // Exit game and return to main menu
                if (window.game) {
                    window.game.endGame(false, 'Game cancelled');
                }
                this.showScreen('menu-screen');
                break;

            case 'instructions-screen':
                this.showScreen('menu-screen');
                break;

            case 'leaderboard-screen':
                this.showScreen('menu-screen');
                break;

            case 'game-over-screen':
                this.showScreen('menu-screen');
                break;

            case 'intro-screen':
                // Skip intro and go to menu
                this.introSequenceCompleted = true;
                this.showScreen('menu-screen');
                break;

            case 'loading-screen':
                // Skip loading and go to menu
                this.showScreen('menu-screen');
                break;

            // menu-screen is the main screen, ESC does nothing
            default:
                break;
        }
    }

    // Public methods for external access
    getCurrentScreen() {
        return this.currentScreen ? this.currentScreen.id : null;
    }

    isGameActive() {
        return this.currentScreen && this.currentScreen.id === 'game-screen';
    }
}

// Initialize screen manager when DOM is ready
// Screens will be initialized by init.js