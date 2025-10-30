#!/bin/bash

# Cleanup script for avatar-ui-next repository
# This script removes build artifacts, cache files, and temporary files

echo "🧹 Cleaning avatar-ui-next repository..."

# Remove Next.js build directory
echo "Removing .next build directory..."
rm -rf .next

# Remove node_modules (can be reinstalled with npm install)
echo "Removing node_modules..."
rm -rf node_modules

# Remove log files
echo "Removing log files..."
find . -name "*.log" -type f -delete

# Remove macOS system files
echo "Removing .DS_Store files..."
find . -name ".DS_Store" -type f -delete

# Remove temporary files
echo "Removing temporary files..."
find . -name "*.tmp" -type f -delete
find . -name "*.swp" -type f -delete

# Remove TypeScript build info
echo "Removing TypeScript build info..."
find . -name "*.tsbuildinfo" -type f -delete

echo "✅ Cleanup complete!"
echo ""
echo "To reinstall dependencies, run: npm install"
echo "To start development server, run: npm run dev"
