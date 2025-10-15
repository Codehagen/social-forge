import { NextRequest, NextResponse } from 'next/server';
import { getPublishService } from '@/lib/publish/PublishService';
import { promises as fs } from 'fs';
import path from 'path';

// Helper function to get files from sandbox
async function getSandboxFiles(): Promise<Array<{ file: string; data: string }>> {
  // Check for active sandbox
  const provider = (global as any).activeSandboxProvider;
  const sandbox = (global as any).activeSandbox;

  if (!provider && !sandbox) {
    throw new Error('No active sandbox');
  }

  console.log('[publish] Getting files from sandbox...');

  const files: Array<{ file: string; data: string }> = [];

  // Detect provider type
  const isE2B = provider && provider.constructor.name === 'E2BProvider';
  const isVercel = provider && provider.constructor.name === 'VercelProvider';
  const isV1Sandbox = !provider && sandbox;

  if (isE2B && provider.sandbox) {
    // E2B Provider - get file list and contents
    const fileListResult = await provider.sandbox.runCode(`
import os
import base64
from pathlib import Path

# Change to app directory
os.chdir('/home/user/app')

# Get all files recursively, excluding common build/dependency dirs
exclude_patterns = ['node_modules', '.git', '.next', 'dist', 'build', '__pycache__', '*.pyc', '*.log']

def should_exclude(path_str):
    for pattern in exclude_patterns:
        if pattern in path_str:
            return True
        if pattern.startswith('*') and path_str.endswith(pattern[1:]):
            return True
    return False

def get_files_recursive(root_dir):
    files = []
    for root, dirs, files_in_dir in os.walk(root_dir):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if not should_exclude(d)]

        for file in files_in_dir:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, root_dir)
            if not should_exclude(rel_path):
                files.append(rel_path)
    return files

files = get_files_recursive('.')
print(f"FILES_START:{','.join(files)}:FILES_END")
    `);

    const output = fileListResult.logs.stdout.join('\n');
    const filesMatch = output.match(/FILES_START:(.*?):FILES_END/);
    if (!filesMatch) {
      throw new Error('Failed to get file list from E2B sandbox');
    }

    const filePaths = filesMatch[1].split(',').filter((f: string) => f.trim());

    // Read each file
    for (const filePath of filePaths) {
      try {
        const readResult = await provider.sandbox.runCode(`
import os
import base64

os.chdir('/home/user/app')
with open('${filePath.replace(/'/g, "\\'")}', 'rb') as f:
    content = f.read()
    encoded = base64.b64encode(content).decode('utf-8')
    print(f"CONTENT_START:{encoded}:CONTENT_END")
        `);

        const contentOutput = readResult.logs.stdout.join('\n');
        const contentMatch = contentOutput.match(/CONTENT_START:(.*?):CONTENT_END/);
        if (contentMatch) {
          files.push({
            file: filePath,
            data: contentMatch[1],
          });
        }
      } catch (error) {
        console.warn(`Failed to read file ${filePath}:`, error);
      }
    }

  } else if (isVercel && provider) {
    // Vercel Provider - get file list and contents
    const findResult = await provider.sandbox.runCommand({
      cmd: 'find',
      args: ['.', '-name', 'node_modules', '-prune', '-o', '-name', '.git', '-prune', '-o', '-name', '.next', '-prune', '-o', '-name', 'dist', '-prune', '-o', '-name', 'build', '-prune', '-o', '-type', 'f', '-print'],
      cwd: '/vercel/sandbox'
    });

    let fileList = '';
    if (typeof findResult.stdout === 'function') {
      fileList = await findResult.stdout();
    } else {
      fileList = findResult.stdout || '';
    }

    const filePaths = fileList.split('\n').filter(f => f.trim() && !f.includes('node_modules') && !f.includes('.git'));

    // Read each file
    for (const filePath of filePaths) {
      try {
        const readResult = await provider.sandbox.runCommand({
          cmd: 'base64',
          args: [filePath],
          cwd: '/vercel/sandbox'
        });

        let base64Content = '';
        if (typeof readResult.stdout === 'function') {
          base64Content = (await readResult.stdout()).trim();
        } else {
          base64Content = (readResult.stdout || '').trim();
        }

        files.push({
          file: filePath.replace(/^\.\//, ''), // Remove leading ./
          data: base64Content,
        });
      } catch (error) {
        console.warn(`Failed to read file ${filePath}:`, error);
      }
    }

  } else {
    throw new Error('Unsupported sandbox provider for publishing');
  }

  return files;
}

export async function POST(req: NextRequest) {
  // Temporarily disabled - builder functionality being reimplemented
  return NextResponse.json(
    { error: 'Publishing is currently disabled while the builder is being reimplemented' },
    { status: 503 }
  );
}
