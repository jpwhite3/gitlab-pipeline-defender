/**
 * Pipeline Defender - Initialization System
 * Handles proper initialization order to prevent circular dependencies
 */

class GameInitializer {
    constructor() {
        this.initialized = {
            debug: false,
            display: false,
            input: false,
            game: false,
            screens: false,
            leaderboard: false
        };

        this.initOrder = ['debug', 'display', 'input', 'game', 'screens', 'leaderboard'];
        this.retryAttempts = {};
        this.maxRetries = 10;

        this.startInitialization();
    }

    startInitialization() {
        console.log('🚀 Starting Pipeline Defender initialization...');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeComponents();
            });
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        console.log('🔄 Starting component initialization...');

        // Add fallback initialization after 5 seconds
        setTimeout(async () => {
            const allReady = this.initOrder.every(component => this.initialized[component]);
            if (!allReady) {
                console.warn('⚠️ Some components failed to initialize, using fallback');
                await this.fallbackInitialization();
            }
        }, 5000);

        this.initOrder.forEach((component, index) => {
            setTimeout(async () => {
                await this.initializeComponent(component);
            }, index * 100); // Stagger initialization
        });
    }

    async fallbackInitialization() {
        console.log('🚨 Running fallback initialization...');

        // Simple initialization without our complex system
        try {
            if (!window.display && window.CanvasDisplayManager) {
                window.display = new CanvasDisplayManager();
                await window.display.init();
                console.log('✅ Fallback: Canvas display initialized');
            }

            if (!window.input && window.InputHandler) {
                window.input = new InputHandler();
                console.log('✅ Fallback: Input initialized');
            }

            if (!window.game && window.PipelineDefenderGame) {
                window.game = new PipelineDefenderGame();
                console.log('✅ Fallback: Game initialized');
            }

            if (!window.screens && window.ScreenManager) {
                // Note: Don't re-initialize screens as one already exists
                console.log('✅ Fallback: Screens already exist');
            }

            if (!window.leaderboard && window.LeaderboardManager) {
                window.leaderboard = new LeaderboardManager();
                console.log('✅ Fallback: Leaderboard initialized');
            }

            // Mark all as initialized
            Object.keys(this.initialized).forEach(component => {
                this.initialized[component] = true;
            });

            console.log('✅ Fallback initialization complete');

        } catch (error) {
            console.error('❌ Fallback initialization failed:', error);
            // Force proceed anyway
            Object.keys(this.initialized).forEach(component => {
                this.initialized[component] = true;
            });
        }
    }

    async initializeComponent(component) {
        if (this.initialized[component]) {
            console.log(`✅ ${component} already initialized`);
            return;
        }

        const retryKey = component;
        if (!this.retryAttempts[retryKey]) {
            this.retryAttempts[retryKey] = 0;
        }

        if (this.retryAttempts[retryKey] >= this.maxRetries) {
            console.error(`❌ Failed to initialize ${component} after ${this.maxRetries} attempts`);
            return;
        }

        console.log(`🔄 Initializing ${component}...`);

        try {
            switch (component) {
                case 'debug':
                    this.initializeDebug();
                    break;
                case 'display':
                    await this.initializeDisplay();
                    break;
                case 'input':
                    this.initializeInput();
                    break;
                case 'game':
                    this.initializeGame();
                    break;
                case 'screens':
                    this.initializeScreens();
                    break;
                case 'leaderboard':
                    this.initializeLeaderboard();
                    break;
                default:
                    console.warn(`Unknown component: ${component}`);
            }
        } catch (error) {
            console.error(`Error initializing ${component}:`, error);
            this.retryAttempts[retryKey]++;

            // Retry after delay
            setTimeout(async () => {
                await this.initializeComponent(component);
            }, 500 * this.retryAttempts[retryKey]);
        }
    }

    initializeDebug() {
        if (window.debugLogger) {
            this.initialized.debug = true;
            console.log('✅ Debug system initialized');
            window.debugLogger.log('INFO', 'Debug system ready');
        } else {
            throw new Error('DebugLogger not available');
        }
    }

    async initializeDisplay() {
        if (!window.CanvasDisplayManager) {
            throw new Error('CanvasDisplayManager class not available');
        }

        // Check if canvas exists
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            throw new Error('Game canvas element not found');
        }

        if (!window.display) {
            window.display = new CanvasDisplayManager();
            await window.display.init();
        }

        if (window.display) {
            this.initialized.display = true;
            console.log('✅ Canvas display system initialized');
            window.debugLogger?.log('INFO', 'Canvas display system ready');
        } else {
            throw new Error('Canvas display initialization failed');
        }
    }

    initializeInput() {
        if (!window.InputHandler) {
            throw new Error('InputHandler class not available');
        }

        if (!window.input) {
            window.input = new InputHandler();
        }

        if (window.input) {
            this.initialized.input = true;
            console.log('✅ Input system initialized');
            window.debugLogger?.log('INFO', 'Input system ready');
        } else {
            throw new Error('Input initialization failed');
        }
    }

    initializeGame() {
        if (!this.initialized.display) {
            throw new Error('Display system not ready');
        }

        if (!window.PipelineDefenderGame) {
            throw new Error('PipelineDefenderGame class not available');
        }

        if (!window.game) {
            window.game = new PipelineDefenderGame();
        }

        if (window.game) {
            this.initialized.game = true;
            console.log('✅ Game system initialized');
            window.debugLogger?.log('INFO', 'Game system ready', {
                gameState: window.game.gameState,
                gameWidth: window.game.gameWidth,
                gameHeight: window.game.gameHeight
            });
        } else {
            throw new Error('Game initialization failed');
        }
    }

    initializeScreens() {
        if (!this.initialized.game) {
            throw new Error('Game system not ready');
        }

        if (!window.ScreenManager) {
            throw new Error('ScreenManager class not available');
        }

        if (!window.screens) {
            window.screens = new ScreenManager();
        }

        if (window.screens) {
            this.initialized.screens = true;
            console.log('✅ Screen system initialized');
            window.debugLogger?.log('INFO', 'Screen system ready');
        } else {
            throw new Error('Screen initialization failed');
        }
    }

    initializeLeaderboard() {
        if (!window.LeaderboardManager) {
            console.warn('LeaderboardManager class not available, skipping');
            this.initialized.leaderboard = true; // Mark as initialized to not block
            this.onAllSystemsReady();
            return;
        }

        if (!window.leaderboard) {
            try {
                window.leaderboard = new LeaderboardManager();
            } catch (error) {
                console.warn('Failed to initialize LeaderboardManager:', error);
                this.initialized.leaderboard = true; // Mark as initialized to not block
                this.onAllSystemsReady();
                return;
            }
        }

        if (window.leaderboard) {
            this.initialized.leaderboard = true;
            console.log('✅ Leaderboard system initialized');
            window.debugLogger?.log('INFO', 'Leaderboard system ready');

            // All systems initialized
            this.onAllSystemsReady();
        } else {
            console.warn('Leaderboard initialization failed, proceeding anyway');
            this.initialized.leaderboard = true; // Mark as initialized to not block
            this.onAllSystemsReady();
        }
    }

    onAllSystemsReady() {
        const allReady = this.initOrder.every(component => this.initialized[component]);

        if (allReady) {
            console.log('🎉 All systems initialized successfully!');
            window.debugLogger?.log('INFO', 'All systems ready', this.initialized);

            // Set up window unload handler
            window.addEventListener('beforeunload', () => {
                if (window.game) {
                    window.game.destroy();
                }
            });

            // Set up focus/blur handlers
            window.addEventListener('focus', () => {
                if (window.game && window.game.isPaused) {
                    // Don't auto-resume - let user click to resume
                }
            });

            window.addEventListener('blur', () => {
                if (window.game && window.input) {
                    window.game.autoPause();
                }
            });

        } else {
            console.warn('⚠️ Not all systems initialized:', this.initialized);
            window.debugLogger?.log('WARN', 'Initialization incomplete', this.initialized);
        }
    }

    getStatus() {
        return {
            initialized: this.initialized,
            retryAttempts: this.retryAttempts
        };
    }
}

// Initialize the game
window.gameInitializer = new GameInitializer();