#!/bin/bash

# Script to clean up old drizzle-orm imports and queries

echo "Cleaning up drizzle-orm imports..."

# Find all files that import from drizzle-orm
find app/api/tasks -name "*.ts" -exec grep -l "import.*eq.*from.*drizzle-orm" {} \; | while read file; do
  echo "Processing $file..."

  # Remove drizzle-orm imports
  sed -i '' '/import.*eq.*from.*drizzle-orm/d' "$file"
  sed -i '' '/import.*and.*from.*drizzle-orm/d' "$file"
  sed -i '' '/import.*isNull.*from.*drizzle-orm/d' "$file"
  sed -i '' '/import.*asc.*from.*drizzle-orm/d' "$file"
  sed -i '' '/import.*desc.*from.*drizzle-orm/d' "$file"
  sed -i '' '/import.*or.*from.*drizzle-orm/d' "$file"
  sed -i '' '/import.*isNotNull.*from.*drizzle-orm/d' "$file"

  # Remove tasks import from schema
  sed -i '' '/import.*tasks.*from.*@\/lib\/db\/schema/d' "$file"

  # Replace db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1) with db.codingTask.findUnique
  sed -i '' 's/db\.select()\.from(tasks)\.where(eq(tasks\.id, taskId))\.limit(1)/db.codingTask.findUnique({\n      where: { id: taskId }\n    })/g' "$file"

  # Replace db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id))).limit(1)
  sed -i '' 's/db\.select()\.from(tasks)\.where(and(eq(tasks\.id, taskId), eq(tasks\.userId, session\.user\.id)))\.limit(1)/db.codingTask.findUnique({\n      where: { id: taskId }\n    })/g' "$file"

  # Replace ownership checks
  sed -i '' 's/if (!task) {/if (!task || task.userId !== session.user.id) {/g' "$file"
  sed -i '' '/Verify ownership/,/return NextResponse/d' "$file"

done

echo "Cleanup complete!"
