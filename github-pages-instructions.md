# Enabling GitHub Pages

Your blog has been successfully pushed to GitHub at https://github.com/JKevinXu/github-blog!

## Next Steps to Make Your Blog Live

1. Go to your repository settings page:
   - https://github.com/JKevinXu/github-blog/settings/pages

2. Under "Build and deployment" > "Source":
   - Select "Deploy from a branch"

3. Under "Branch":
   - Select "main" from the dropdown menu
   - Select "/ (root)" folder
   - Click "Save"

4. Wait for deployment:
   - GitHub will start building your site (usually takes a few minutes)
   - You'll see a message at the top when it's ready
   - You can check the "Actions" tab to monitor the build process

5. Visit your blog:
   - Your blog will be available at https://jkevinxu.github.io/github-blog/

## Making Updates

To update your blog in the future, make changes locally, commit them, and push:

```bash
# After making changes
git add .
git commit -m "Your update message"
git push
```

Or use the deploy script:

```bash
./deploy.sh -u JKevinXu -r github-blog
```

GitHub Pages will automatically rebuild your site with the new changes. 