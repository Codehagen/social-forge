export const GITHUB_REPO_URL =
  process.env.NEXT_PUBLIC_GITHUB_REPO_URL ?? "https://github.com/Codehagen/social-forge";

export const VERCEL_DEPLOY_URL =
  process.env.NEXT_PUBLIC_DEPLOY_URL ??
  "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCodehagen%2Fsocial-forge";

export const DEFAULT_GITHUB_STARS = Number.parseInt(
  process.env.NEXT_PUBLIC_GITHUB_STARS ?? "1056",
  10
) || 1056;
