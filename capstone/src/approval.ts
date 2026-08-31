import type { CommandDecision } from "./types.js";

const denyPatterns = [
  /(^|\s)rm\s+-[^\n]*r[^\n]*f/i,
  /(^|\s)sudo(\s|$)/i,
  /(^|\s)(mkfs|dd|shutdown|reboot)(\s|$)/i,
  /curl[^\n]*\|\s*(sh|bash)\b/i,
  /(^|\s)git\s+push(\s|$)/i,
  /(^|\s)git\s+reset\s+--hard(\s|$)/i,
];

const askPatterns = [
  /(^|\s)npm\s+(install|ci|publish)(\s|$)/i,
  /(^|\s)(pnpm|yarn)\s+(add|install|publish)(\s|$)/i,
  /(^|\s)git\s+(add|commit|merge|rebase)(\s|$)/i,
  /(^|\s)(node|python|python3)(\s|$)/i,
  /(^|\s)(curl|wget)(\s|$)/i,
];

export function evaluateCommand(command: string): CommandDecision {
  if (!command.trim()) {
    return { approval: "deny", reason: "Пустая команда не допускается." };
  }

  if (denyPatterns.some((pattern) => pattern.test(command))) {
    return { approval: "deny", reason: "Команда соответствует запрещенному шаблону." };
  }

  if (askPatterns.some((pattern) => pattern.test(command))) {
    return { approval: "ask", reason: "Команда может изменить состояние или использовать сеть." };
  }

  return { approval: "allow", reason: "Команда относится к разрешенному read-only набору." };
}
