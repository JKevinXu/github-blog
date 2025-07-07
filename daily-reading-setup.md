---
layout: page
title: "Daily Reading Setup Guide"
permalink: /daily-reading-setup/
---

# Daily Reading System Setup Guide

This guide will help you set up the Daily Reading system to mark and save websites you read without requiring blog deployment.

## 🚀 Quick Start

### Method 1: Simple Bookmarklet (Recommended)

1. **Go to your [Daily Reading page](/daily-reading/)**
2. **Drag the "📚 Save Reading" bookmarklet** from the bottom of the page to your browser's bookmarks bar
3. **Done!** Now you can click this bookmark on any webpage to save it to your reading list

### Method 2: Enhanced Bookmarklet (Advanced)

For a better user experience with a modal interface:

1. **Create a new bookmark** in your browser
2. **Set the name** to: `📚 Save to Daily Reading`
3. **Set the URL** to the following JavaScript code:

```javascript
javascript:(function(){var script=document.createElement('script');script.src='{{ site.url }}{{ site.baseurl }}/assets/js/daily-reading-bookmarklet.js?'+Date.now();document.head.appendChild(script);})();
```

## 📖 How to Use

### Saving Reading Items

1. **Navigate to any webpage** you want to save
2. **Click the bookmarklet** in your bookmarks bar
3. **Fill in the form** (title and URL auto-populated)
4. **Add notes** and tags as needed
5. **Click "Save Reading"**

### Managing Your Reading List

1. **Visit your [Daily Reading page](/daily-reading/)**
2. **View all saved items** with search and filter options
3. **Export your data** as JSON for backup
4. **Delete items** you no longer need

## 🔧 Features

### Automatic Data Capture
- Page title
- URL
- Selected text (if any)
- Meta description
- Favicon
- Smart tag suggestions based on domain

### Organization Tools
- **Search**: Find readings by title, URL, or notes
- **Filter by tag**: Show only specific categories
- **Filter by date**: View readings from specific dates
- **Export**: Download all data as JSON

### Smart Tag Suggestions
The system automatically suggests tags based on the website domain:
- `github.com` → code, development, open-source
- `stackoverflow.com` → programming, qa, development
- `medium.com` → article, blog
- `aws.amazon.com` → aws, cloud, documentation
- And many more...

## 💾 Data Storage Options

### Option 1: Local Storage (Default)
- All data stored in your browser's localStorage
- Works offline
- No server required
- Data persists until you clear browser data
- **Limitation**: Only available on the device where you saved items

### Option 2: GitHub Sync (Recommended)
- **Cross-device synchronization**: Access readings from any device
- **Permanent storage**: Never lost, backed up to GitHub
- **Version history**: Full revision history of your readings
- **Sharing**: Share your reading list with others
- **Automatic sync**: Changes saved instantly to your repository

#### Setting Up GitHub Sync
1. **Click "⚙️ GitHub Sync Setup"** on your Daily Reading page
2. **Create GitHub Personal Access Token**:
   - Go to [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Name: "Daily Reading Blog"
   - Scopes: Check **"repo"** (Full control of private repositories)
   - Generate and copy the token
3. **Enter the token** in the setup modal
4. **Done!** Your readings will now sync to `_data/readings.json` in your repository

### Backup & Export
- **Export All**: Download JSON file with all readings
- **Import**: Paste JSON data to restore readings
- **GitHub Backup**: Automatically backed up when using GitHub sync

## 🔧 Alternative Server Storage Options

While GitHub sync is the recommended approach for Jekyll/GitHub Pages, here are other server storage options:

### Option 3: Firebase/Firestore
- **Real-time synchronization**
- **Offline support**
- **Free tier available**
- Requires Firebase project setup and API keys

### Option 4: Supabase
- **Open-source alternative to Firebase**
- **PostgreSQL database**
- **Real-time subscriptions**
- Simple API setup

### Option 5: Airtable
- **Spreadsheet-like interface**
- **Easy data management**
- **API access**
- Can view/edit readings directly in Airtable

### Option 6: GitHub Gists
- **Simpler than full repo integration**
- **Public or private gists**
- **Version history**
- Single file storage approach

### Option 7: Static File Generation
- **Generate Jekyll data files**
- **Automatic site rebuilds**
- **Integrated with blog content**
- Readings become part of your static site

## 🔧 Advanced Options

### Browser Extension (Coming Soon)
For power users, a browser extension can provide:
- Right-click context menu
- Keyboard shortcuts
- Better cross-tab synchronization
- Automatic backup options

## 🛠️ Customization

### Modify Tag Suggestions
Edit the `daily-reading-bookmarklet.js` file to add your own domain-to-tag mappings:

```javascript
const tagMap = {
    'your-domain.com': ['custom', 'tags'],
    // Add more mappings
};
```

### Styling
The Daily Reading page uses inline CSS that you can customize by editing the `daily-reading.md` file.

## 📱 Mobile Usage

### iOS Safari
1. Save bookmarklet to Favorites
2. When reading an article, tap the share button
3. Tap "Add Bookmark" → "Favorites"
4. Edit the bookmark and replace URL with bookmarklet code

### Android Chrome
1. Create bookmark with bookmarklet code
2. Access via bookmarks menu when reading articles

## 🔍 Troubleshooting

### Bookmarklet Not Working
1. Check that JavaScript is enabled
2. Some sites block external scripts - try the simple bookmarklet instead
3. Make sure you copied the complete JavaScript code

### Data Not Appearing
1. Check browser's localStorage (Developer Tools → Application → Local Storage)
2. Ensure you're on the correct domain
3. Try refreshing the Daily Reading page

### Performance Issues
1. Export and clear old readings if you have many items
2. Use date filters to show fewer items at once

## 🔐 Privacy & Security

- All data stored locally in your browser
- No data sent to external servers
- Bookmarklet only accesses current page information
- You control all your reading data

## 🆘 Support

If you encounter issues:
1. Check browser console for errors
2. Try different browsers
3. Clear browser cache and try again
4. Export your data before troubleshooting

---

*This system allows you to collect and organize your daily reading without any server requirements or complex setup. Everything runs in your browser and your data stays with you.* 