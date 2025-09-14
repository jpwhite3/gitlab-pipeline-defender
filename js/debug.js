/**
 * Pipeline Defender - Debug Logging System
 * Comprehensive debugging to identify UI rendering and game state issues
 */

class DebugLogger {
    constructor() {
        this.isEnabled = false; // DISABLED TO PREVENT BROWSER FREEZE
        this.logLevels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3,
            TRACE: 4
        };
        this.currentLevel = this.logLevels.ERROR; // Only errors
        this.logs = [];
        this.maxLogs = 1000;

        this.initializeDebugger();
    }

    initializeDebugger() {
        // Add debug panel to DOM
        this.createDebugPanel();

        // Override console methods to capture logs
        this.interceptConsole();

        // Monitor DOM changes
        this.setupDOMObserver();

        // Track game state changes
        this.setupGameStateTracking();

        this.log('DEBUG', 'DebugLogger initialized successfully');
    }

    createDebugPanel() {
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            max-height: 400px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            padding: 10px;
            border: 1px solid #00ff00;
            border-radius: 5px;
            z-index: 9999;
            overflow-y: auto;
            display: none;
        `;

        const header = document.createElement('div');
        header.innerHTML = `
            <button onclick="window.debugLogger.togglePanel()" style="float: right;">X</button>
            <h4 style="margin: 0; color: #00ff00;">Debug Console</h4>
            <button onclick="window.debugLogger.clearLogs()" style="font-size: 8px;">Clear</button>
        `;

        const logContainer = document.createElement('div');
        logContainer.id = 'debug-log-container';
        logContainer.style.cssText = `
            max-height: 300px;
            overflow-y: auto;
            margin-top: 10px;
            padding: 5px;
            background: rgba(0, 0, 0, 0.5);
        `;

        debugPanel.appendChild(header);
        debugPanel.appendChild(logContainer);
        document.body.appendChild(debugPanel);

        // Add toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = 'Debug';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10000;
            background: #00ff00;
            color: black;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 10px;
            cursor: pointer;
        `;
        toggleBtn.onclick = () => this.togglePanel();
        document.body.appendChild(toggleBtn);
    }

    togglePanel() {
        const panel = document.getElementById('debug-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    clearLogs() {
        this.logs = [];
        const container = document.getElementById('debug-log-container');
        if (container) container.innerHTML = '';
    }

    log(level, message, data = null) {
        if (!this.isEnabled || this.logLevels[level] > this.currentLevel) return;

        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };

        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Output to console
        const consoleMethod = level === 'ERROR' ? 'error' :
                             level === 'WARN' ? 'warn' : 'log';
        console[consoleMethod](`[${timestamp}] ${level}: ${message}`, data || '');

        // Update debug panel
        this.updateDebugPanel(logEntry);
    }

    updateDebugPanel(logEntry) {
        const container = document.getElementById('debug-log-container');
        if (!container) return;

        const logDiv = document.createElement('div');
        logDiv.style.cssText = `
            margin-bottom: 2px;
            padding: 2px;
            color: ${this.getLevelColor(logEntry.level)};
        `;

        logDiv.innerHTML = `
            <span style="color: #666;">[${logEntry.timestamp}]</span>
            <span style="color: ${this.getLevelColor(logEntry.level)};">${logEntry.level}:</span>
            ${logEntry.message}
            ${logEntry.data ? '<br><span style="color: #888;">' + JSON.stringify(logEntry.data, null, 1) + '</span>' : ''}
        `;

        container.appendChild(logDiv);
        container.scrollTop = container.scrollHeight;
    }

    getLevelColor(level) {
        const colors = {
            ERROR: '#ff4444',
            WARN: '#ffaa44',
            INFO: '#44aaff',
            DEBUG: '#00ff00',
            TRACE: '#888888'
        };
        return colors[level] || '#ffffff';
    }

    interceptConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            originalLog.apply(console, args);
            this.log('INFO', args.join(' '));
        };

        console.error = (...args) => {
            originalError.apply(console, args);
            this.log('ERROR', args.join(' '));
        };

        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this.log('WARN', args.join(' '));
        };
    }

    setupDOMObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE &&
                            node.classList.contains('game-object')) {
                            this.log('DEBUG', `Game object added: ${node.id || node.className}`, {
                                top: node.style.top,
                                left: node.style.left,
                                zIndex: node.style.zIndex
                            });
                        }
                    });
                }

                if (mutation.type === 'attributes' &&
                    mutation.target.classList.contains('game-screen')) {
                    this.log('DEBUG', `Screen change: ${mutation.target.id}`, {
                        attribute: mutation.attributeName,
                        classList: Array.from(mutation.target.classList)
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    setupGameStateTracking() {
        // Monitor game state changes
        let lastGameState = null;
        setInterval(() => {
            if (window.game && window.game.gameState !== lastGameState) {
                this.log('INFO', `Game state changed: ${lastGameState} -> ${window.game.gameState}`, {
                    score: window.game.score,
                    timeLeft: window.game.timeLeft,
                    projectiles: window.game.projectiles?.length,
                    bugs: window.game.bugs?.length,
                    powerUps: window.game.powerUps?.length
                });
                lastGameState = window.game.gameState;
            }
        }, 100);
    }

    // Utility methods for debugging specific systems
    debugGameObjects() {
        const gameObjects = document.querySelectorAll('.game-object');
        const debugInfo = Array.from(gameObjects).map(obj => {
            const style = getComputedStyle(obj);
            const rect = obj.getBoundingClientRect();
            return {
                id: obj.id,
                className: obj.className,
                position: {
                    top: obj.style.top,
                    left: obj.style.left,
                    computed: {
                        top: style.top,
                        left: style.left,
                        zIndex: style.zIndex,
                        display: style.display,
                        visibility: style.visibility
                    }
                },
                rect: {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                }
            };
        });

        this.log('DEBUG', `Found ${gameObjects.length} game objects`, debugInfo);
        return debugInfo;
    }

    debugScreens() {
        const screens = document.querySelectorAll('.game-screen');
        const screenInfo = Array.from(screens).map(screen => ({
            id: screen.id,
            active: screen.classList.contains('active'),
            display: getComputedStyle(screen).display,
            visibility: getComputedStyle(screen).visibility
        }));

        this.log('DEBUG', 'Screen states', screenInfo);
        return screenInfo;
    }

    debugGameFlow() {
        if (!window.game) {
            this.log('ERROR', 'Game object not found!');
            return;
        }

        this.log('DEBUG', 'Game flow debug', {
            gameState: window.game.gameState,
            isRunning: window.game.isRunning,
            gameLoop: !!window.game.gameLoop,
            player: window.game.player,
            objects: {
                projectiles: window.game.projectiles?.length,
                bugs: window.game.bugs?.length,
                powerUps: window.game.powerUps?.length
            }
        });
    }

    // Check for infinite loops
    detectInfiniteLoops() {
        let callCount = 0;
        const originalRequestAnimationFrame = window.requestAnimationFrame;

        window.requestAnimationFrame = (callback) => {
            callCount++;
            if (callCount > 1000) {
                this.log('ERROR', 'Possible infinite loop detected in requestAnimationFrame!');
                callCount = 0;
            }
            return originalRequestAnimationFrame(callback);
        };
    }
}

// Initialize debug logger immediately
window.debugLogger = new DebugLogger();