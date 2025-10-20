"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/coding-agent/session";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { resolveSandbox } from "@/lib/coding-agent/sandbox/helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const task = await getBuilderTaskForUser(taskId, session.user.id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!task.sandboxId) {
      return NextResponse.json({ error: "Task does not have an active sandbox" }, { status: 400 });
    }

    const sandbox = await resolveSandbox(taskId, task.sandboxId);
    if (!sandbox) {
      return NextResponse.json({ error: "Sandbox not available" }, { status: 400 });
    }

    const { method, filename, position } = await request.json();

    if (method !== "textDocument/definition") {
      return NextResponse.json({ error: "Unsupported LSP method" }, { status: 400 });
    }

    const absoluteFilename = filename.startsWith("/") ? filename : `/${filename}`;
    const scriptPath = ".lsp-helper.mjs";
    const helperScript = `
import ts from 'typescript';
import fs from 'fs';
import path from 'path';

const filename = '${absoluteFilename.replace(/'/g, "\\'")}';
const line = ${position.line};
const character = ${position.character};

let configPath = process.cwd();
while (configPath !== '/') {
  const tsconfigPath = path.join(configPath, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    break;
  }
  configPath = path.dirname(configPath);
}

const tsconfigPath = path.join(configPath, 'tsconfig.json');
const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, configPath);

const files = new Map();
const host = {
  getScriptFileNames: () => parsedConfig.fileNames,
  getScriptVersion: (fileName) => {
    const file = files.get(fileName);
    return file && file.version ? file.version.toString() : '0';
  },
  getScriptSnapshot: (fileName) => {
    if (!fs.existsSync(fileName)) return undefined;
    const content = fs.readFileSync(fileName, 'utf8');
    return ts.ScriptSnapshot.fromString(content);
  },
  getCurrentDirectory: () => configPath,
  getCompilationSettings: () => parsedConfig.options,
  getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
  directoryExists: ts.sys.directoryExists,
  getDirectories: ts.sys.getDirectories,
};

const service = ts.createLanguageService(host, ts.createDocumentRegistry());
const fullPath = path.resolve(configPath, filename.replace(/^\/*/g, ''));
const program = service.getProgram();
if (!program) {
  console.error(JSON.stringify({ error: 'Failed to get program' }));
  process.exit(1);
}

const sourceFile = program.getSourceFile(fullPath);
if (!sourceFile) {
  console.error(JSON.stringify({ error: 'File not found', filename: fullPath }));
  process.exit(1);
}

const offset = ts.getPositionOfLineAndCharacter(sourceFile, line, character);
const definitions = service.getDefinitionAtPosition(fullPath, offset);

if (definitions && definitions.length > 0) {
  const results = definitions.map(def => {
    const defSourceFile = program.getSourceFile(def.fileName);
    if (!defSourceFile) {
      return null;
    }

    const start = ts.getLineAndCharacterOfPosition(defSourceFile, def.textSpan.start);
    const end = ts.getLineAndCharacterOfPosition(defSourceFile, def.textSpan.start + def.textSpan.length);

    return {
      uri: 'file://' + def.fileName,
      range: {
        start: start,
        end: end,
      },
    };
  }).filter(Boolean);

  console.log(JSON.stringify({ definitions: results }));
} else {
  console.log(JSON.stringify({ definitions: [] }));
}
`;

    const writeCommand = `cat > '${scriptPath}' << 'EOF'\n${helperScript}\nEOF`;
    await sandbox.runCommand("sh", ["-c", writeCommand]);

    const result = await sandbox.runCommand("node", [scriptPath]);

    let stdout = "";
    let stderr = "";
    try {
      stdout = await result.stdout();
    } catch (error) {
      console.error("Failed to read LSP stdout:", error);
    }
    try {
      stderr = await result.stderr();
    } catch (error) {
      console.error("Failed to read LSP stderr:", error);
    }

    await sandbox.runCommand("rm", ["-f", scriptPath]);

    if (result.exitCode !== 0) {
      return NextResponse.json({
        error: "LSP query failed",
        details: stderr,
      }, { status: 500 });
    }

    try {
      const parsed = JSON.parse(stdout || "{}");
      return NextResponse.json({ success: true, data: parsed });
    } catch (error) {
      console.error("Failed to parse LSP output:", error, stdout);
      return NextResponse.json({ error: "Failed to parse LSP output" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in LSP endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
