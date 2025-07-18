#!/bin/bash

# FireUX Structure Auto-Fix Script
# Automatically fixes common structural issues

set -e

echo "🔧 Auto-fixing FireUX folder structure issues..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FIXES_APPLIED=0

# Function to report fixes
report_fix() {
    echo -e "${GREEN}✅ Fixed: $1${NC}"
    FIXES_APPLIED=$((FIXES_APPLIED + 1))
}

# Function to report actions
report_action() {
    echo -e "${YELLOW}🔄 $1${NC}"
}

# 1. Remove empty directories
echo -e "\n🗂️  Removing empty directories..."
empty_dirs=$(find packages -type d -empty | grep -v node_modules || true)
if [ ! -z "$empty_dirs" ]; then
    echo "$empty_dirs" | while read dir; do
        if [ -d "$dir" ]; then
            rmdir "$dir" 2>/dev/null || true
            report_fix "Removed empty directory: $dir"
        fi
    done
else
    echo "No empty directories to remove"
fi

# 2. Move misplaced route files
echo -e "\n📁 Checking for misplaced route files..."
route_violations=$(find packages -name "*[Rr]outes*.ts" ! -path "*/app/routes/*" ! -path "*/node_modules/*" || true)
if [ ! -z "$route_violations" ]; then
    echo "$route_violations" | while read file; do
        # Extract package path and create target directory
        package_path=$(echo "$file" | sed 's|/src/.*||')
        target_dir="$package_path/src/runtime/composables/app/routes"
        filename=$(basename "$file")
        
        report_action "Moving $filename to correct location"
        mkdir -p "$target_dir"
        mv "$file" "$target_dir/$filename"
        report_fix "Moved $file to $target_dir/"
    done
else
    echo "No misplaced route files found"
fi

# 3. Create missing app/utils directories for any utils in generic utils/
echo -e "\n🛠️  Checking for generic utils directories..."
generic_utils_dirs=$(find packages -path "*/composables/utils" -type d | grep -v node_modules || true)
if [ ! -z "$generic_utils_dirs" ]; then
    echo "$generic_utils_dirs" | while read utils_dir; do
        if [ -d "$utils_dir" ] && [ "$(ls -A "$utils_dir" 2>/dev/null)" ]; then
            # Create app/utils directory
            package_composables=$(dirname "$utils_dir")
            app_utils_dir="$package_composables/app/utils"
            
            report_action "Moving utils from $utils_dir to $app_utils_dir"
            mkdir -p "$app_utils_dir"
            
            # Move all files
            for file in "$utils_dir"/*; do
                if [ -f "$file" ]; then
                    mv "$file" "$app_utils_dir/"
                    report_fix "Moved $(basename "$file") to app/utils/"
                fi
            done
            
            # Remove empty directory
            rmdir "$utils_dir" 2>/dev/null || true
            report_fix "Removed generic utils directory"
        fi
    done
else
    echo "No generic utils directories found"
fi

# 4. Fix common import path issues (basic patterns)
echo -e "\n🔗 Checking for common import issues..."
# This is a basic check - full import fixing would need more sophisticated parsing
cross_boundary_count=$(grep -r "import.*\.\./\.\./\.\." packages/ --include="*.ts" --include="*.vue" | wc -l || true)
if [ $cross_boundary_count -gt 0 ]; then
    echo "Found $cross_boundary_count potential cross-boundary imports"
    echo "💡 These require manual review - check for workspace: imports instead"
fi

# 5. Standardize directory names
echo -e "\n📂 Standardizing directory names..."
# Look for common naming inconsistencies
inconsistent_dirs=$(find packages -type d -name "*Route*" ! -name "*routes*" | grep -v node_modules || true)
if [ ! -z "$inconsistent_dirs" ]; then
    echo "$inconsistent_dirs" | while read dir; do
        new_name=$(echo "$dir" | sed 's/Route/routes/g')
        if [ "$dir" != "$new_name" ]; then
            report_action "Renaming $dir to $new_name"
            mv "$dir" "$new_name"
            report_fix "Standardized directory name"
        fi
    done
fi

# Summary
echo -e "\n📊 Auto-Fix Summary"
echo "==================="
if [ $FIXES_APPLIED -eq 0 ]; then
    echo -e "${GREEN}✨ No fixes needed - structure is clean!${NC}"
else
    echo -e "${GREEN}✅ Applied $FIXES_APPLIED fixes successfully${NC}"
    echo -e "\n💡 Run ${YELLOW}./scripts/validate-structure.sh${NC} to verify all issues are resolved"
fi

echo -e "\n🔄 Don't forget to:"
echo "  • Update import paths if files were moved"
echo "  • Test the application after structural changes"
echo "  • Commit the structural improvements"
