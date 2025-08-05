#!/bin/bash

# Script to clean up phantom files that appear after VS Code crashes
# Run this if you see old backup files reappearing

echo "🧹 Cleaning up phantom files..."

# Remove backup files with various patterns
find . -name "*-new.*" -not -path "*/node_modules/*" -not -path "*/.nuxt/*" -delete 2>/dev/null
find . -name "*-backup.*" -not -path "*/node_modules/*" -not -path "*/.nuxt/*" -delete 2>/dev/null
find . -name "*New.*" -not -path "*/node_modules/*" -not -path "*/.nuxt/*" -delete 2>/dev/null
find . -name "*Backup.*" -not -path "*/node_modules/*" -not -path "*/.nuxt/*" -delete 2>/dev/null
find . -name "*.tmp" -not -path "*/node_modules/*" -not -path "*/.nuxt/*" -delete 2>/dev/null
find . -name "*.temp" -not -path "*/node_modules/*" -not -path "*/.nuxt/*" -delete 2>/dev/null

# Remove empty files in packages directory
find packages -type f \( -name "*.vue" -o -name "*.ts" -o -name "*.scss" -o -name "*.js" \) -empty -delete 2>/dev/null

echo "✅ Phantom file cleanup complete!"
echo "💡 If VS Code still shows phantom files, try:"
echo "   1. Close VS Code completely"
echo "   2. Run: rm -rf .vscode/workspace*"
echo "   3. Restart VS Code"
