"use server";

import { customAlphabet } from "nanoid";
import { generateText } from "ai";

export type BranchNameOptions = {
  description: string;
  repoName?: string;
  context?: string;
};

const BRANCH_NAME_REGEX = /^[a-z0-9-\/]+$/;
const HASH_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const HASH_LENGTH = 6;

export async function generateBranchName(options: BranchNameOptions) {
  if (!process.env.AI_GATEWAY_API_KEY) {
    throw new Error("AI_GATEWAY_API_KEY environment variable is required to generate AI branch names.");
  }

  const prompt = buildPrompt(options);

  const result = await generateText({
    model: "openai/gpt-5-nano",
    prompt,
    temperature: 0.3,
  });

  const baseBranchName = result.text.trim().replace(/^["']|["']$/g, "");

  if (!BRANCH_NAME_REGEX.test(baseBranchName)) {
    throw new Error(`Generated branch name contains invalid characters: ${baseBranchName}`);
  }

  if (baseBranchName.length > 50) {
    throw new Error("Generated branch name is too long");
  }

  const hash = customAlphabet(HASH_ALPHABET, HASH_LENGTH)();
  return `${baseBranchName}-${hash}`;
}

export async function createFallbackBranchName(taskId: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  return `agent/${timestamp}-${taskId.slice(0, 8)}`;
}

function buildPrompt({ description, repoName, context }: BranchNameOptions) {
  const repoLine = repoName ? `Repository: ${repoName}` : "";
  const contextLine = context ? `Additional context: ${context}` : "";

  return `Generate a concise, descriptive Git branch name for the following task:

Description: ${description}
${repoLine}
${contextLine}

Requirements:
- Use lowercase letters, numbers, and hyphens only
- Keep it under 50 characters
- Be descriptive but concise
- Use conventional prefixes like feature/, fix/, chore/, docs/ when appropriate
- Make it readable and meaningful

Return ONLY the branch name, nothing else.`;
}
