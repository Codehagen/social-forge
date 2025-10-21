import fs from 'fs';
import { Sandbox } from '@vercel/sandbox';

(async () => {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const env: Record<string, string> = {};
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex);
    let value = trimmed.slice(eqIndex + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
    process.env[key] = value;
  }

  const sandbox = await Sandbox.create({
    teamId: env.SANDBOX_VERCEL_TEAM_ID ?? '',
    projectId: env.SANDBOX_VERCEL_PROJECT_ID ?? '',
    token: env.SANDBOX_VERCEL_OIDC_TOKEN ?? env.SANDBOX_VERCEL_TOKEN ?? '',
    source: {
      type: 'git',
      url: 'https://github.com/Walgermo/social-forge',
      revision: 'main',
      depth: 1,
    },
    timeout: 600000,
    ports: [3000],
    runtime: 'node22',
    resources: { vcpus: 4 },
  });

  console.log(JSON.stringify(sandbox, null, 2));
})();
