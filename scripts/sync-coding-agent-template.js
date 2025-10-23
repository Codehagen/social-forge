#!/usr/bin/env node

/**
 * Sync Script for Coding Agent Template
 * 
 * This script compares Social Forge with the upstream coding-agent-template
 * and generates a report of missing/outdated files and components.
 * 
 * Usage: node scripts/sync-coding-agent-template.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TEMPLATE_PATH = '../coding-agent-template';
const SOCIAL_FORGE_PATH = '.';

// Mapping of template paths to Social Forge paths
const PATH_MAPPINGS = {
  'app/tasks': 'app/builder/tasks',
  'app/api/tasks': 'app/api/builder/tasks',
  'app/api/sandboxes': 'app/api/builder/sandboxes',
  'app/api/github': 'app/api/github',
  'app/api/vercel': 'app/api/vercel',
  'app/api/auth': 'app/api/auth',
  'components': 'components/builder',
  'lib/sandbox': 'lib/coding-agent/sandbox',
  'lib/session': 'lib/coding-agent/session',
  'lib/github': 'lib/coding-agent/github',
  'lib/vercel-client': 'lib/vercel',
  'lib/db': 'prisma',
};

// Files that should be ignored (Social Forge specific or different architecture)
const IGNORE_PATTERNS = [
  'components/auth/session-provider.tsx', // Social Forge uses better-auth
  'components/auth/sign-out.tsx', // Different auth flow
  'components/providers/jotai-provider.tsx', // Different state management
  'lib/db/', // Social Forge uses Prisma instead of Drizzle
  'drizzle.config.ts',
  'lib/session/get-server-session.ts', // Different session handling
  'lib/atoms/', // Social Forge uses different state management
];

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function getTemplateFiles() {
  try {
    const output = execSync(`find ${TEMPLATE_PATH} -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | sort`, { 
      encoding: 'utf8',
      cwd: SOCIAL_FORGE_PATH 
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    log(`Error getting template files: ${error.message}`, 'error');
    return [];
  }
}

function getSocialForgeFiles() {
  try {
    const output = execSync(`find ${SOCIAL_FORGE_PATH} -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | sort`, { 
      encoding: 'utf8',
      cwd: SOCIAL_FORGE_PATH 
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    log(`Error getting Social Forge files: ${error.message}`, 'error');
    return [];
  }
}

function shouldIgnoreFile(templatePath) {
  return IGNORE_PATTERNS.some(pattern => templatePath.includes(pattern));
}

function mapTemplatePathToSocialForge(templatePath) {
  const relativePath = templatePath.replace(TEMPLATE_PATH + '/', '');
  
  for (const [templateDir, socialForgeDir] of Object.entries(PATH_MAPPINGS)) {
    if (relativePath.startsWith(templateDir)) {
      return path.join(SOCIAL_FORGE_PATH, relativePath.replace(templateDir, socialForgeDir));
    }
  }
  
  // If no mapping found, assume it should be in the same relative location
  return path.join(SOCIAL_FORGE_PATH, relativePath);
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function getFileStats(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      size: stats.size,
      mtime: stats.mtime
    };
  } catch (error) {
    return { exists: false };
  }
}

function generateReport() {
  log('Starting coding agent template sync analysis...');
  
  const templateFiles = getTemplateFiles();
  const socialForgeFiles = getSocialForgeFiles();
  
  log(`Found ${templateFiles.length} template files`);
  log(`Found ${socialForgeFiles.length} Social Forge files`);
  
  const report = {
    summary: {
      templateFiles: templateFiles.length,
      socialForgeFiles: socialForgeFiles.length,
      analyzed: 0,
      missing: 0,
      outdated: 0,
      upToDate: 0,
      ignored: 0
    },
    missing: [],
    outdated: [],
    upToDate: [],
    ignored: [],
    extra: []
  };
  
  // Analyze template files
  for (const templateFile of templateFiles) {
    if (shouldIgnoreFile(templateFile)) {
      report.ignored.push(templateFile);
      report.summary.ignored++;
      continue;
    }
    
    const socialForgeFile = mapTemplatePathToSocialForge(templateFile);
    const templateStats = getFileStats(templateFile);
    const socialForgeStats = getFileStats(socialForgeFile);
    
    report.summary.analyzed++;
    
    if (!socialForgeStats.exists) {
      report.missing.push({
        template: templateFile,
        expected: socialForgeFile,
        reason: 'File not found in Social Forge'
      });
      report.summary.missing++;
    } else if (templateStats.mtime > socialForgeStats.mtime) {
      report.outdated.push({
        template: templateFile,
        socialForge: socialForgeFile,
        templateMtime: templateStats.mtime,
        socialForgeMtime: socialForgeStats.mtime,
        reason: 'Template file is newer'
      });
      report.summary.outdated++;
    } else {
      report.upToDate.push({
        template: templateFile,
        socialForge: socialForgeFile
      });
      report.summary.upToDate++;
    }
  }
  
  // Find extra files in Social Forge (not in template)
  const templateRelativePaths = new Set(
    templateFiles
      .filter(f => !shouldIgnoreFile(f))
      .map(f => f.replace(TEMPLATE_PATH + '/', ''))
  );
  
  for (const socialForgeFile of socialForgeFiles) {
    const relativePath = socialForgeFile.replace(SOCIAL_FORGE_PATH + '/', '');
    if (!templateRelativePaths.has(relativePath) && 
        (relativePath.includes('builder/') || relativePath.includes('coding-agent/'))) {
      report.extra.push(socialForgeFile);
    }
  }
  
  return report;
}

function printReport(report) {
  console.log('\n' + '='.repeat(80));
  console.log('CODING AGENT TEMPLATE SYNC REPORT');
  console.log('='.repeat(80));
  
  console.log('\n📊 SUMMARY:');
  console.log(`  Template files analyzed: ${report.summary.analyzed}`);
  console.log(`  Missing files: ${report.summary.missing}`);
  console.log(`  Outdated files: ${report.summary.outdated}`);
  console.log(`  Up-to-date files: ${report.summary.upToDate}`);
  console.log(`  Ignored files: ${report.summary.ignored}`);
  console.log(`  Extra Social Forge files: ${report.extra.length}`);
  
  if (report.missing.length > 0) {
    console.log('\n❌ MISSING FILES:');
    report.missing.forEach(item => {
      console.log(`  • ${item.template}`);
      console.log(`    Expected: ${item.expected}`);
      console.log(`    Reason: ${item.reason}`);
    });
  }
  
  if (report.outdated.length > 0) {
    console.log('\n⚠️  OUTDATED FILES:');
    report.outdated.forEach(item => {
      console.log(`  • ${item.template}`);
      console.log(`    Social Forge: ${item.socialForge}`);
      console.log(`    Template: ${item.templateMtime.toISOString()}`);
      console.log(`    Social Forge: ${item.socialForgeMtime.toISOString()}`);
    });
  }
  
  if (report.ignored.length > 0) {
    console.log('\n🚫 IGNORED FILES (Social Forge specific):');
    report.ignored.forEach(file => {
      console.log(`  • ${file}`);
    });
  }
  
  if (report.extra.length > 0) {
    console.log('\n➕ EXTRA SOCIAL FORGE FILES:');
    report.extra.forEach(file => {
      console.log(`  • ${file}`);
    });
  }
  
  if (report.upToDate.length > 0) {
    console.log('\n✅ UP-TO-DATE FILES:');
    console.log(`  ${report.upToDate.length} files are synchronized`);
  }
  
  console.log('\n' + '='.repeat(80));
  
  // Overall status
  const totalIssues = report.summary.missing + report.summary.outdated;
  if (totalIssues === 0) {
    console.log('🎉 All files are synchronized!');
  } else {
    console.log(`⚠️  ${totalIssues} files need attention`);
  }
  
  console.log('='.repeat(80) + '\n');
}

function main() {
  try {
    const report = generateReport();
    printReport(report);
    
    // Save detailed report to file
    const reportFile = path.join(SOCIAL_FORGE_PATH, 'coding-agent-sync-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    log(`Detailed report saved to: ${reportFile}`);
    
    // Exit with appropriate code
    const totalIssues = report.summary.missing + report.summary.outdated;
    process.exit(totalIssues > 0 ? 1 : 0);
    
  } catch (error) {
    log(`Script failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateReport, printReport };
