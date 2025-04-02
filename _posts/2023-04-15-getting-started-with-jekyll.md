---
layout: post
title: "Getting Started with Jekyll for GitHub Pages"
date: 2023-04-15 10:00:00 -0500
categories: [tutorial]
tags: [jekyll, github-pages, static-site]
---

# Getting Started with Jekyll for GitHub Pages

Jekyll is a fantastic static site generator that works seamlessly with GitHub Pages. In this post, I'll share how I set up this blog and how you can create your own.

## What is Jekyll?

Jekyll is a simple, blog-aware static site generator. It takes your content, renders Markdown and Liquid templates, and generates a complete, static website ready to be served by GitHub Pages or any other web server.

## Why Use Jekyll with GitHub Pages?

- **Free hosting**: GitHub Pages provides free hosting for static websites
- **Version control**: Your entire site is in a Git repository
- **Markdown support**: Write content in easy-to-use Markdown
- **Built-in themes**: Choose from various themes or create your own
- **Plugins**: Extend functionality with Jekyll plugins

## Setting Up Your Own Jekyll Blog

### 1. Create a GitHub Repository

First, create a repository named `yourusername.github.io` (replace "yourusername" with your actual GitHub username).

### 2. Set Up Jekyll Locally (Optional but Recommended)

Install Ruby and Jekyll:

```bash
# Install Ruby (if not already installed)
# For macOS:
brew install ruby

# Install Jekyll and Bundler
gem install jekyll bundler

# Create a new Jekyll site
jekyll new myblog

# Navigate to your new site
cd myblog

# Build and serve your site locally
bundle exec jekyll serve
```

### 3. Configure Your Site

Edit the `_config.yml` file to customize your site:

```yaml
title: Your Site Title
description: Your site description
author: Your Name
baseurl: ""  # Leave empty for yourusername.github.io
url: "https://yourusername.github.io"
```

### 4. Create Content

Posts go in the `_posts` directory with filenames in the format `YYYY-MM-DD-title.md`.

### 5. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

## Conclusion

Jekyll paired with GitHub Pages is a powerful combination for bloggers, especially those in the tech space. It's free, flexible, and gives you complete control over your content.

Stay tuned for more Jekyll tips and tricks in future posts! 