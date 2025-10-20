import { Sandbox } from "@vercel/sandbox";

export type CommandResult = {
  success: boolean;
  exitCode?: number;
  output?: string;
  error?: string;
  streamingLogs?: unknown[];
  command?: string;
};

export type StreamingCommandOptions = {
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
  onJsonLine?: (jsonData: unknown) => void;
};

export async function runCommandInSandbox(
  sandbox: Sandbox,
  command: string,
  args: string[] = []
): Promise<CommandResult> {
  try {
    const result = await sandbox.runCommand(command, args);

    let stdout = "";
    let stderr = "";

    try {
      stdout = await (result.stdout as () => Promise<string>)();
    } catch {
      // ignore
    }

    try {
      stderr = await (result.stderr as () => Promise<string>)();
    } catch {
      // ignore
    }

    const fullCommand = args.length > 0 ? `${command} ${args.join(" ")}` : command;

    return {
      success: result.exitCode === 0,
      exitCode: result.exitCode,
      output: stdout,
      error: stderr,
      command: fullCommand,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Command execution failed";
    const fullCommand = args.length > 0 ? `${command} ${args.join(" ")}` : command;
    return {
      success: false,
      error: errorMessage,
      command: fullCommand,
    };
  }
}

export async function runStreamingCommandInSandbox(
  sandbox: Sandbox,
  command: string,
  args: string[] = [],
  options: StreamingCommandOptions = {}
): Promise<CommandResult> {
  try {
    const result = await sandbox.runCommand(command, args);

    let stdout = "";
    let stderr = "";

    try {
      if (typeof result.stdout === "function") {
        stdout = await result.stdout();
        if (options.onJsonLine) {
          const lines = stdout.split("\n");
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            try {
              const jsonData = JSON.parse(trimmedLine);
              options.onJsonLine(jsonData);
            } catch {
              // ignore invalid JSON
            }
          }
        }
        options.onStdout?.(stdout);
      }
    } catch {
      // ignore
    }

    try {
      if (typeof result.stderr === "function") {
        stderr = await result.stderr();
        options.onStderr?.(stderr);
      }
    } catch {
      // ignore
    }

    const fullCommand = args.length > 0 ? `${command} ${args.join(" ")}` : command;

    return {
      success: result.exitCode === 0,
      exitCode: result.exitCode,
      output: stdout,
      error: stderr,
      command: fullCommand,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to run streaming command in sandbox";
    const fullCommand = args.length > 0 ? `${command} ${args.join(" ")}` : command;
    return {
      success: false,
      error: errorMessage,
      command: fullCommand,
    };
  }
}
