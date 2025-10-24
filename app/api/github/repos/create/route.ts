import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getOctokit } from "@/lib/coding-agent/github";

interface RepoTemplate {
  id: string
  name: string
  description: string
  sourceRepo?: string
  sourceFolder?: string
}

// Helper function to recursively copy files from a directory
async function copyFilesRecursively(
  octokit: any,
  sourceOwner: string,
  sourceRepoName: string,
  sourcePath: string,
  repoOwner: string,
  repoName: string,
  basePath: string,
) {
  try {
    const { data: contents } = await octokit.repos.getContent({
      owner: sourceOwner,
      repo: sourceRepoName,
      path: sourcePath,
    })

    if (!Array.isArray(contents)) {
      return
    }

    for (const item of contents) {
      if (item.type === 'file' && item.download_url) {
        try {
          // Download file content
          const response = await fetch(item.download_url)
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`)
          }
          const content = await response.text()

          // Calculate relative path by removing the base path prefix
          const relativePath = item.path.startsWith(basePath + '/')
            ? item.path.substring(basePath.length + 1)
            : item.name

          // Create file in new repository
          await octokit.repos.createOrUpdateFileContents({
            owner: repoOwner,
            repo: repoName,
            path: relativePath,
            message: `Add ${relativePath} from template`,
            content: Buffer.from(content).toString('base64'),
          })
        } catch (error) {
          console.error('Error copying file:', error)
          // Continue with other files even if one fails
        }
      } else if (item.type === 'dir') {
        // Recursively process directories
        await copyFilesRecursively(octokit, sourceOwner, sourceRepoName, item.path, repoOwner, repoName, basePath)
      }
    }
  } catch (error) {
    console.error('Error processing directory:', error)
    // Continue even if one directory fails
  }
}

// Helper function to copy files from template repository
async function populateRepoFromTemplate(octokit: any, repoOwner: string, repoName: string, template: RepoTemplate) {
  if (!template.sourceRepo || !template.sourceFolder) {
    return
  }

  // Parse source repository
  const sourceMatch = template.sourceRepo.match(/github\.com\/([\w-]+)\/([\w-]+)/)
  if (!sourceMatch) {
    throw new Error('Invalid source repository URL')
  }

  const [, sourceOwner, sourceRepoName] = sourceMatch

  try {
    await copyFilesRecursively(
      octokit,
      sourceOwner,
      sourceRepoName,
      template.sourceFolder,
      repoOwner,
      repoName,
      template.sourceFolder,
    )
  } catch (error) {
    console.error('Error populating repository from template:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const octokit = await getOctokit();
    if (!octokit.auth) {
      return NextResponse.json({ error: "GitHub account not connected" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, private: isPrivate, orgName, autoInit = false, template } = body;

    if (!name) {
      return NextResponse.json({ error: "Repository name is required" }, { status: 400 });
    }

    const repoData: any = {
      name,
      description: description || "",
      private: isPrivate || false,
      auto_init: autoInit,
    };

    let result;
    if (orgName) {
      // Create repository in organization
      result = await octokit.rest.repos.createInOrg({
        org: orgName,
        ...repoData,
      });
    } else {
      // Create repository in user's account
      result = await octokit.rest.repos.createForAuthenticatedUser(repoData);
    }

    const { data: repo } = result;

    // If a template is selected, populate the repository
    if (template && template.id !== 'none') {
      try {
        await populateRepoFromTemplate(octokit, repo.owner.login, repo.name, template as RepoTemplate)
      } catch (error) {
        console.error('Error populating repository from template:', error)
        // Don't fail the entire operation if template population fails
        // The repository was created successfully, just without template files
      }
    }

    return NextResponse.json({
      success: true,
      repo: {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        private: repo.private,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        sshUrl: repo.ssh_url,
        defaultBranch: repo.default_branch,
        owner: {
          login: repo.owner.login,
          type: repo.owner.type,
        },
      },
    });
  } catch (error: any) {
    console.error("Failed to create GitHub repository", error);
    
    if (error.status === 422) {
      return NextResponse.json({ 
        error: "Repository creation failed: Invalid data or repository already exists" 
      }, { status: 422 });
    }
    
    if (error.status === 403) {
      return NextResponse.json({ 
        error: "Repository creation failed: Insufficient permissions" 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      error: "Failed to create GitHub repository" 
    }, { status: 500 });
  }
}
