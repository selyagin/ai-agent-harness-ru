import fs from "node:fs/promises";
import path from "node:path";
import { evaluateCommand } from "./approval.js";
import { buildSystemPrompt } from "./prompt.js";
import { LocalSandbox } from "./sandbox.js";
import type { AgentEvent } from "./types.js";

type Options = {
  task: string;
  query?: string;
  read?: string;
  command?: string;
};

function parseArgs(argv: string[]): Options {
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (key?.startsWith("--") && value) values.set(key.slice(2), value);
  }

  const task = values.get("task");
  if (!task) {
    throw new Error("Укажите задачу: --task \"...\"");
  }

  return {
    task,
    query: values.get("query"),
    read: values.get("read"),
    command: values.get("command"),
  };
}

async function loadInstructions(root: string): Promise<string> {
  try {
    return await fs.readFile(path.join(root, "AGENTS.md"), "utf8");
  } catch {
    return "";
  }
}

function emit(event: AgentEvent): void {
  console.log(JSON.stringify(event));
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const root = process.cwd();
  const instructions = await loadInstructions(root);
  const sandbox = new LocalSandbox(root);

  emit({ type: "context_loaded", instructionsFound: Boolean(instructions) });
  console.log(buildSystemPrompt({ task: options.task, projectInstructions: instructions }));

  if (options.read) {
    emit({ type: "tool_called", name: "read_file" });
    console.log(await sandbox.readFile(options.read));
  }

  if (options.query) {
    emit({ type: "tool_called", name: "search_text" });
    console.log(await sandbox.searchText(options.query));
  }

  if (options.command) {
    const decision = evaluateCommand(options.command);
    if (decision.approval !== "allow") {
      emit({ type: "approval_required", command: options.command, reason: decision.reason });
      return;
    }

    const [command, ...args] = options.command.split(/\s+/);
    emit({ type: "tool_called", name: "run_command" });
    console.log(await sandbox.runReadOnly(command, args));
  }

  emit({
    type: "completed",
    summary: "Контекст загружен; операции чтения и проверки выполнены в рамках локального sandbox.",
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
