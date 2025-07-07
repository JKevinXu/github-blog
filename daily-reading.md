---
layout: page
title: "Daily Reading"
permalink: /daily-reading/
---

<div class="daily-reading-container">
    <div class="reading-header">
        <h1>Daily Reading Collection</h1>
        <p>Save and organize articles, blogs, and resources you read daily.</p>
        <p><a href="/daily-reading-setup/" style="color: #007bff; text-decoration: none;">📖 Setup Guide & Instructions</a></p>
        
        <div class="reading-actions">
            <button id="add-reading-btn" class="btn btn-primary">Add Reading Item</button>
            <button id="export-readings-btn" class="btn btn-secondary">Export All</button>
            <button id="github-setup-btn" class="btn btn-info">⚙️ GitHub Sync Setup</button>
            <button id="clear-readings-btn" class="btn btn-danger">Clear All</button>
        </div>
        
        <div id="storage-status" class="storage-status">
            <span id="storage-indicator">📱 Local Storage</span>
            <span id="sync-status"></span>
        </div>
    </div>

    <!-- Add Reading Form -->
    <div id="add-reading-form" class="reading-form" style="display: none;">
        <h3>Add New Reading Item</h3>
        <form id="reading-item-form">
            <div class="form-group">
                <label for="reading-title">Title:</label>
                <input type="text" id="reading-title" required>
            </div>
            <div class="form-group">
                <label for="reading-url">URL:</label>
                <input type="url" id="reading-url" required>
            </div>
            <div class="form-group">
                <label for="reading-notes">Notes (optional):</label>
                <textarea id="reading-notes" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label for="reading-tags">Tags (comma-separated):</label>
                <input type="text" id="reading-tags" placeholder="tech, blog, tutorial">
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save Reading</button>
                <button type="button" id="cancel-add-btn" class="btn btn-secondary">Cancel</button>
            </div>
        </form>
    </div>

    <!-- Filter Controls -->
    <div class="reading-filters">
        <input type="text" id="search-readings" placeholder="Search readings..." class="search-input">
        <select id="filter-by-tag" class="filter-select">
            <option value="">All Tags</option>
        </select>
        <input type="date" id="filter-by-date" class="filter-date">
    </div>

    <!-- Reading Items List -->
    <div id="reading-items-container">
        <div id="no-readings-message" class="no-items-message">
            <p>No reading items saved yet. Start by adding your first item!</p>
        </div>
        <div id="reading-items-list"></div>
    </div>
</div>

<!-- Bookmarklet Instructions -->
<div class="bookmarklet-section">
    <h2>Quick Save Bookmarklet</h2>
    <p>Drag this bookmarklet to your bookmarks bar to quickly save any webpage you're reading:</p>
    <div class="bookmarklet-container">
        <a href="javascript:(function(){var title=document.title;var url=window.location.href;var selectedText=window.getSelection().toString();var notes=selectedText||'';var blogUrl='{{ site.url }}{{ site.baseurl }}/daily-reading/';var data={title:title,url:url,notes:notes,timestamp:new Date().toISOString()};localStorage.setItem('pendingReading',JSON.stringify(data));alert('Reading item saved! Visit '+blogUrl+' to manage your readings.');})();" class="bookmarklet">📚 Save Reading</a>
    </div>
    <p><small>After dragging to bookmarks, click it on any webpage to quickly save it to your reading list.</small></p>
</div>

<style>
.daily-reading-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.reading-header {
    text-align: center;
    margin-bottom: 30px;
}

.reading-actions {
    margin: 20px 0;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 0 5px;
    text-decoration: none;
    display: inline-block;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-danger {
    background-color: #dc3545;
    color: white;
}

.btn-info {
    background-color: #17a2b8;
    color: white;
}

.btn:hover {
    opacity: 0.8;
}

.reading-form {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 5px;
    margin: 20px 0;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
}

.form-actions {
    margin-top: 20px;
}

.reading-filters {
    display: flex;
    gap: 10px;
    margin: 20px 0;
    flex-wrap: wrap;
}

.search-input,
.filter-select,
.filter-date {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    flex: 1;
    min-width: 200px;
}

.reading-item {
    background: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 20px;
    margin: 15px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.reading-item-header {
    display: flex;
    justify-content: between;
    align-items: flex-start;
    margin-bottom: 10px;
}

.reading-item-title {
    margin: 0 0 5px 0;
    color: #007bff;
}

.reading-item-url {
    color: #666;
    font-size: 0.9em;
    word-break: break-all;
}

.reading-item-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px 0;
    font-size: 0.9em;
    color: #666;
}

.reading-item-notes {
    margin: 10px 0;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 4px;
    font-style: italic;
}

.reading-item-tags {
    margin: 10px 0;
}

.tag {
    display: inline-block;
    background: #e9ecef;
    color: #495057;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    margin: 2px;
}

.reading-item-actions {
    text-align: right;
    margin-top: 10px;
}

.btn-small {
    padding: 5px 10px;
    font-size: 0.8em;
}

.no-items-message {
    text-align: center;
    color: #666;
    font-style: italic;
    margin: 40px 0;
}

.bookmarklet-section {
    margin-top: 40px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 5px;
}

.bookmarklet-container {
    text-align: center;
    margin: 15px 0;
}

.bookmarklet {
    display: inline-block;
    background: #007bff;
    color: white;
    padding: 10px 20px;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
}

.bookmarklet:hover {
    background: #0056b3;
    color: white;
}

.storage-status {
    text-align: center;
    margin: 15px 0;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 5px;
    font-size: 0.9em;
}

.storage-status #storage-indicator {
    font-weight: bold;
    margin-right: 10px;
}

.storage-status #sync-status {
    color: #666;
    font-style: italic;
}

@media (max-width: 768px) {
    .reading-filters {
        flex-direction: column;
    }
    
    .search-input,
    .filter-select,
    .filter-date {
        min-width: auto;
    }
    
    .reading-item-header {
        flex-direction: column;
    }
    
    .reading-item-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
}
</style>

<script src="{{ '/assets/js/github-storage.js' | relative_url }}"></script>

<script>
class DailyReadingManager {
    constructor() {
        this.storageKey = 'dailyReadings';
        this.init();
    }

    init() {
        this.loadReadings();
        this.attachEventListeners();
        this.loadPendingReading();
        this.updateTagFilter();
    }

    attachEventListeners() {
        document.getElementById('add-reading-btn').addEventListener('click', () => this.showAddForm());
        document.getElementById('cancel-add-btn').addEventListener('click', () => this.hideAddForm());
        document.getElementById('reading-item-form').addEventListener('submit', (e) => this.handleAddReading(e));
        document.getElementById('export-readings-btn').addEventListener('click', () => this.exportReadings());
        document.getElementById('clear-readings-btn').addEventListener('click', () => this.clearReadings());
        
        document.getElementById('search-readings').addEventListener('input', () => this.filterReadings());
        document.getElementById('filter-by-tag').addEventListener('change', () => this.filterReadings());
        document.getElementById('filter-by-date').addEventListener('change', () => this.filterReadings());
    }

    showAddForm() {
        document.getElementById('add-reading-form').style.display = 'block';
        document.getElementById('reading-title').focus();
    }

    hideAddForm() {
        document.getElementById('add-reading-form').style.display = 'none';
        this.clearForm();
    }

    clearForm() {
        document.getElementById('reading-item-form').reset();
    }

    handleAddReading(e) {
        e.preventDefault();
        
        const title = document.getElementById('reading-title').value;
        const url = document.getElementById('reading-url').value;
        const notes = document.getElementById('reading-notes').value;
        const tags = document.getElementById('reading-tags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        const reading = {
            id: Date.now(),
            title,
            url,
            notes,
            tags,
            timestamp: new Date().toISOString(),
            dateAdded: new Date().toLocaleDateString()
        };

        this.addReading(reading);
        this.hideAddForm();
    }

    addReading(reading) {
        const readings = this.getReadings();
        readings.unshift(reading);
        this.saveReadings(readings);
        this.loadReadings();
        this.updateTagFilter();
    }

    getReadings() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    saveReadings(readings) {
        localStorage.setItem(this.storageKey, JSON.stringify(readings));
    }

    loadReadings() {
        const readings = this.getReadings();
        this.displayReadings(readings);
    }

    loadPendingReading() {
        const pending = localStorage.getItem('pendingReading');
        if (pending) {
            const reading = JSON.parse(pending);
            document.getElementById('reading-title').value = reading.title || '';
            document.getElementById('reading-url').value = reading.url || '';
            document.getElementById('reading-notes').value = reading.notes || '';
            this.showAddForm();
            localStorage.removeItem('pendingReading');
        }
    }

    displayReadings(readings) {
        const container = document.getElementById('reading-items-list');
        const noItemsMsg = document.getElementById('no-readings-message');
        
        if (readings.length === 0) {
            container.innerHTML = '';
            noItemsMsg.style.display = 'block';
            return;
        }

        noItemsMsg.style.display = 'none';
        container.innerHTML = readings.map(reading => this.createReadingItemHTML(reading)).join('');
        
        // Attach delete event listeners
        readings.forEach(reading => {
            const deleteBtn = document.getElementById(`delete-${reading.id}`);
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteReading(reading.id));
            }
        });
    }

    createReadingItemHTML(reading) {
        const tagsHTML = reading.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        const notesHTML = reading.notes ? `<div class="reading-item-notes">"${reading.notes}"</div>` : '';
        
        return `
            <div class="reading-item">
                <div class="reading-item-header">
                    <div>
                        <h3 class="reading-item-title">
                            <a href="${reading.url}" target="_blank">${reading.title}</a>
                        </h3>
                        <div class="reading-item-url">${reading.url}</div>
                    </div>
                </div>
                <div class="reading-item-meta">
                    <span>Added: ${reading.dateAdded}</span>
                    <span>${new Date(reading.timestamp).toLocaleString()}</span>
                </div>
                ${notesHTML}
                <div class="reading-item-tags">${tagsHTML}</div>
                <div class="reading-item-actions">
                    <button id="delete-${reading.id}" class="btn btn-danger btn-small">Delete</button>
                </div>
            </div>
        `;
    }

    deleteReading(id) {
        if (confirm('Are you sure you want to delete this reading item?')) {
            const readings = this.getReadings().filter(reading => reading.id !== id);
            this.saveReadings(readings);
            this.loadReadings();
            this.updateTagFilter();
        }
    }

    updateTagFilter() {
        const readings = this.getReadings();
        const allTags = [...new Set(readings.flatMap(reading => reading.tags))].sort();
        
        const tagFilter = document.getElementById('filter-by-tag');
        const currentValue = tagFilter.value;
        
        tagFilter.innerHTML = '<option value="">All Tags</option>' + 
            allTags.map(tag => `<option value="${tag}">${tag}</option>`).join('');
        
        tagFilter.value = currentValue;
    }

    filterReadings() {
        const searchTerm = document.getElementById('search-readings').value.toLowerCase();
        const selectedTag = document.getElementById('filter-by-tag').value;
        const selectedDate = document.getElementById('filter-by-date').value;
        
        const readings = this.getReadings();
        const filtered = readings.filter(reading => {
            const matchesSearch = !searchTerm || 
                reading.title.toLowerCase().includes(searchTerm) ||
                reading.notes.toLowerCase().includes(searchTerm) ||
                reading.url.toLowerCase().includes(searchTerm);
            
            const matchesTag = !selectedTag || reading.tags.includes(selectedTag);
            
            const matchesDate = !selectedDate || reading.dateAdded === new Date(selectedDate).toLocaleDateString();
            
            return matchesSearch && matchesTag && matchesDate;
        });
        
        this.displayReadings(filtered);
    }

    exportReadings() {
        const readings = this.getReadings();
        const dataStr = JSON.stringify(readings, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `daily-readings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    clearReadings() {
        if (confirm('Are you sure you want to clear all reading items? This cannot be undone.')) {
            localStorage.removeItem(this.storageKey);
            this.loadReadings();
            this.updateTagFilter();
        }
    }
}

// GitHub Setup Modal
function showGitHubSetup() {
    const modal = document.createElement('div');
    modal.id = 'github-setup-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 999999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        ">
            <h2>🔄 GitHub Sync Setup</h2>
            <p>Enable GitHub sync to store your readings in your repository and access them from any device.</p>
            
            <div style="margin: 20px 0; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                <h4>Benefits:</h4>
                <ul>
                    <li>✅ Cross-device synchronization</li>
                    <li>✅ Permanent storage (never lost)</li>
                    <li>✅ Version history and backup</li>
                    <li>✅ Share readings with others</li>
                </ul>
            </div>
            
            <div style="margin: 20px 0;">
                <h4>Step 1: Create GitHub Personal Access Token</h4>
                <ol>
                    <li>Go to <a href="https://github.com/settings/tokens" target="_blank">GitHub Settings → Personal Access Tokens</a></li>
                    <li>Click "Generate new token (classic)"</li>
                    <li>Name: "Daily Reading Blog"</li>
                    <li>Scopes: Check <strong>"repo"</strong> (Full control of private repositories)</li>
                    <li>Click "Generate token" and copy it</li>
                </ol>
            </div>
            
            <div style="margin: 20px 0;">
                <h4>Step 2: Enter Token</h4>
                <input type="password" id="github-token-input" placeholder="Paste your GitHub token here..." style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    margin-bottom: 10px;
                ">
                <small style="color: #666;">Your token will be stored securely in your browser.</small>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="closeGitHubSetup()" style="
                    padding: 12px 24px;
                    border: 2px solid #6c757d;
                    background: white;
                    color: #6c757d;
                    border-radius: 8px;
                    cursor: pointer;
                ">Cancel</button>
                <button onclick="saveGitHubToken()" style="
                    padding: 12px 24px;
                    border: 2px solid #28a745;
                    background: #28a745;
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                ">💾 Enable GitHub Sync</button>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;">
                <strong>Security Note:</strong> Your token is stored only in your browser's localStorage and is used exclusively to save reading data to your GitHub repository.
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeGitHubSetup() {
    const modal = document.getElementById('github-setup-modal');
    if (modal) modal.remove();
}

function saveGitHubToken() {
    const token = document.getElementById('github-token-input').value.trim();
    if (!token) {
        alert('Please enter a valid GitHub token');
        return;
    }
    
    localStorage.setItem('github_token', token);
    closeGitHubSetup();
    
    // Reinitialize with GitHub storage
    initializeReadingManager();
    alert('✅ GitHub sync enabled! Your readings will now be saved to your repository.');
}

// Enhanced Reading Manager with GitHub Integration
class EnhancedReadingManager extends DailyReadingManager {
    constructor(useGitHub = false) {
        super();
        this.useGitHub = useGitHub;
        this.github = null;
        
        if (useGitHub) {
            this.initGitHub();
        }
    }
    
    initGitHub() {
        const token = localStorage.getItem('github_token');
        if (token) {
            this.github = new GitHubStorage({
                owner: 'JKevinXu',
                repo: 'github-blog',
                token: token,
                branch: 'main',
                filePath: '_data/readings.json'
            });
            this.updateStorageStatus('☁️ GitHub Sync', 'Connected');
        }
    }
    
    updateStorageStatus(indicator, status) {
        const indicatorEl = document.getElementById('storage-indicator');
        const statusEl = document.getElementById('sync-status');
        if (indicatorEl) indicatorEl.textContent = indicator;
        if (statusEl) statusEl.textContent = status;
    }
    
    async init() {
        if (this.github) {
            try {
                await this.github.init();
                await this.syncWithGitHub();
                this.updateStorageStatus('☁️ GitHub Sync', 'Synced successfully');
            } catch (error) {
                console.error('GitHub init failed:', error);
                this.updateStorageStatus('📱 Local Storage', 'GitHub sync failed, using local storage');
                this.useGitHub = false;
                this.github = null;
            }
        } else {
            this.updateStorageStatus('📱 Local Storage', 'Not synced');
        }
        
        super.init();
        this.attachGitHubEventListeners();
    }
    
    attachGitHubEventListeners() {
        const githubSetupBtn = document.getElementById('github-setup-btn');
        if (githubSetupBtn) {
            githubSetupBtn.addEventListener('click', () => {
                if (this.github) {
                    // Already configured, offer to reconfigure
                    if (confirm('GitHub sync is already enabled. Do you want to reconfigure?')) {
                        showGitHubSetup();
                    }
                } else {
                    showGitHubSetup();
                }
            });
        }
    }
    
    async syncWithGitHub() {
        if (!this.github) return this.getReadings();
        
        try {
            this.updateStorageStatus('☁️ GitHub Sync', 'Syncing...');
            const githubReadings = await this.github.getReadings();
            const localReadings = this.getReadings();
            
            // Merge readings
            const merged = this.mergeReadings(githubReadings, localReadings);
            
            // Update both storages
            this.saveReadings(merged);
            if (merged.length !== githubReadings.length) {
                await this.github.saveReadings(merged, 'Sync local readings');
            }
            
            this.updateStorageStatus('☁️ GitHub Sync', `Last synced: ${new Date().toLocaleTimeString()}`);
            return merged;
        } catch (error) {
            console.error('GitHub sync failed:', error);
            this.updateStorageStatus('☁️ GitHub Sync', 'Sync failed');
            return this.getReadings();
        }
    }
    
    mergeReadings(githubReadings, localReadings) {
        const allReadings = [...githubReadings];
        
        localReadings.forEach(localReading => {
            const exists = allReadings.find(r => r.id === localReading.id || 
                (r.url === localReading.url && r.title === localReading.title));
            if (!exists) {
                allReadings.push(localReading);
            }
        });
        
        return allReadings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    async addReading(reading) {
        super.addReading(reading);
        
        if (this.github) {
            try {
                this.updateStorageStatus('☁️ GitHub Sync', 'Saving...');
                await this.github.addReading(reading);
                this.updateStorageStatus('☁️ GitHub Sync', `Saved: ${new Date().toLocaleTimeString()}`);
            } catch (error) {
                console.error('Failed to save to GitHub:', error);
                this.updateStorageStatus('☁️ GitHub Sync', 'Save failed - stored locally');
            }
        }
    }
    
    async deleteReading(id) {
        super.deleteReading(id);
        
        if (this.github) {
            try {
                this.updateStorageStatus('☁️ GitHub Sync', 'Deleting...');
                await this.github.deleteReading(id);
                this.updateStorageStatus('☁️ GitHub Sync', `Updated: ${new Date().toLocaleTimeString()}`);
            } catch (error) {
                console.error('Failed to delete from GitHub:', error);
                this.updateStorageStatus('☁️ GitHub Sync', 'Delete failed - removed locally');
            }
        }
    }
}

// Initialize reading manager
let readingManager;

function initializeReadingManager() {
    const hasGitHubToken = !!localStorage.getItem('github_token');
    readingManager = new EnhancedReadingManager(hasGitHubToken);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeReadingManager();
});
</script> 