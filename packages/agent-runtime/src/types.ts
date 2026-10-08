/** A unique identifier for a session. */
export type SessionId = string;

/** Information about an agent session. */
export interface AgentSession {
  sessionId: SessionId;
  createdAt: Date;
  status: 'idle' | 'running' | 'paused' | 'interrupted' | 'completed' | 'error';
}

/** Base event with a timestamp. */
interface BaseEvent {
  _timestamp: number;
  _sessionId: SessionId;
}

/* ── Runtime event union ─────────────────────────────────────────────── */

/** The model produced text, and this chunk was appended. */
export interface TextDeltaEvent extends BaseEvent {
  type: 'text-delta';
  text: string;
}

/** A tool call requested by the model. */
export interface ToolCallEvent extends BaseEvent {
  type: 'tool-call';
  toolName: string;
  toolCallId: string;
  input: Record<string, unknown>;
}

/** Result returned from a tool invocation. */
export interface ToolResultEvent extends BaseEvent {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  content: string;
  isError?: boolean;
}

/** Lifecycle / status update from the agent. */
export interface StatusEvent extends BaseEvent {
  type: 'status';
  status: 'starting' | 'running' | 'waiting_for_approval' | 'interrupted' | 'completed' | 'error';
  message?: string;
}

/** A file operation requested by the agent (read / write). */
export interface FileEvent extends BaseEvent {
  type: 'file';
  operation: 'read' | 'write' | 'edit' | 'delete';
  path: string;
  content?: string;
}

/** A browser action requested by the agent. */
export interface BrowserEvent extends BaseEvent {
  type: 'browser';
  action: 'navigate' | 'click' | 'type' | 'screenshot' | 'scroll';
  url?: string;
  selector?: string;
  text?: string;
  screenshot?: string; // data-url
}

/** The agent needs human approval before proceeding. */
export interface ApprovalRequestEvent extends BaseEvent {
  type: 'approval-request';
  id: string;
  toolName: string;
  toolCallId: string;
  description: string;
  required?: boolean;
}

/** An error occurred during agent execution. */
export interface ErrorEvent extends BaseEvent {
  type: 'error';
  message: string;
  code?: string;
  recoverable?: boolean;
}

/** Token usage update from the model. */
export interface UsageEvent extends BaseEvent {
  type: 'usage';
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/** The agent has finished processing. */
export interface DoneEvent extends BaseEvent {
  type: 'done';
  reason?: string;
}

/** All possible runtime events from the agent. */
export type RuntimeEvent =
  | TextDeltaEvent
  | ToolCallEvent
  | ToolResultEvent
  | StatusEvent
  | FileEvent
  | BrowserEvent
  | ApprovalRequestEvent
  | ErrorEvent
  | UsageEvent
  | DoneEvent;
