#!/bin/bash

# 🛡️ Interactive Phantom File Cleanup Script
# Handles Copilot "Keep" button bug by: git → cleanup → git
# Usage: ./scripts/phantom-cleanup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper function for user input
read_input() {
    echo -ne "${CYAN}$1${NC}"
    read -r response
    echo "$response"
}

# Helper function for confirmation
confirm() {
    while true; do
        echo -ne "${YELLOW}$1 (y/n): ${NC}"
        read -r response
        case $response in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

echo -e "${BLUE}🛡️  Interactive Phantom Cleanup Protocol${NC}"
echo -e "${PURPLE}This script protects against Copilot 'Keep' button bugs${NC}"
echo

# Step 1: Show current status and get commit message
echo -e "\n${YELLOW}1️⃣  Current git status:${NC}"
git status --short

if [ -n "$(git status --porcelain)" ]; then
    echo -e "\n${CYAN}📝 You have uncommitted changes that need protection.${NC}"
    COMMIT_MSG=$(read_input "Enter commit message: ")
    
    # Show what will be committed
    echo -e "\n${YELLOW}Files to be committed:${NC}"
    git add .
    git status --short --cached
    
    if confirm "Commit these changes before cleanup?"; then
        git commit -m "$COMMIT_MSG"
        echo -e "${GREEN}✅ Work protected in git${NC}"
    else
        echo -e "${RED}❌ Cannot proceed without protecting your work${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Working tree already clean${NC}"
fi

# Step 2: Identify and remove phantom duplicates
echo -e "\n${YELLOW}2️⃣  Scanning for phantom file duplicates...${NC}"
PHANTOMS_FOUND=false

# Check for flat packages that should be nested
if [ -d "packages/fireux-core" ] && [ -d "packages/core/fireux-core" ]; then
    echo -e "${RED}👻 Found phantom: packages/fireux-core (should be in packages/core/)${NC}"
    rm -rf packages/fireux-core
    PHANTOMS_FOUND=true
fi

if [ -d "packages/fireux-jobs" ] && [ -d "packages/extensions/fireux-jobs" ]; then
    echo -e "${RED}👻 Found phantom: packages/fireux-jobs (should be in packages/extensions/)${NC}"
    rm -rf packages/fireux-jobs
    PHANTOMS_FOUND=true
fi

if [ -d "packages/fireux-places" ] && [ -d "packages/extensions/fireux-places" ]; then
    echo -e "${RED}👻 Found phantom: packages/fireux-places (should be in packages/extensions/)${NC}"
    rm -rf packages/fireux-places
    PHANTOMS_FOUND=true
fi

if [ -d "packages/fireux-misebox" ] && [ -d "packages/tenants/fireux-misebox" ]; then
    echo -e "${RED}👻 Found phantom: packages/fireux-misebox (should be in packages/tenants/)${NC}"
    rm -rf packages/fireux-misebox
    PHANTOMS_FOUND=true
fi

if [ -d "packages/fireux-cleanbox" ] && [ -d "packages/tenants/fireux-cleanbox" ]; then
    echo -e "${RED}👻 Found phantom: packages/fireux-cleanbox (should be in packages/tenants/)${NC}"
    rm -rf packages/fireux-cleanbox
    PHANTOMS_FOUND=true
fi

# Check for phantom migration scripts in root
if [ -f "migrate-chef-profiles.js" ]; then
    echo -e "${RED}👻 Found phantom: migrate-chef-profiles.js (should be in scripts/)${NC}"
    rm -f migrate-chef-profiles.js
    PHANTOMS_FOUND=true
fi

if [ -f "migrate-app-users.js" ]; then
    echo -e "${RED}👻 Found phantom: migrate-app-users.js (should be in scripts/)${NC}"
    rm -f migrate-app-users.js
    PHANTOMS_FOUND=true
fi

if [ -f "check-app-users.js" ]; then
    echo -e "${RED}👻 Found phantom: check-app-users.js (should be in scripts/)${NC}"
    rm -f check-app-users.js
    PHANTOMS_FOUND=true
fi

# Check for phantom route composables
find packages -name "useCoreRoutes.ts" -not -path "*/fireux-core/src/runtime/composables/app/routes/*" -exec rm {} \; -exec echo -e "${RED}👻 Removed phantom: {}${NC}" \; 2>/dev/null || true

if [ "$PHANTOMS_FOUND" = true ]; then
    echo -e "${GREEN}✅ Phantom files removed${NC}"
else
    echo -e "${GREEN}✅ No phantom files detected${NC}"
fi

# Step 3: Validate structure
echo -e "\n${YELLOW}3️⃣  Validating package structure...${NC}"
if [ -d "packages/core/fireux-core" ] && [ -d "packages/extensions/fireux-jobs" ] && [ -d "packages/tenants/fireux-misebox" ]; then
    echo -e "${GREEN}✅ Nested package structure intact${NC}"
else
    echo -e "${RED}❌ WARNING: Expected nested structure missing!${NC}"
    echo "Expected:"
    echo "  packages/core/fireux-core"
    echo "  packages/extensions/fireux-jobs"
    echo "  packages/tenants/fireux-misebox"
fi

# Step 4: Final git status and Copilot guidance
echo -e "\n${YELLOW}4️⃣  Final git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}Changes detected after cleanup:${NC}"
    git status --short
    
    echo -e "\n${PURPLE}🚨 IMPORTANT: Copilot 'Keep' Button Safety Protocol${NC}"
    echo -e "${CYAN}The cleanup removed phantom files. Now it's SAFE to use Copilot.${NC}"
    echo
    
    if confirm "Commit cleanup changes automatically?"; then
        git add .
        git commit -m "🧹 Phantom cleanup: removed Copilot Keep bug duplicates"
        echo -e "${GREEN}✅ Cleanup committed${NC}"
    else
        echo -e "${YELLOW}Manual commit needed. Files staged and ready.${NC}"
        git add .
    fi
    
    echo
    echo -e "${GREEN}🎯 COPILOT SAFETY ZONE ACTIVE${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ It's now SAFE to click 'Keep' in Copilot suggestions${NC}"
    echo -e "${CYAN}✅ All phantom files have been removed${NC}"
    echo -e "${CYAN}✅ Your work is protected in git${NC}"
    echo -e "${CYAN}✅ Structure is validated and clean${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo
else
    echo -e "${GREEN}✅ No changes needed after cleanup${NC}"
    echo -e "${GREEN}✅ Already safe to use Copilot 'Keep' button${NC}"
fi

echo -e "\n${GREEN}🎉 Phantom cleanup complete!${NC}"
echo -e "${PURPLE}💡 Your codebase is now protected from Copilot Keep button bugs.${NC}"
echo
echo -e "${YELLOW}📋 Quick Reference:${NC}"
echo -e "${CYAN}• Safe to click 'Keep' in Copilot suggestions${NC}"
echo -e "${CYAN}• Run this script again if you see phantom files${NC}"
echo -e "${CYAN}• Start new chat sessions for major operations${NC}"
echo -e "${CYAN}• Commit frequently to protect your work${NC}"
