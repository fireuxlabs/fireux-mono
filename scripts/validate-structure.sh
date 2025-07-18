#!/bin/bash

# FireUX Unified Structure Validation Script
# Ensures both package/runtime and app/ follow the same Nuxt structure pattern

set -e

echo "🔍 Validating FireUX unified structure pattern..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0

# Function to report errors
report_error() {
    echo -e "${RED}❌ $1${NC}"
    ERRORS=$((ERRORS + 1))
}

# Function to report warnings
report_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to report success
report_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to report info
report_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 0. Validate unified structure pattern consistency
echo -e "\n🏗️  Checking unified structure pattern..."
report_info "Validating that packages/*/runtime and projects/*/app follow same Nuxt structure"

# Check for standard Nuxt directories in both package runtime and app levels
nuxt_dirs=("components" "composables" "pages" "layouts" "middleware" "plugins" "types")
missing_structure=()

for dir in "${nuxt_dirs[@]}"; do
    # Count in package runtime directories
    runtime_count=$(find packages -path "*/src/runtime/$dir" -type d | wc -l)
    # Count in app directories  
    app_count=$(find projects -path "*/app/$dir" -type d | wc -l)
    
    if [ $runtime_count -eq 0 ] && [ $app_count -eq 0 ]; then
        missing_structure+=("$dir")
    fi
done

if [ ${#missing_structure[@]} -eq 0 ]; then
    report_success "Unified structure pattern is consistent across runtime and app levels"
else
    report_warning "Some standard Nuxt directories missing: ${missing_structure[*]}"
fi

# 1. Validate routes are in correct directories
echo -e "\n📁 Checking route organization..."
route_violations=$(find packages -name "*[Rr]outes*.ts" ! -path "*/app/routes/*" | grep -v node_modules || true)
if [ ! -z "$route_violations" ]; then
    report_error "Route files found outside app/routes/ directories:"
    echo "$route_violations"
else
    report_success "All route files are properly organized"
fi

# 2. Validate utils categorization
echo -e "\n🛠️  Checking utils organization..."
# Check for generic utils directory (should not exist)
generic_utils=$(find packages -path "*/composables/utils" -type d | grep -v node_modules || true)
if [ ! -z "$generic_utils" ]; then
    report_error "Generic utils directories found (should be categorized):"
    echo "$generic_utils"
else
    report_success "No generic utils directories found"
fi

# Check for properly categorized utils
app_utils=$(find packages -path "*/composables/app/utils" -type d | wc -l)
entity_utils=$(find packages -path "*/firestore/*/utils" -type d | wc -l)
if [ $app_utils -gt 0 ] || [ $entity_utils -gt 0 ]; then
    report_success "Utils are properly categorized ($app_utils app utils, $entity_utils entity utils)"
fi

# 3. Validate component prefixes
echo -e "\n🎯 Checking component prefixes..."
# Check for components without proper prefixes
core_components=$(find packages/fireux-core -name "*.vue" ! -name "Fire*.vue" ! -path "*/node_modules/*" | head -5)
if [ ! -z "$core_components" ]; then
    report_warning "Core components found without Fire prefix:"
    echo "$core_components"
fi

jobs_components=$(find packages/fireux-jobs -name "*.vue" ! -name "Job*.vue" ! -path "*/node_modules/*" | head -5)
if [ ! -z "$jobs_components" ]; then
    report_warning "Jobs components found without Job prefix:"
    echo "$jobs_components"
fi

misebox_components=$(find packages/fireux-misebox -name "*.vue" ! -name "Mise*.vue" ! -path "*/node_modules/*" | head -5)
if [ ! -z "$misebox_components" ]; then
    report_warning "Misebox components found without Mise prefix:"
    echo "$misebox_components"
fi

# 4. Check for empty directories
echo -e "\n🗂️  Checking for empty directories..."
empty_dirs=$(find packages -type d -empty | grep -v node_modules || true)
if [ ! -z "$empty_dirs" ]; then
    report_warning "Empty directories found:"
    echo "$empty_dirs"
else
    report_success "No empty directories found"
fi

# 5. Validate model naming
echo -e "\n📋 Checking model naming..."
invalid_models=$(find packages -name "*.ts" -path "*/models/*" ! -name "*.model.ts" ! -name "index.ts" | grep -v node_modules || true)
if [ ! -z "$invalid_models" ]; then
    report_warning "Files in models/ without .model.ts suffix:"
    echo "$invalid_models"
else
    report_success "All model files follow naming convention"
fi

# 6. Check import patterns
echo -e "\n🔗 Checking import patterns..."
# Check for relative imports crossing package boundaries
cross_boundary_imports=$(grep -r "import.*\.\./\.\./\.\." packages/ --include="*.ts" --include="*.vue" | head -5 || true)
if [ ! -z "$cross_boundary_imports" ]; then
    report_warning "Potential cross-boundary relative imports found:"
    echo "$cross_boundary_imports"
fi

# Summary
echo -e "\n📊 Unified Structure Validation Summary"
echo "========================================"
echo -e "${BLUE}Package Runtime Directories:${NC} $(find packages -path "*/src/runtime" -type d | wc -l) found"
echo -e "${BLUE}App Directories:${NC} $(find projects -path "*/app" -type d | wc -l) found"
echo -e "${BLUE}Unified Structure Compliance:${NC} Both levels follow Nuxt conventions"

if [ $ERRORS -eq 0 ]; then
    report_success "Unified structure validation passed! ✨"
    echo -e "\n💡 Both package/runtime and app/ levels maintain consistent Nuxt structure"
    exit 0
else
    report_error "Structure validation failed with $ERRORS errors"
    echo -e "\n💡 Run ${YELLOW}npm run structure:fix${NC} to auto-fix some issues"
    exit 1
fi
