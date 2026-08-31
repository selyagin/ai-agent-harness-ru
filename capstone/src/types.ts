export type Approval = "allow" | "ask" | "deny";

export type ToolName = "read_file" | "search_text" | "run_command";

export type ToolCall = {
  name: ToolName;
  input: Record<string, unknown>;
};

export type ToolResult = {
  ok: boolean;
  output: string;
  truncated?: boolean;
};

export type CommandDecision = {
  approval: Approval;
  reason: string;
};

export type AgentEvent =
  | { type: "context_loaded"; instructionsFound: boolean }
  | { type: "tool_called"; name: ToolName }
  | { type: "approval_required"; command: string; reason: string }
  | { type: "completed"; summary: string };
