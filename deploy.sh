#!/bin/bash

# Deploy script for GitHub Pages

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
USERNAME="JKevinXu"  # Updated to correct GitHub username
REPO="github-blog"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -u|--username)
      USERNAME="$2"
      shift 2
      ;;
    -r|--repo)
      REPO="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

echo -e "${GREEN}=== GitHub Pages Deployment Script ===${NC}"
echo -e "Username: $USERNAME"
echo -e "Repository: $REPO"

# 1. Check if remote is set up
if ! git remote -v | grep -q origin; then
  echo -e "${YELLOW}Remote 'origin' not found. Setting up GitHub remote:${NC}"
  echo "  git remote add origin https://github.com/$USERNAME/$REPO.git"
  git remote add origin "https://github.com/$USERNAME/$REPO.git"
  git branch -M main
fi

# 2. Add all changes
echo -e "${GREEN}Adding all changes...${NC}"
git add .

# 3. Commit changes
echo -e "${GREEN}Committing changes...${NC}"
read -p "Enter commit message: " commit_message
git commit -m "$commit_message"

# 4. Push to GitHub
echo -e "${GREEN}Pushing to GitHub...${NC}"
git push -u origin main

echo -e "${GREEN}Done! Your changes have been pushed to GitHub.${NC}"
echo -e "${YELLOW}Note: It may take a few minutes for GitHub Pages to build and deploy your site.${NC}"

# Determine the URL based on repo name
if [[ "$REPO" == "$USERNAME.github.io" ]]; then
  echo -e "Visit your site at: https://$USERNAME.github.io/"
else
  echo -e "Visit your site at: https://$USERNAME.github.io/$REPO/"
fi