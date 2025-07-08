// GitHub API Storage for Daily Readings

// Unicode-safe base64 utility functions
const base64Utils = {
    // Encode Unicode string to base64
    encode: (str) => {
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch (error) {
            console.error('Base64 encoding failed:', error);
            throw new Error('Failed to encode data for GitHub storage');
        }
    },
    
    // Decode base64 to Unicode string
    decode: (base64) => {
        try {
            return decodeURIComponent(escape(atob(base64)));
        } catch (error) {
            console.error('Base64 decoding failed:', error);
            throw new Error('Failed to decode data from GitHub storage');
        }
    }
};

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
        console.log('🔍 GitHubStorage.getReadings: Fetching from URL:', url);
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        console.log('🔍 GitHubStorage.getReadings: Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ GitHubStorage.getReadings: API Error:', response.status, errorText);
            throw { status: response.status, message: errorText };
        }

        const data = await response.json();
        console.log('🔍 GitHubStorage.getReadings: File size:', data.size, 'bytes');
        
        // Unicode-safe base64 decoding
        const decodedContent = base64Utils.decode(data.content);
        const readings = JSON.parse(decodedContent);
        console.log('🔍 GitHubStorage.getReadings: Parsed', readings.length, 'readings');
        
        return readings;
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

        // Unicode-safe base64 encoding
        const jsonString = JSON.stringify(readings, null, 2);
        const content = base64Utils.encode(jsonString);

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

// Note: GitHubReadingManager implementation moved to daily-reading.md
// This file now only exports the GitHubStorage class for use by the main reading manager

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GitHubStorage };
} 