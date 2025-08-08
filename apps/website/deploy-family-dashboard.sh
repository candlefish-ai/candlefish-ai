#!/bin/bash

# Family Dashboard Deployment Verification Script
# Purpose: Ensure authentication fix is properly deployed
# Date: August 7, 2025

set -e

echo "========================================="
echo "Family Dashboard Deployment Verification"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check status
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2"
        return 1
    fi
}

# 1. Check redirect files for correct status code
echo "1. Checking redirect files..."
echo "----------------------------"

PUBLIC_REDIRECT="/Users/patricksmith/candlefish-ai/apps/website/public/_redirects"
DIST_REDIRECT="/Users/patricksmith/candlefish-ai/apps/website/dist/_redirects"

# Check public/_redirects
if [ -f "$PUBLIC_REDIRECT" ]; then
    if grep -q "/docs/privileged/family/\*.*200$" "$PUBLIC_REDIRECT"; then
        check_status 0 "public/_redirects has correct status (200)"
    else
        if grep -q "/docs/privileged/family/\*.*401" "$PUBLIC_REDIRECT"; then
            check_status 1 "public/_redirects still has 401 status - FIX NEEDED!"
        else
            echo -e "${YELLOW}!${NC} public/_redirects has custom configuration"
        fi
    fi
else
    check_status 1 "public/_redirects not found"
fi

# Check dist/_redirects if it exists
if [ -f "$DIST_REDIRECT" ]; then
    if grep -q "/docs/privileged/family/\*.*200$" "$DIST_REDIRECT"; then
        check_status 0 "dist/_redirects has correct status (200)"
    else
        if grep -q "/docs/privileged/family/\*.*401" "$DIST_REDIRECT"; then
            check_status 1 "dist/_redirects still has 401 status - REBUILD NEEDED!"
        fi
    fi
else
    echo -e "${YELLOW}!${NC} dist/_redirects not found (will be created on build)"
fi

echo ""

# 2. Check family dashboard files
echo "2. Checking family dashboard files..."
echo "-------------------------------------"

FAMILY_DIR="/Users/patricksmith/candlefish-ai/apps/website/public/docs/privileged/family"
EXPECTED_FILES=(
    "family-dashboard.html"
    "candlefish_update_08072025_family.html"
    "candlefish_update_08072025_legal.html"
    "family_plan_letter_aug7_2025.html"
    "candlefish_update_08032025_family.html"
    "candlefish_update_08032025_legal.html"
    "kids_faq.html"
    "index.html"
)

FILE_COUNT=0
for file in "${EXPECTED_FILES[@]}"; do
    if [ -f "$FAMILY_DIR/$file" ]; then
        ((FILE_COUNT++))
    else
        echo -e "${RED}✗${NC} Missing: $file"
    fi
done

check_status $([[ $FILE_COUNT -eq ${#EXPECTED_FILES[@]} ]] && echo 0 || echo 1) \
    "Found $FILE_COUNT of ${#EXPECTED_FILES[@]} expected files"

echo ""

# 3. Check git status
echo "3. Checking git status..."
echo "-------------------------"

CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" == "main" ]; then
    check_status 0 "On main branch"
else
    echo -e "${YELLOW}!${NC} Not on main branch (current: $CURRENT_BRANCH)"
fi

# Check if authentication fix is committed
if git log --oneline | grep -q "Fix family dashboard authentication"; then
    check_status 0 "Authentication fix is committed"
    COMMIT_HASH=$(git log --oneline --grep="Fix family dashboard authentication" -1 | cut -d' ' -f1)
    echo "  Commit: $COMMIT_HASH"
else
    check_status 1 "Authentication fix not found in git history"
fi

echo ""

# 4. Build the project (optional)
echo "4. Build status..."
echo "------------------"

if command -v npm &> /dev/null; then
    echo "Would you like to build the project? (y/n)"
    read -r BUILD_CHOICE
    if [ "$BUILD_CHOICE" == "y" ]; then
        echo "Building project..."
        npm run build
        check_status $? "Build completed"

        # Re-check dist/_redirects after build
        if [ -f "$DIST_REDIRECT" ]; then
            if grep -q "/docs/privileged/family/\*.*200$" "$DIST_REDIRECT"; then
                check_status 0 "dist/_redirects updated correctly after build"
            else
                check_status 1 "dist/_redirects not updated correctly - manual fix needed"
            fi
        fi
    else
        echo "Skipping build"
    fi
else
    echo -e "${YELLOW}!${NC} npm not available - cannot build"
fi

echo ""

# 5. Netlify deployment
echo "5. Netlify deployment..."
echo "------------------------"

if command -v netlify &> /dev/null; then
    echo "Netlify CLI is available"

    # Check deployment status
    echo "Checking current deployment status..."
    netlify status

    echo ""
    echo "Would you like to deploy to Netlify? (y/n)"
    read -r DEPLOY_CHOICE
    if [ "$DEPLOY_CHOICE" == "y" ]; then
        echo "Deploying to Netlify..."
        netlify deploy --prod
        check_status $? "Deployment triggered"

        echo ""
        echo "Deployment URLs:"
        echo "  Main: https://candlefish.ai/docs/privileged/family/"
        echo "  Dashboard: https://candlefish.ai/docs/privileged/family/family-dashboard.html"
        echo "  Note: Authentication code is managed via Netlify environment (not printed)"
    else
        echo "Skipping deployment"
    fi
else
    echo -e "${YELLOW}!${NC} Netlify CLI not available"
    echo "To deploy manually:"
    echo "  1. Push to main branch: git push origin main"
    echo "  2. Check deployment at: https://app.netlify.com/projects/steady-cuchufli-1890bc"
fi

echo ""
echo "========================================="
echo "Verification Complete"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Test authentication at: https://candlefish.ai/docs/privileged/family/"
echo "2. Authenticate using the configured Netlify-provisioned code"
echo "3. Verify all 8 documents are accessible"
echo "4. Check browser console for any errors"
echo ""
echo "If issues persist, check:"
echo "- FAMILY_DASHBOARD_AUTH_FIX.md for troubleshooting"
echo "- Netlify deploy logs for errors"
echo "- Browser network tab for 401 responses"
