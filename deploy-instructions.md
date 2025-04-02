# GitHub Pages Deployment Instructions

Follow these steps to deploy your Jekyll blog to GitHub Pages:

## 1. Create a GitHub Repository

1. Go to https://github.com/new
2. Create a repository named `github-blog` (or `kevinxu.github.io` for a user site)
3. DO NOT initialize with README, .gitignore, or license
4. Click "Create repository"

## 2. Connect Your Local Repository

Run these commands in your terminal (replace `YOURUSERNAME` with your GitHub username):

```bash
# For a project site (yourusername.github.io/github-blog)
git remote add origin https://github.com/YOURUSERNAME/github-blog.git

# OR for a user site (yourusername.github.io)
# git remote add origin https://github.com/YOURUSERNAME/YOURUSERNAME.github.io.git

git branch -M main
git push -u origin main
```

## 3. Configure GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings"
3. Navigate to "Pages" in the left sidebar
4. Under "Source", select "Deploy from a branch"
5. Under "Branch", select "main" and "/ (root)" folder
6. Click "Save"

## 4. Update _config.yml (if needed)

If you created a project site (github-blog), ensure your `_config.yml` has:
- `baseurl: "/github-blog"` (match your repository name)
- `url: "https://YOURUSERNAME.github.io"` (replace with your username)

If you created a user site (username.github.io), set:
- `baseurl: ""` (empty)
- `url: "https://YOURUSERNAME.github.io"`

After making changes, commit and push:
```bash
git add _config.yml
git commit -m "Update site configuration"
git push
```

## 5. Wait for Deployment

- GitHub Pages typically deploys within a few minutes
- Check the "Actions" tab to see the deployment progress
- Once complete, your site will be available at:
  - Project site: `https://YOURUSERNAME.github.io/github-blog/`
  - User site: `https://YOURUSERNAME.github.io/` 