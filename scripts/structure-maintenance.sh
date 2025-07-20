#!/bin/bash

# 🏗️ FireUX Structure Maintenance Script
# Validates and fixes package structure issues
# Usage: ./scripts/structure-maintenance.sh [--fix]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

FIX_MODE=false
ERRORS=0
FIXES_APPLIED=0

# Parse arguments
if [[ "$1" == "--fix" ]]; then
    FIX_MODE=true
    echo -e "${BLUE}🔧 Structure Maintenance (Fix Mode)${NC}"
else
    echo -e "${BLUE}🔍 Structure Validation (Check Mode)${NC}"
fi

echo -e "${PURPLE}Ensuring FireUX nested package architecture is healthy${NC}"
echo

# Helper functions
report_error() {
    echo -e "${RED}❌ $1${NC}"
    ERRORS=$((ERRORS + 1))
}

report_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

report_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

report_fix() {
    echo -e "${GREEN}🔧 Fixed: $1${NC}"
    FIXES_APPLIED=$((FIXES_APPLIED + 1))
}

report_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 1. Validate nested package structure
echo -e "${YELLOW}1️⃣  Validating nested package architecture...${NC}"

required_packages=(
    "packages/core/fireux-core"
    "packages/extensions/fireux-jobs" 
    "packages/extensions/fireux-places"
    "packages/tenants/fireux-misebox"
    "packages/tenants/fireux-cleanbox"
)

for package in "${required_packages[@]}"; do
    if [ -d "$package" ]; then
        report_success "Found: $package"
    else
        report_error "Missing required package: $package"
    fi
done

# 2. Check for phantom flat packages (Copilot resurrection check)
echo -e "\n${YELLOW}2️⃣  Checking for phantom flat packages...${NC}"

flat_phantoms=(
    "packages/fireux-core"
    "packages/fireux-jobs"
    "packages/fireux-places" 
    "packages/fireux-misebox"
    "packages/fireux-cleanbox"
)

phantoms_found=false
for phantom in "${flat_phantoms[@]}"; do
    if [ -d "$phantom" ]; then
        report_warning "Phantom flat package detected: $phantom"
        phantoms_found=true
        
        if [ "$FIX_MODE" = true ]; then
            rm -rf "$phantom"
            report_fix "Removed phantom: $phantom"
        fi
    fi
done

if [ "$phantoms_found" = false ]; then
    report_success "No phantom flat packages found"
fi

# 3. Remove empty directories
echo -e "\n${YELLOW}3️⃣  Checking for empty directories...${NC}"

empty_dirs=$(find packages -type d -empty | grep -v node_modules || true)
if [ ! -z "$empty_dirs" ]; then
    echo "$empty_dirs" | while read dir; do
        if [ -d "$dir" ]; then
            report_warning "Empty directory: $dir"
            if [ "$FIX_MODE" = true ]; then
                rmdir "$dir" 2>/dev/null || true
                report_fix "Removed empty directory: $dir"
            fi
        fi
    done
else
    report_success "No empty directories found"
fi

# 4. Validate workspace dependencies
echo -e "\n${YELLOW}4️⃣  Checking workspace dependencies...${NC}"

check_workspace_deps() {
    local package_json="$1"
    if [ -f "$package_json" ]; then
        # Check for workspace:* pattern
        workspace_deps=$(grep -o '"fireux-[^"]*": "workspace:\*"' "$package_json" 2>/dev/null || true)
        if [ ! -z "$workspace_deps" ]; then
            report_success "Workspace deps OK: $(basename $(dirname $package_json))"
        fi
    fi
}

for package in "${required_packages[@]}"; do
    check_workspace_deps "$package/package.json"
done

# 5. Summary
echo -e "\n${PURPLE}📊 Structure Maintenance Summary${NC}"
echo "=========================================="
echo -e "Mode: $(if [ "$FIX_MODE" = true ]; then echo "${GREEN}Fix Mode${NC}"; else echo "${BLUE}Check Mode${NC}"; fi)"
echo -e "Errors found: ${RED}$ERRORS${NC}"
if [ "$FIX_MODE" = true ]; then
    echo -e "Fixes applied: ${GREEN}$FIXES_APPLIED${NC}"
fi

if [ $ERRORS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Package structure is healthy!${NC}"
else
    echo -e "\n${YELLOW}💡 Run with --fix flag to auto-repair issues${NC}"
fi

echo -e "\n${BLUE}💡 For phantom file issues, use: ./scripts/phantom-cleanup.sh${NC}"
