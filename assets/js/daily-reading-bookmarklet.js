// Daily Reading Bookmarklet
// Enhanced version with better UI and functionality

(function() {
    'use strict';
    
    // Check if the modal is already open
    if (document.getElementById('daily-reading-modal')) {
        return;
    }
    
    // Your blog configuration
    const BLOG_CONFIG = {
        url: 'https://jkevinxu.github.io',
        baseurl: '/github-blog',
        dailyReadingPath: '/daily-reading/'
    };
    
    // Get page information
    const pageInfo = {
        title: document.title,
        url: window.location.href,
        selectedText: window.getSelection().toString().trim(),
        metaDescription: getMetaDescription(),
        favicon: getFavicon(),
        domain: window.location.hostname
    };
    
    function getMetaDescription() {
        const metaDesc = document.querySelector('meta[name="description"]');
        return metaDesc ? metaDesc.content : '';
    }
    
    function getFavicon() {
        const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
        if (favicon) return favicon.href;
        return `${window.location.protocol}//${window.location.hostname}/favicon.ico`;
    }
    
    // Create and show modal
    createModal();
    
    function createModal() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'daily-reading-modal';
        overlay.style.cssText = `
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            position: relative;
        `;
        
        modal.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <img src="${pageInfo.favicon}" alt="" style="width: 24px; height: 24px; margin-right: 12px;" onerror="this.style.display='none'">
                <h2 style="margin: 0; color: #333; font-size: 20px;">Save to Daily Reading</h2>
                <button id="dr-close-btn" style="
                    margin-left: auto;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #999;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background-color 0.2s;
                " onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">×</button>
            </div>
            
            <form id="dr-save-form">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">Title:</label>
                    <input type="text" id="dr-title" value="${escapeHtml(pageInfo.title)}" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e1e5e9;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                        transition: border-color 0.2s;
                    " onfocus="this.style.borderColor='#007bff'" onblur="this.style.borderColor='#e1e5e9'">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">URL:</label>
                    <input type="url" id="dr-url" value="${escapeHtml(pageInfo.url)}" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e1e5e9;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                        background: #f8f9fa;
                        transition: border-color 0.2s;
                    " onfocus="this.style.borderColor='#007bff'" onblur="this.style.borderColor='#e1e5e9'" readonly>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">Summary:</label>
                    <textarea id="dr-summary" rows="2" placeholder="Brief summary or main takeaway..." style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e1e5e9;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                        resize: vertical;
                        transition: border-color 0.2s;
                    " onfocus="this.style.borderColor='#007bff'" onblur="this.style.borderColor='#e1e5e9'">${escapeHtml(pageInfo.metaDescription)}</textarea>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">Highlights:</label>
                    <textarea id="dr-highlights" rows="4" placeholder="Key highlights or quotes (one per line)..." style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e1e5e9;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                        resize: vertical;
                        transition: border-color 0.2s;
                    " onfocus="this.style.borderColor='#007bff'" onblur="this.style.borderColor='#e1e5e9'">${escapeHtml(pageInfo.selectedText || '')}</textarea>
                    <small style="color: #666; font-size: 12px;">Enter each highlight on a new line</small>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">Notes:</label>
                    <textarea id="dr-notes" rows="3" placeholder="Your personal thoughts and notes..." style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e1e5e9;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                        resize: vertical;
                        transition: border-color 0.2s;
                    " onfocus="this.style.borderColor='#007bff'" onblur="this.style.borderColor='#e1e5e9'"></textarea>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">Tags:</label>
                    <input type="text" id="dr-tags" placeholder="e.g., tech, tutorial, research" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e1e5e9;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                        transition: border-color 0.2s;
                    " onfocus="this.style.borderColor='#007bff'" onblur="this.style.borderColor='#e1e5e9'">
                    <small style="color: #666; font-size: 12px;">Separate multiple tags with commas</small>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" id="dr-cancel-btn" style="
                        padding: 12px 24px;
                        border: 2px solid #6c757d;
                        background: white;
                        color: #6c757d;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        transition: all 0.2s;
                    " onmouseover="this.style.backgroundColor='#6c757d'; this.style.color='white'" onmouseout="this.style.backgroundColor='white'; this.style.color='#6c757d'">Cancel</button>
                    
                    <button type="submit" id="dr-save-btn" style="
                        padding: 12px 24px;
                        border: 2px solid #007bff;
                        background: #007bff;
                        color: white;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        transition: all 0.2s;
                    " onmouseover="this.style.backgroundColor='#0056b3'; this.style.borderColor='#0056b3'" onmouseout="this.style.backgroundColor='#007bff'; this.style.borderColor='#007bff'">💾 Save Reading</button>
                </div>
            </form>
            
            <div id="dr-success" style="display: none; text-align: center; margin-top: 20px;">
                <div style="color: #28a745; font-size: 18px; margin-bottom: 10px;">✅ Saved successfully!</div>
                <p style="color: #666; margin-bottom: 15px;">Your reading item has been saved to localStorage.</p>
                <a href="${BLOG_CONFIG.url}${BLOG_CONFIG.baseurl}${BLOG_CONFIG.dailyReadingPath}" target="_blank" style="
                    display: inline-block;
                    padding: 10px 20px;
                    background: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    transition: background-color 0.2s;
                " onmouseover="this.style.backgroundColor='#0056b3'" onmouseout="this.style.backgroundColor='#007bff'">📚 View Daily Reading Page</a>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Add event listeners
        setupEventListeners();
        
        // Focus on title input
        document.getElementById('dr-title').focus();
        document.getElementById('dr-title').select();
    }
    
    function setupEventListeners() {
        // Close button
        document.getElementById('dr-close-btn').addEventListener('click', closeModal);
        document.getElementById('dr-cancel-btn').addEventListener('click', closeModal);
        
        // Close on overlay click
        document.getElementById('daily-reading-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // Form submission
        document.getElementById('dr-save-form').addEventListener('submit', function(e) {
            e.preventDefault();
            saveReading();
        });
        
        // Smart tag suggestions based on domain
        suggestTags();
    }
    
    function suggestTags() {
        const tagSuggestions = getTagSuggestions(pageInfo.domain);
        if (tagSuggestions.length > 0) {
            document.getElementById('dr-tags').value = tagSuggestions.join(', ');
        }
    }
    
    function getTagSuggestions(domain) {
        const tagMap = {
            'github.com': ['code', 'development', 'open-source'],
            'stackoverflow.com': ['programming', 'qa', 'development'],
            'medium.com': ['article', 'blog'],
            'dev.to': ['development', 'programming', 'blog'],
            'hackernews.com': ['tech', 'news'],
            'reddit.com': ['discussion', 'community'],
            'youtube.com': ['video', 'tutorial'],
            'aws.amazon.com': ['aws', 'cloud', 'documentation'],
            'docs.microsoft.com': ['microsoft', 'documentation'],
            'developer.mozilla.org': ['web', 'documentation', 'reference']
        };
        
        for (const [key, tags] of Object.entries(tagMap)) {
            if (domain.includes(key)) {
                return tags;
            }
        }
        
        // Generic suggestions based on URL patterns
        if (domain.includes('docs') || pageInfo.url.includes('/docs/')) {
            return ['documentation'];
        }
        if (domain.includes('blog') || pageInfo.url.includes('/blog/')) {
            return ['blog'];
        }
        if (pageInfo.url.includes('tutorial')) {
            return ['tutorial'];
        }
        
        return [];
    }
    
    function saveReading() {
        const title = document.getElementById('dr-title').value.trim();
        const url = document.getElementById('dr-url').value.trim();
        const summary = document.getElementById('dr-summary').value.trim();
        const highlightsText = document.getElementById('dr-highlights').value.trim();
        const notes = document.getElementById('dr-notes').value.trim();
        const tags = document.getElementById('dr-tags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        
        if (!title || !url) {
            alert('Please fill in both title and URL');
            return;
        }
        
        // Process highlights - split by lines and clean up
        const highlights = highlightsText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        const reading = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title,
            url,
            summary,
            highlights,
            notes,
            tags,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            }),
            dateAdded: new Date().toLocaleDateString(),
            domain: pageInfo.domain,
            favicon: pageInfo.favicon
        };
        
        // Save to localStorage
        const existingReadings = JSON.parse(localStorage.getItem('dailyReadings') || '[]');
        existingReadings.unshift(reading);
        localStorage.setItem('dailyReadings', JSON.stringify(existingReadings));
        
        // Show success message
        document.getElementById('dr-save-form').style.display = 'none';
        document.getElementById('dr-success').style.display = 'block';
        
        // Auto close after 3 seconds
        setTimeout(() => {
            closeModal();
        }, 3000);
    }
    
    function closeModal() {
        const modal = document.getElementById('daily-reading-modal');
        if (modal) {
            modal.remove();
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', arguments.callee);
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
})(); 