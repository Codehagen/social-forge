import fs from 'fs';
import { Sandbox } from '@vercel/sandbox';

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  const content = fs.readFileSync('.env.local', 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx);
    let value = trimmed.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
    process.env[key] = value;
  }
  return env;
}

(async () => {
  const env = loadEnv();
  const sandbox = await Sandbox.get({
    sandboxId: process.argv[2],
    token: env.SANDBOX_VERCEL_OIDC_TOKEN ?? env.SANDBOX_VERCEL_TOKEN ?? '',
    teamId: env.SANDBOX_VERCEL_TEAM_ID ?? '',
    projectId: env.SANDBOX_VERCEL_PROJECT_ID ?? '',
  });

  const result = await sandbox.runCommand('ls', []);
  console.log(JSON.stringify(result, null, 2));
})();
