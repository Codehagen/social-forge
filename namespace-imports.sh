#!/bin/bash

# Script to namespace imports in synced Open Lovable code
# This updates all @/imports to use the lovable namespace

set -e

echo "Namespacing imports in synced Open Lovable code..."

# Function to update imports in a directory
update_imports() {
  local dir=$1
  local namespace=$2

  if [ -d "$dir" ]; then
    echo "Updating imports in $dir..."

    # Find all TypeScript/JavaScript files and update imports
    find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' "s|@/components/|@/components/$namespace/|g" {} \;
    find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' "s|@/lib/|@/lib/$namespace/|g" {} \;
    find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' "s|@/hooks/|@/hooks/$namespace/|g" {} \;
    find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' "s|@/utils/|@/utils/$namespace/|g" {} \;
    find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' "s|@/types/|@/types/$namespace/|g" {} \;
    find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' "s|@/atoms/|@/atoms/$namespace/|g" {} \;
    find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' "s|@/config/|@/config/$namespace/|g" {} \;
    find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' "s|@/styles/|@/styles/$namespace/|g" {} \;
  fi
}

# Update imports in all synced directories
update_imports "app/(builder)/builder" "lovable"
update_imports "components/lovable" "lovable"
update_imports "lib/lovable" "lovable"
update_imports "hooks/lovable" "lovable"
update_imports "utils/lovable" "lovable"
update_imports "types/lovable" "lovable"
update_imports "atoms/lovable" "lovable"

echo "Import namespacing complete!"
