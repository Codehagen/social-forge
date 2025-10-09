export type PublishInput = {
  projectDir: string;
  name: string;
  workspaceId?: string;
};

export type PublishResult = {
  url: string;
  deploymentId?: string;
  error?: string;
};

export interface PublishService {
  publish(input: PublishInput): Promise<PublishResult>;
}

export type PublishStrategy = 'vercel' | 'zip' | 'workspaceSave';

export function getPublishService(strategy: PublishStrategy = 'vercel'): PublishService {
  switch (strategy) {
    case 'vercel':
      return {
        publish: async (input: PublishInput) => {
          // Import dynamically to avoid issues if the module isn't available
          const { vercelPublish } = await import('./vercel');
          return vercelPublish(input);
        }
      };
    case 'zip':
      return {
        publish: async (input: PublishInput) => {
          // Stub implementation - download ZIP
          return {
            url: '#',
            error: 'ZIP download not yet implemented'
          };
        }
      };
    case 'workspaceSave':
      return {
        publish: async (input: PublishInput) => {
          // Stub implementation - save to workspace storage
          return {
            url: '#',
            error: 'Workspace save not yet implemented'
          };
        }
      };
    default:
      throw new Error(`Unknown publish strategy: ${strategy}`);
  }
}
