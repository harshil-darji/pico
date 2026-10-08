export type SessionId = string;

export interface AgentSession {
  sessionId: SessionId;
  createdAt: Date;
  status: 'idle' | 'running' | 'paused' | 'interrupted' | 'completed' | 'error';
}

interface BaseEvent {
  _timestamp: number;
  _sessionId: SessionId;
}

export interface TextDeltaEvent extends BaseEvent {
  type: 'text-delta';
  text: string;
}

export interface ToolCallEvent extends BaseEvent {
  type: 'tool-call';
  toolName: string;
  toolCallId: string;
  input: Record<string, unknown>;
}

export interface ToolResultEvent extends BaseEvent {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  content: string;
  isError?: boolean;
}

export interface StatusEvent extends BaseEvent {
  type: 'status';
  status: 'starting' | 'running' | 'waiting_for_approval' | 'interrupted' | 'completed' | 'error';
  message?: string;
}

export interface FileEvent extends BaseEvent {
  type: 'file';
  operation: 'read' | 'write' | 'edit' | 'delete';
  path: string;
  content?: string;
}

export interface BrowserEvent extends BaseEvent {
  type: 'browser';
  action: 'navigate' | 'click' | 'type' | 'screenshot' | 'scroll';
  url?: string;
  selector?: string;
  text?: string;
  screenshot?: string;
}

export interface ApprovalRequestEvent extends BaseEvent {
  type: 'approval-request';
  id: string;
  toolName: string;
  toolCallId: string;
  description: string;
  required?: boolean;
}

export interface ErrorEvent extends BaseEvent {
  type: 'error';
  message: string;
  code?: string;
  recoverable?: boolean;
}

export interface UsageEvent extends BaseEvent {
  type: 'usage';
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface DoneEvent extends BaseEvent {
  type: 'done';
  reason?: string;
}

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
