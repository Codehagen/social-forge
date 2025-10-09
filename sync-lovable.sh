#!/bin/bash

# Sync script for Open Lovable integration
# This script copies upstream folders into namespaced paths

set -e

echo "Syncing Open Lovable upstream into namespaced paths..."

# Create directories
mkdir -p app/\(builder\)/builder
mkdir -p components/lovable
mkdir -p lib/lovable
mkdir -p public/lovable
mkdir -p hooks/lovable
mkdir -p utils/lovable
mkdir -p styles/lovable

# Copy app folder (excluding favicon.ico and fonts which might conflict)
echo "Copying app folder..."
rsync -av --exclude='favicon.ico' --exclude='fonts/' external/open-lovable/app/ app/\(builder\)/builder/

# Copy components
echo "Copying components..."
rsync -av external/open-lovable/components/ components/lovable/

# Copy lib
echo "Copying lib..."
rsync -av external/open-lovable/lib/ lib/lovable/

# Copy public assets
echo "Copying public assets..."
rsync -av external/open-lovable/public/ public/lovable/

# Copy hooks
echo "Copying hooks..."
rsync -av external/open-lovable/hooks/ hooks/lovable/

# Copy utils
echo "Copying utils..."
rsync -av external/open-lovable/utils/ utils/lovable/

# Copy styles (excluding globals.css which might conflict)
echo "Copying styles..."
rsync -av --exclude='globals.css' external/open-lovable/styles/ styles/lovable/

# Copy types
echo "Copying types..."
mkdir -p types/lovable
rsync -av external/open-lovable/types/ types/lovable/

# Copy atoms
echo "Copying atoms..."
mkdir -p atoms/lovable
rsync -av external/open-lovable/atoms/ atoms/lovable/

echo "Sync complete!"
