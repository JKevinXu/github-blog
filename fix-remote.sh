#!/bin/bash

# Script to fix Git remote configuration for GitHub Pages

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Fix GitHub Remote Configuration ===${NC}"

# Check if remote origin exists
if git remote -v | grep -q origin; then
  echo -e "${YELLOW}Current remote configuration:${NC}"
  git remote -v
  
  # Remove existing remote
  echo -e "${YELLOW}Removing existing remote...${NC}"
  git remote remove origin
fi

# Ask for GitHub username
read -p "Enter your GitHub username: " USERNAME

# Ask for repository name
read -p "Enter repository name [github-blog]: " REPO
REPO=${REPO:-github-blog}

# Set up new remote
echo -e "${GREEN}Setting up remote with:${NC}"
echo -e "Username: ${YELLOW}$USERNAME${NC}"
echo -e "Repository: ${YELLOW}$REPO${NC}"
echo -e "URL: ${YELLOW}https://github.com/$USERNAME/$REPO.git${NC}"

git remote add origin "https://github.com/$USERNAME/$REPO.git"
git branch -M main

echo -e "${GREEN}Remote configuration updated!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Make sure you've created the repository at https://github.com/$USERNAME/$REPO"
echo -e "2. Push your changes with: ${GREEN}git push -u origin main${NC}"
echo -e "3. Or use the deploy script: ${GREEN}./deploy.sh -u $USERNAME -r $REPO${NC}" 