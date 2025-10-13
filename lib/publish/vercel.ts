import { PublishInput, PublishResult } from './PublishService';
import { promises as fs } from 'fs';
import path from 'path';

interface VercelDeploymentRequest {
  name?: string;
  projectId?: string;
  projectSettings?: {
    framework?: string | null;
    buildCommand?: string | null;
    devCommand?: string | null;
    installCommand?: string | null;
    outputDirectory?: string | null;
    rootDirectory?: string | null;
  };
  files: Array<{
    file: string;
    data: string; // base64 encoded content
  }>;
  target?: 'production' | 'staging';
  teamId?: string;
}

interface VercelDeploymentResponse {
  id: string;
  url: string;
  readyState: 'READY' | 'ERROR' | 'QUEUED' | 'BUILDING';
  error?: {
    code: string;
    message: string;
  };
}

async function readProjectFiles(projectDir: string): Promise<Array<{ file: string; data: string }>> {
  const files: Array<{ file: string; data: string }> = [];

  async function readDirectory(dir: string, basePath: string = ''): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);

      // Skip node_modules and other build artifacts
      if (entry.name === 'node_modules' ||
          entry.name === '.next' ||
          entry.name === 'dist' ||
          entry.name === 'build' ||
          entry.name === '.git' ||
          entry.name.startsWith('.')) {
        continue;
      }

      if (entry.isDirectory()) {
        await readDirectory(fullPath, relativePath);
      } else if (entry.isFile()) {
        try {
          const content = await fs.readFile(fullPath);
          const base64Content = content.toString('base64');
          files.push({
            file: relativePath,
            data: base64Content,
          });
        } catch (error) {
          console.warn(`Failed to read file ${relativePath}:`, error);
        }
      }
    }
  }

  await readDirectory(projectDir);
  return files;
}

export async function vercelPublish(input: PublishInput): Promise<PublishResult> {
  try {
    console.log('Publishing to Vercel:', input);

    // Get Vercel authentication
    const vercelOidcToken = process.env.VERCEL_OIDC_TOKEN;
    const vercelToken = process.env.VERCEL_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    const projectId = process.env.VERCEL_PROJECT_ID;

    const authToken = vercelOidcToken || vercelToken;
    if (!authToken) {
      return {
        url: '',
        error: 'VERCEL_OIDC_TOKEN or VERCEL_TOKEN environment variable is required',
      };
    }

    // Check if project directory exists
    try {
      await fs.access(input.projectDir);
    } catch {
      return {
        url: '',
        error: `Project directory does not exist: ${input.projectDir}`,
      };
    }

    // Read project files
    console.log('Reading project files...');
    const files = await readProjectFiles(input.projectDir);

    if (files.length === 0) {
      return {
        url: '',
        error: 'No files found in project directory',
      };
    }

    console.log(`Found ${files.length} files to deploy`);

    // Prepare deployment request
    const deploymentRequest: VercelDeploymentRequest = {
      files,
      target: 'production',
    };

    // If we have a specific project ID, deploy to it
    if (projectId) {
      deploymentRequest.projectId = projectId;
    } else {
      // Create a new project with the provided name
      deploymentRequest.name = input.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      deploymentRequest.projectSettings = {
        framework: 'nextjs', // Assume Next.js for now
        buildCommand: 'npm run build',
        devCommand: 'npm run dev',
        installCommand: 'npm install',
        outputDirectory: '.next',
      };
    }

    if (teamId) {
      deploymentRequest.teamId = teamId;
    }

    // Make deployment request to Vercel
    console.log('Creating Vercel deployment...');
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deploymentRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Vercel API error:', response.status, errorData);
      return {
        url: '',
        error: `Vercel API error: ${response.status} ${response.statusText}${errorData.error ? ` - ${errorData.error.message}` : ''}`,
      };
    }

    const deployment: VercelDeploymentResponse = await response.json();

    if (deployment.error) {
      return {
        url: '',
        error: `Deployment failed: ${deployment.error.message}`,
      };
    }

    console.log('Deployment created:', deployment.id, deployment.url);

    return {
      url: deployment.url,
      deploymentId: deployment.id,
    };
  } catch (error) {
    console.error('Vercel publish error:', error);
    return {
      url: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
