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
            <button id="import-json-btn" class="btn btn-info">📥 Import JSON</button>
            <button id="github-setup-btn" class="btn btn-info">⚙️ GitHub Sync Setup</button>
            <button id="test-sync-btn" class="btn btn-info">🔄 Test Sync</button>
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
                <textarea id="reading-notes" rows="3" placeholder="Your thoughts and summary..."></textarea>
            </div>
            <div class="form-group">
                <label for="reading-highlights">Highlights/Quotes (optional):</label>
                <textarea id="reading-highlights" rows="4" placeholder="Key highlights or quotes from the article (one per line)..."></textarea>
                <small style="color: #666; font-size: 12px;">Enter each highlight on a new line</small>
            </div>
            <div class="form-group">
                <label for="reading-summary">Key Summary (optional):</label>
                <textarea id="reading-summary" rows="2" placeholder="Brief summary or main takeaway..."></textarea>
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

#test-sync-btn {
    position: relative;
    overflow: hidden;
}

#test-sync-btn:hover {
    background-color: #138496;
    transform: scale(1.02);
    transition: all 0.2s ease;
}

#test-sync-btn:active {
    transform: scale(0.98);
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

.reading-item-summary {
    margin: 10px 0;
    padding: 10px;
    background: #e3f2fd;
    border-radius: 4px;
    border-left: 4px solid #2196f3;
}

.reading-item-highlights {
    margin: 10px 0;
    padding: 10px;
    background: #fff3e0;
    border-radius: 4px;
    border-left: 4px solid #ff9800;
}

.reading-item-highlights ul {
    margin: 8px 0 0 0;
    padding-left: 20px;
}

.reading-item-highlights li {
    margin: 6px 0;
    line-height: 1.4;
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
        document.getElementById('import-json-btn').addEventListener('click', () => this.showImportModal());
        
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
        document.getElementById('reading-highlights').value = '';
        document.getElementById('reading-summary').value = '';
    }

    handleAddReading(e) {
        e.preventDefault();
        
        const title = document.getElementById('reading-title').value;
        const url = document.getElementById('reading-url').value;
        const notes = document.getElementById('reading-notes').value;
        const highlightsText = document.getElementById('reading-highlights').value;
        const summary = document.getElementById('reading-summary').value;
        const tags = document.getElementById('reading-tags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        // Process highlights - split by lines and clean up
        const highlights = highlightsText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const reading = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title,
            url,
            notes,
            highlights,
            summary,
            tags,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            }),
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
        const tagsHTML = reading.tags && reading.tags.length > 0 ? 
            reading.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
            
        const notesHTML = reading.notes ? 
            `<div class="reading-item-notes">
                <strong>Notes:</strong> ${reading.notes}
            </div>` : '';
            
        const summaryHTML = reading.summary ? 
            `<div class="reading-item-summary">
                <strong>Summary:</strong> ${reading.summary}
            </div>` : '';
            
        const highlightsHTML = reading.highlights && reading.highlights.length > 0 ? 
            `<div class="reading-item-highlights">
                <strong>Key Highlights:</strong>
                <ul>
                    ${reading.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                </ul>
            </div>` : '';
        
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
                    <span>Added: ${reading.date || reading.dateAdded}</span>
                    <span>${new Date(reading.timestamp).toLocaleString()}</span>
                </div>
                ${summaryHTML}
                ${notesHTML}
                ${highlightsHTML}
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
                (reading.notes && reading.notes.toLowerCase().includes(searchTerm)) ||
                (reading.summary && reading.summary.toLowerCase().includes(searchTerm)) ||
                (reading.highlights && reading.highlights.some(h => h.toLowerCase().includes(searchTerm))) ||
                reading.url.toLowerCase().includes(searchTerm);
            
            const matchesTag = !selectedTag || (reading.tags && reading.tags.includes(selectedTag));
            
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
        
        // Also show a sample of the exported format
        console.log('Exported format sample:', readings.slice(0, 2));
    }



    showImportModal() {
        const modal = document.createElement('div');
        modal.id = 'import-modal';
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
                max-width: 700px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <h2>📥 Import Reading Data</h2>
                <p>Import readings from JSON format (supports article summarizer exports and our export format).</p>
                
                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 10px; font-weight: bold;">
                        Select JSON file or paste JSON data:
                    </label>
                    <input type="file" id="import-file" accept=".json" style="margin-bottom: 10px;">
                    <textarea id="import-text" rows="10" placeholder="Or paste JSON data here..." style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #ddd;
                        border-radius: 8px;
                        font-family: monospace;
                        font-size: 12px;
                    "></textarea>
                </div>
                
                <div style="margin: 20px 0;">
                    <label style="display: flex; align-items: center; margin-bottom: 10px;">
                        <input type="checkbox" id="merge-readings" checked style="margin-right: 8px;">
                        Merge with existing readings (unchecked = replace all)
                    </label>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="closeImportModal()" style="
                        padding: 12px 24px;
                        border: 2px solid #6c757d;
                        background: white;
                        color: #6c757d;
                        border-radius: 8px;
                        cursor: pointer;
                    ">Cancel</button>
                    <button onclick="processImport()" style="
                        padding: 12px 24px;
                        border: 2px solid #28a745;
                        background: #28a745;
                        color: white;
                        border-radius: 8px;
                        cursor: pointer;
                    ">📥 Import</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // File input handler
        document.getElementById('import-file').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('import-text').value = e.target.result;
                };
                reader.readAsText(file);
            }
        });
    }

    importReadings(jsonData, merge = true) {
        try {
            const data = JSON.parse(jsonData);
            let readings = [];
            
            if (Array.isArray(data)) {
                // Process each item in the array
                readings = data.map(item => this.convertToReadingFormat(item));
            } else {
                // Single item
                readings = [this.convertToReadingFormat(data)];
            }
            
            // Filter out invalid readings
            readings = readings.filter(reading => reading.title && reading.url);
            
            if (merge) {
                const existingReadings = this.getReadings();
                // Merge, avoiding duplicates based on URL
                const existingUrls = new Set(existingReadings.map(r => r.url));
                const newReadings = readings.filter(r => !existingUrls.has(r.url));
                readings = [...newReadings, ...existingReadings];
            }
            
            this.saveReadings(readings);
            this.loadReadings();
            this.updateTagFilter();
            
            return readings.length;
        } catch (error) {
            console.error('Import error:', error);
            throw new Error('Invalid JSON format');
        }
    }

    convertToReadingFormat(item) {
        // Handle different input formats
        const reading = {
            id: item.id || (Date.now().toString() + Math.random().toString(36).substr(2, 9)),
            title: item.title || '',
            url: item.url || '',
            timestamp: item.timestamp || new Date().toISOString(),
            dateAdded: item.dateAdded || item.date || new Date().toLocaleDateString(),
            date: item.date || new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            }),
            tags: item.tags || [],
            notes: item.notes || '',
            summary: item.summary || item.highlight || '',
            highlights: item.highlights || [],
            domain: item.domain || (item.url ? new URL(item.url).hostname : ''),
            favicon: item.favicon || ''
        };
        
        // Handle article summarizer format
        if (item.highlights && Array.isArray(item.highlights)) {
            reading.highlights = item.highlights;
        }
        
        return reading;
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

        const testSyncBtn = document.getElementById('test-sync-btn');
        if (testSyncBtn) {
            testSyncBtn.addEventListener('click', async () => {
                await this.testSync();
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

    async testSync() {
        if (!this.github) {
            alert('❌ GitHub sync is not configured. Please set up GitHub sync first.');
            return;
        }

        try {
            this.updateStorageStatus('☁️ GitHub Sync', 'Testing sync...');
            
            // Test GitHub configuration
            const config = {
                owner: this.github.owner,
                repo: this.github.repo,
                branch: this.github.branch,
                filePath: this.github.filePath,
                hasToken: !!this.github.token
            };
            
            console.log('GitHub Config:', config);
            
            // Test file existence and creation
            try {
                console.log('Testing file access...');
                await this.github.getReadings();
                console.log('✅ File exists and accessible');
            } catch (error) {
                console.log('File access error:', error);
                
                if (error.status === 404) {
                    console.log('🔧 File doesn\'t exist, attempting to create...');
                    try {
                        await this.github.saveReadings([], 'Initial readings file creation');
                        console.log('✅ File created successfully');
                    } catch (createError) {
                        console.error('❌ Failed to create file:', createError);
                        throw createError;
                    }
                } else {
                    throw error;
                }
            }
            
            // Test sync functionality
            const result = await this.syncWithGitHub();
            
            // Show detailed result
            alert(`✅ Sync test successful!\n\nConfiguration:\n- Repository: ${config.owner}/${config.repo}\n- Branch: ${config.branch}\n- File Path: ${config.filePath}\n- Token: ${config.hasToken ? 'Configured' : 'Missing'}\n\nResults:\n- Local readings: ${this.getReadings().length}\n- Synced readings: ${result.length}\n- Last sync: ${new Date().toLocaleTimeString()}\n\nCheck browser console for detailed logs.`);
            
        } catch (error) {
            console.error('Sync test failed:', error);
            
            // Provide detailed error information
            let errorMsg = `❌ Sync test failed!\n\nError: ${error.message || error}\n\nPossible causes:\n`;
            
            if (error.status === 404) {
                errorMsg += '- Repository doesn\'t exist\n- File path is incorrect\n- No permission to access repo';
            } else if (error.status === 401) {
                errorMsg += '- Invalid GitHub token\n- Token expired\n- No repository access';
            } else if (error.status === 403) {
                errorMsg += '- Token lacks required permissions\n- Rate limit exceeded\n- Repository is private';
            } else {
                errorMsg += '- Network connection issue\n- GitHub API temporary issue\n- Invalid configuration';
            }
            
            errorMsg += `\n\nTechnical details:\nStatus: ${error.status}\nMessage: ${error.message}\n\nCheck browser console for full error details.`;
            
            alert(errorMsg);
            this.updateStorageStatus('☁️ GitHub Sync', 'Sync test failed');
        }
    }


}

// Initialize reading manager
let readingManager;

function initializeReadingManager() {
    const hasGitHubToken = !!localStorage.getItem('github_token');
    readingManager = new EnhancedReadingManager(hasGitHubToken);
}

// Global functions for import modal
function closeImportModal() {
    const modal = document.getElementById('import-modal');
    if (modal) modal.remove();
}

function processImport() {
    const jsonText = document.getElementById('import-text').value.trim();
    const mergeReadings = document.getElementById('merge-readings').checked;
    
    if (!jsonText) {
        alert('Please enter JSON data or select a file');
        return;
    }
    
    try {
        const count = readingManager.importReadings(jsonText, mergeReadings);
        alert(`✅ Successfully imported ${count} readings!`);
        closeImportModal();
    } catch (error) {
        alert(`❌ Import failed: ${error.message}`);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeReadingManager();
});
</script> 