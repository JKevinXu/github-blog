// GitHub API Storage for Daily Readings
class GitHubStorage {
    constructor(config) {
        this.owner = config.owner; // Your GitHub username
        this.repo = config.repo;   // Repository name
        this.token = config.token; // GitHub Personal Access Token
        this.branch = config.branch || 'main';
        this.filePath = config.filePath || '_data/readings.json';
        this.apiBase = 'https://api.github.com';
    }

    // Initialize - check if readings file exists, create if not
    async init() {
        try {
            await this.getReadings();
        } catch (error) {
            if (error.status === 404) {
                // File doesn't exist, create it
                await this.saveReadings([]);
            } else {
                throw error;
            }
        }
    }

    // Get current readings from GitHub
    async getReadings() {
        const url = `${this.apiBase}/repos/${this.owner}/${this.repo}/contents/${this.filePath}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw { status: response.status, message: await response.text() };
        }

        const data = await response.json();
        const content = atob(data.content); // Decode base64
        return JSON.parse(content);
    }

    // Save readings to GitHub
    async saveReadings(readings, message = 'Update daily readings') {
        const url = `${this.apiBase}/repos/${this.owner}/${this.repo}/contents/${this.filePath}`;
        
        // Get current file SHA if it exists
        let sha = null;
        try {
            const currentFile = await fetch(url, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (currentFile.ok) {
                const fileData = await currentFile.json();
                sha = fileData.sha;
            }
        } catch (error) {
            // File doesn't exist, will create new
        }

        const content = btoa(JSON.stringify(readings, null, 2)); // Encode to base64

        const body = {
            message,
            content,
            branch: this.branch
        };

        if (sha) {
            body.sha = sha; // Required for updates
        }

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${await response.text()}`);
        }

        return await response.json();
    }

    // Add a new reading
    async addReading(reading) {
        const readings = await this.getReadings();
        readings.unshift(reading);
        await this.saveReadings(readings, `Add reading: ${reading.title}`);
        return readings;
    }

    // Delete a reading
    async deleteReading(readingId) {
        const readings = await this.getReadings();
        const filtered = readings.filter(r => r.id !== readingId);
        await this.saveReadings(filtered, `Delete reading: ${readingId}`);
        return filtered;
    }

    // Update a reading
    async updateReading(readingId, updates) {
        const readings = await this.getReadings();
        const index = readings.findIndex(r => r.id === readingId);
        if (index !== -1) {
            readings[index] = { ...readings[index], ...updates };
            await this.saveReadings(readings, `Update reading: ${readings[index].title}`);
        }
        return readings;
    }

    // Sync local storage with GitHub
    async syncWithLocal() {
        try {
            const githubReadings = await this.getReadings();
            const localReadings = JSON.parse(localStorage.getItem('dailyReadings') || '[]');
            
            // Merge readings (GitHub as source of truth)
            const merged = this.mergeReadings(githubReadings, localReadings);
            
            // Update both storages
            localStorage.setItem('dailyReadings', JSON.stringify(merged));
            if (merged.length !== githubReadings.length) {
                await this.saveReadings(merged, 'Sync local readings with GitHub');
            }
            
            return merged;
        } catch (error) {
            console.error('Sync failed:', error);
            // Fallback to local storage
            return JSON.parse(localStorage.getItem('dailyReadings') || '[]');
        }
    }

    // Merge readings from different sources
    mergeReadings(githubReadings, localReadings) {
        const allReadings = [...githubReadings];
        
        // Add local readings that don't exist in GitHub
        localReadings.forEach(localReading => {
            const exists = allReadings.find(r => r.id === localReading.id || 
                (r.url === localReading.url && r.title === localReading.title));
            if (!exists) {
                allReadings.push(localReading);
            }
        });
        
        // Sort by timestamp (newest first)
        return allReadings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
}

// GitHub-powered Daily Reading Manager
class GitHubReadingManager extends DailyReadingManager {
    constructor(githubConfig) {
        super();
        this.github = new GitHubStorage(githubConfig);
        this.useGitHub = !!githubConfig.token;
    }

    async init() {
        if (this.useGitHub) {
            try {
                await this.github.init();
                await this.syncReadings();
            } catch (error) {
                console.warn('GitHub init failed, falling back to localStorage:', error);
                this.useGitHub = false;
            }
        }
        super.init();
    }

    async syncReadings() {
        if (this.useGitHub) {
            const readings = await this.github.syncWithLocal();
            this.displayReadings(readings);
            this.updateTagFilter();
            return readings;
        }
        return this.getReadings();
    }

    async addReading(reading) {
        if (this.useGitHub) {
            try {
                await this.github.addReading(reading);
                await this.syncReadings();
            } catch (error) {
                console.error('Failed to save to GitHub:', error);
                // Fallback to local storage
                super.addReading(reading);
            }
        } else {
            super.addReading(reading);
        }
    }

    async deleteReading(id) {
        if (this.useGitHub) {
            try {
                await this.github.deleteReading(id);
                await this.syncReadings();
            } catch (error) {
                console.error('Failed to delete from GitHub:', error);
                // Fallback to local storage
                super.deleteReading(id);
            }
        } else {
            super.deleteReading(id);
        }
    }
}

// Configuration and initialization
function initializeGitHubStorage() {
    // Check if GitHub token is available
    const githubToken = localStorage.getItem('github_token') || 
                       prompt('Enter your GitHub Personal Access Token (optional):');
    
    if (githubToken) {
        localStorage.setItem('github_token', githubToken);
        
        const config = {
            owner: 'JKevinXu', // Your GitHub username
            repo: 'github-blog', // Your repository name
            token: githubToken,
            branch: 'main',
            filePath: '_data/readings.json'
        };

        return new GitHubReadingManager(config);
    } else {
        // Use localStorage-only version
        return new DailyReadingManager();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GitHubStorage, GitHubReadingManager };
} 