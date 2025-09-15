/**
 * Pipeline Defender - Leaderboard System
 * Handles score persistence, statistics, and leaderboard display
 */

class LeaderboardManager {
    constructor() {
        this.LEADERBOARD_KEY = 'pipelineDefenderLeaderboard';
        this.STATS_KEY = 'pipelineDefenderStats';
        this.MAX_ENTRIES = 50; // Maximum number of leaderboard entries to store

        this.leaderboard = [];
        this.stats = {
            totalGames: 0,
            successfulCompletions: 0,
            totalScore: 0,
            averageScore: 0,
            bestTime: null,
            totalPlayTime: 0
        };

        this.loadData();
    }

    loadData() {
        try {
            const storedLeaderboard = localStorage.getItem(this.LEADERBOARD_KEY);
            const storedStats = localStorage.getItem(this.STATS_KEY);

            this.leaderboard = storedLeaderboard ? JSON.parse(storedLeaderboard) : [];
            this.stats = storedStats ? JSON.parse(storedStats) : {
                totalGames: 0,
                successfulCompletions: 0,
                totalScore: 0,
                averageScore: 0,
                bestTime: null,
                totalPlayTime: 0
            };

            // Migrate old data if necessary
            this.migrateOldData();

        } catch (error) {
            console.error('Error loading leaderboard data:', error);
            this.resetData();
        }
    }

    migrateOldData() {
        // Check for old data format and migrate if necessary
        this.leaderboard = this.leaderboard.map(entry => {
            if (!entry.timestamp) {
                entry.timestamp = Date.now();
            }
            if (entry.pipelineComplete === undefined) {
                // For legacy entries, use power-up collection as success indicator
                entry.pipelineComplete = entry.powerupsCollected === 4;
            }
            if (!entry.timeTaken) {
                entry.timeTaken = 90;
            }
            return entry;
        });

        this.saveData();
    }

    saveData() {
        try {
            // Sort leaderboard by score before saving
            this.leaderboard.sort((a, b) => b.score - a.score);

            // Limit the number of entries
            if (this.leaderboard.length > this.MAX_ENTRIES) {
                this.leaderboard = this.leaderboard.slice(0, this.MAX_ENTRIES);
            }

            localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(this.leaderboard));
            localStorage.setItem(this.STATS_KEY, JSON.stringify(this.stats));

        } catch (error) {
            console.error('Error saving leaderboard data:', error);
        }
    }

    submitScore(playerName, gameResult) {
        const entry = {
            name: playerName,
            score: gameResult.score,
            timeTaken: gameResult.timeTaken,
            bugsKilled: gameResult.bugsKilled,
            powerupsCollected: gameResult.powerupsCollected,
            pipelineComplete: gameResult.success,
            bugStats: { ...gameResult.bugStats },
            timestamp: Date.now(),
            date: new Date().toLocaleDateString()
        };

        this.leaderboard.push(entry);
        this.updateStats(gameResult);
        this.saveData();

        return entry;
    }

    updateStats(gameResult) {
        this.stats.totalGames++;
        this.stats.totalScore += gameResult.score;
        this.stats.averageScore = Math.round(this.stats.totalScore / this.stats.totalGames);
        this.stats.totalPlayTime += gameResult.timeTaken;

        if (gameResult.success) {
            this.stats.successfulCompletions++;

            // Update best time for successful completions
            if (this.stats.bestTime === null || gameResult.timeTaken < this.stats.bestTime) {
                this.stats.bestTime = gameResult.timeTaken;
            }
        }
    }

    displayLeaderboard() {
        const leaderboardBody = document.querySelector('#leaderboard-list tbody');
        const totalGamesElement = document.getElementById('total-games-count');
        const successfulCompletionsElement = document.getElementById('successful-completions');

        if (!leaderboardBody) return;

        // Update stats display
        if (totalGamesElement) {
            totalGamesElement.textContent = this.stats.totalGames;
        }
        if (successfulCompletionsElement) {
            successfulCompletionsElement.textContent = this.stats.successfulCompletions;
        }

        // Clear existing entries
        leaderboardBody.innerHTML = '';

        if (this.leaderboard.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="4" style="text-align: center; color: var(--text-secondary);">No scores yet! Be the first defender!</td>';
            leaderboardBody.appendChild(emptyRow);
            return;
        }

        // Sort leaderboard by score
        const sortedLeaderboard = [...this.leaderboard].sort((a, b) => b.score - a.score);

        // Display top entries with animation
        sortedLeaderboard.slice(0, 10).forEach((entry, index) => {
            const row = this.createLeaderboardRow(entry, index + 1);
            leaderboardBody.appendChild(row);
        });
    }

    createLeaderboardRow(entry, rank) {
        const row = document.createElement('tr');
        row.className = `leaderboard-entry rank-${rank}`;

        // Add special styling for top 3
        if (rank <= 3) {
            row.classList.add(`rank-${rank}`);
        }

        // Add pipeline completion indicator
        if (entry.pipelineComplete) {
            row.classList.add('pipeline-complete');
        }

        const rankDisplay = rank === 1 ? '👑' : rank;
        const statusIndicator = entry.pipelineComplete ? '🏆' : '⚠️';
        const statusText = entry.pipelineComplete ? 'SECURED' : 'FAILED';

        row.innerHTML = `
            <td>${rankDisplay}</td>
            <td style="text-align: left;">${entry.name}</td>
            <td style="text-align: right; font-weight: bold;">${entry.score.toLocaleString()}</td>
            <td style="text-align: center;">${statusIndicator} ${statusText}</td>
        `;

        // Add tooltip with detailed info
        const detailInfo = [
            `Time: ${entry.timeTaken}s`,
            `Bugs Killed: ${entry.bugsKilled}`,
            `Power-ups: ${entry.powerupsCollected}/4`,
            `Date: ${entry.date}`
        ].join(' | ');

        row.title = detailInfo;

        return row;
    }

    getTopScores(count = 10) {
        return [...this.leaderboard]
            .sort((a, b) => b.score - a.score)
            .slice(0, count);
    }

    getSuccessfulCompletions() {
        return this.leaderboard.filter(entry => entry.pipelineComplete);
    }

    getPlayerStats(playerName) {
        const playerEntries = this.leaderboard.filter(
            entry => entry.name.toLowerCase() === playerName.toLowerCase()
        );

        if (playerEntries.length === 0) {
            return null;
        }

        const bestScore = Math.max(...playerEntries.map(e => e.score));
        const completions = playerEntries.filter(e => e.pipelineComplete).length;
        const totalGames = playerEntries.length;
        const averageScore = Math.round(
            playerEntries.reduce((sum, e) => sum + e.score, 0) / totalGames
        );

        return {
            playerName,
            bestScore,
            completions,
            totalGames,
            averageScore,
            successRate: Math.round((completions / totalGames) * 100)
        };
    }

    exportData() {
        try {
            const exportData = {
                leaderboard: this.leaderboard,
                stats: this.stats,
                exportDate: new Date().toISOString(),
                gameVersion: '2.0'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `pipeline-defender-scores-${new Date().toISOString().split('T')[0]}.json`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Show success message
            this.showMessage('Data exported successfully!', 'success');

        } catch (error) {
            console.error('Error exporting data:', error);
            this.showMessage('Error exporting data', 'error');
        }
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            if (data.leaderboard && Array.isArray(data.leaderboard)) {
                // Merge with existing data
                const newEntries = data.leaderboard.filter(entry =>
                    !this.leaderboard.some(existing =>
                        existing.name === entry.name &&
                        existing.score === entry.score &&
                        existing.timestamp === entry.timestamp
                    )
                );

                this.leaderboard.push(...newEntries);

                // Update stats if provided
                if (data.stats) {
                    // Recalculate stats from all entries to ensure accuracy
                    this.recalculateStats();
                } else {
                    this.recalculateStats();
                }

                this.saveData();
                this.displayLeaderboard();

                this.showMessage(`Imported ${newEntries.length} new scores!`, 'success');
            } else {
                throw new Error('Invalid data format');
            }

        } catch (error) {
            console.error('Error importing data:', error);
            this.showMessage('Error importing data. Please check the file format.', 'error');
        }
    }

    recalculateStats() {
        this.stats = {
            totalGames: this.leaderboard.length,
            successfulCompletions: this.leaderboard.filter(e => e.pipelineComplete).length,
            totalScore: this.leaderboard.reduce((sum, e) => sum + e.score, 0),
            averageScore: 0,
            bestTime: null,
            totalPlayTime: this.leaderboard.reduce((sum, e) => sum + (e.timeTaken || 90), 0)
        };

        if (this.stats.totalGames > 0) {
            this.stats.averageScore = Math.round(this.stats.totalScore / this.stats.totalGames);
        }

        const successfulCompletions = this.leaderboard.filter(e => e.pipelineComplete);
        if (successfulCompletions.length > 0) {
            this.stats.bestTime = Math.min(...successfulCompletions.map(e => e.timeTaken || 90));
        }
    }

    resetData() {
        this.leaderboard = [];
        this.stats = {
            totalGames: 0,
            successfulCompletions: 0,
            totalScore: 0,
            averageScore: 0,
            bestTime: null,
            totalPlayTime: 0
        };

        this.saveData();
        this.displayLeaderboard();
    }

    showMessage(message, type = 'info') {
        // Simple message display - could be enhanced with a proper notification system
        const messageElement = document.createElement('div');
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--error-color)'};
            color: var(--background-color);
            font-family: 'VT323', monospace;
            font-size: 16px;
            border: 2px solid #000;
            z-index: 10000;
            border-radius: 5px;
        `;
        messageElement.textContent = message;

        document.body.appendChild(messageElement);

        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 3000);
    }

    // Public API methods
    getStats() {
        return { ...this.stats };
    }

    hasAnyScores() {
        return this.leaderboard.length > 0;
    }

    getLastScore() {
        if (this.leaderboard.length === 0) return null;
        return this.leaderboard[this.leaderboard.length - 1];
    }
}

// Make LeaderboardManager available globally
window.LeaderboardManager = LeaderboardManager;