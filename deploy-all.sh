#!/bin/bash

# Deploy All Apps Script
# This script builds and deploys all three apps automatically

set -e  # Exit on any error

echo "🚀 Starting automated deployment of all apps..."
echo "=================================================="

# Function to deploy an app
deploy_app() {
    local app_name=$1
    local app_path=$2
    
    echo ""
    echo "📦 Building and deploying $app_name..."
    echo "----------------------------------------"
    
    cd "$app_path"
    
    echo "Building $app_name..."
    pnpm build
    
    echo "Deploying $app_name to Firebase..."
    pnpm exec firebase deploy
    
    echo "✅ $app_name deployed successfully!"
}

# Get the base directory
BASE_DIR="/Users/danielwatson/Dev/fireux"

# Deploy CleanBox
deploy_app "CleanBox" "$BASE_DIR/projects/cleanbox/cleanbox-app"

# Deploy MiseBox  
deploy_app "MiseBox" "$BASE_DIR/projects/misebox/misebox-app"

# Deploy FireUX
deploy_app "FireUX" "$BASE_DIR/projects/fireux/fireux-app"

echo ""
echo "🎉 All apps deployed successfully!"
echo "=================================="
echo "CleanBox: https://cleanbox.web.app"
echo "MiseBox: https://misebox.web.app" 
echo "FireUX: https://fireux.web.app"
echo ""
echo "Deployment complete! ✨"
