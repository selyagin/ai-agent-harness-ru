import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import type { ToolResult } from "./types.js";

const execFileAsync = promisify(execFile);
const MAX_OUTPUT = 12_000;
const SECRET_FILE = /(^|\/)(\.env(?:\..*)?|.*\.(pem|key|p12))$/i;

function limit(text: string): Pick<ToolResult, "output" | "truncated"> {
  if (text.length <= MAX_OUTPUT) return { output: text };
  return {
    output: `${text.slice(0, MAX_OUTPUT)}\n… вывод обрезан (${text.length} символов)`,
    truncated: true,
  };
}

export class LocalSandbox {
  constructor(readonly root: string) {}

  private resolve(relativePath: string): string {
    if (!relativePath || path.isAbsolute(relativePath) || SECRET_FILE.test(relativePath)) {
      throw new Error("Недопустимый путь.");
    }

    const resolved = path.resolve(this.root, relativePath);
    const relative = path.relative(this.root, resolved);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("Путь выходит за пределы рабочей директории.");
    }

    return resolved;
  }

  async readFile(relativePath: string): Promise<ToolResult> {
    try {
      const content = await fs.readFile(this.resolve(relativePath), "utf8");
      return { ok: true, ...limit(content) };
    } catch (error) {
      return { ok: false, output: error instanceof Error ? error.message : String(error) };
    }
  }

  async searchText(query: string): Promise<ToolResult> {
    if (!query.trim()) return { ok: false, output: "Строка поиска пуста." };

    try {
      const { stdout } = await execFileAsync(
        "git",
        ["grep", "-n", "-I", "--", query],
        { cwd: this.root, maxBuffer: MAX_OUTPUT * 2 },
      );
      return { ok: true, ...limit(stdout || "Совпадений не найдено.") };
    } catch (error: unknown) {
      const stderr = error && typeof error === "object" && "stderr" in error ? String(error.stderr) : "";
      return { ok: false, output: stderr || "Совпадений не найдено или git grep недоступен." };
    }
  }

  async runReadOnly(command: string, args: string[] = []): Promise<ToolResult> {
    const allowed = new Set(["git", "npm", "node"]);
    if (!allowed.has(command)) {
      return { ok: false, output: `Команда ${command} не входит в allowlist sandbox.` };
    }

    try {
      const { stdout, stderr } = await execFileAsync(command, args, {
        cwd: this.root,
        timeout: 15_000,
        maxBuffer: MAX_OUTPUT * 2,
        env: { ...process.env, NO_COLOR: "1" },
      });
      return { ok: true, ...limit([stdout, stderr].filter(Boolean).join("\n")) };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, ...limit(message) };
    }
  }
}
