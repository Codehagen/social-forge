#!/bin/bash

# Comprehensive cleanup script for drizzle-orm to Prisma migration

echo "Starting comprehensive cleanup of drizzle-orm code..."

# Find all task API files
find app/api/tasks -name "*.ts" | while read file; do
  echo "Processing $file..."

  # Remove all drizzle-orm imports
  sed -i '' '/import.*from.*drizzle-orm/d' "$file"
  sed -i '' '/import.*eq.*from.*drizzle-orm/d' "$file"
  sed -i '' '/import.*and.*from.*drizzle-orm/d' "$file"
  sed -i '' '/import.*isNull.*from.*drizzle-orm/d' "$file"
  sed -i '' '/import.*asc.*from.*drizzle-orm/d' "$file"
  sed -i '' '/import.*desc.*from.*drizzle-orm/d' "$file"
  sed -i '' '/import.*or.*from.*drizzle-orm/d' "$file"
  sed -i '' '/import.*isNotNull.*from.*drizzle-orm/d' "$file"

  # Remove tasks import
  sed -i '' '/import.*tasks.*from.*@\/lib\/db\/schema/d' "$file"
  sed -i '' '/import.*taskMessages.*from.*@\/lib\/db\/schema/d' "$file"

  # Fix simple task queries
  sed -i '' 's/const \[task\] = await db\.select()\.from(tasks)\.where(eq(tasks\.id, taskId))\.limit(1)/const task = await db.codingTask.findUnique({\n      where: { id: taskId }\n    })/g' "$file"

  # Fix task queries with ownership
  sed -i '' 's/const \[task\] = await db\.select()\.from(tasks)\.where(and(eq(tasks\.id, taskId), eq(tasks\.userId, session\.user\.id)))\.limit(1)/const task = await db.codingTask.findUnique({\n      where: { id: taskId }\n    })/g' "$file"

  # Fix complex task queries with deletedAt
  sed -i '' 's/await db\.select()\.from(tasks)\.where(and(eq(tasks\.id, taskId), eq(tasks\.userId, session\.user\.id), isNull(tasks\.deletedAt)))\.limit(1)/await db.codingTask.findUnique({\n      where: {\n        id: taskId,\n        userId: session.user.id,\n        deletedAt: null\n      }\n    })/g' "$file"

  # Fix task array destructuring
  sed -i '' 's/const \[task\] = await db\.codingTask\.findUnique(/const task = await db.codingTask.findUnique(/g' "$file"

  # Fix ownership checks
  sed -i '' 's/if (!task || task\.length === 0 || task\[0\]\?.userId !== session\.user\.id) {/if (!task || task.userId !== session.user.id) {/g' "$file"
  sed -i '' 's/if (!task || task\.userId !== session\.user\.id) {/if (!task || task.userId !== session.user.id) {/g' "$file"
  sed -i '' 's/if (task\.length === 0) {/if (!task) {/g' "$file"

  # Fix update queries
  sed -i '' 's/await db\.update(tasks)\.set(/await db.codingTask.update({\n      where: { id: taskId },\n      data: /g' "$file"
  sed -i '' 's/)\.where(eq(tasks\.id, taskId))/}/g' "$file"

  # Fix message queries
  sed -i '' 's/await db\.select()\.from(taskMessages)\.where(eq(taskMessages\.taskId, taskId))\.orderBy(asc(taskMessages\.createdAt))/await db.codingTaskMessage.findMany({\n      where: { taskId },\n      orderBy: { createdAt: '\''asc'\'' }\n    })/g' "$file"

done

echo "Comprehensive cleanup completed!"
