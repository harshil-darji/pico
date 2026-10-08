import { RuntimeEvent, SessionId } from './types.js';

export interface CreateSessionOptions {
  /** Human-readable name / description for this session */
  name?: string;
  /** System prompt to guide the agent */
  systemPrompt?: string;
  /** Initial context / memory passed to the agent */
  context?: Record<string, unknown>;
}

export interface SessionInfo {
  sessionId: SessionId;
  createdAt: Date;
}

/** Core interface for an Agent runtime. */
export interface AgentRuntime {
  /** Create a new agent session and return its ID. */
  createSession(opts?: CreateSessionOptions): Promise<SessionId>;

  /** Send a user message to an existing session. */
  sendMessage(sessionId: SessionId, text: string): Promise<void>;

  /** Get an async iterable of events from a session. */
  streamEvents(sessionId: SessionId): AsyncIterable<RuntimeEvent>;

  /** Interrupt (pause-with-discard) the current session. */
  interrupt(sessionId: SessionId): Promise<void>;

  /** Pause a running session (can be resumed). */
  pause(sessionId: SessionId): Promise<void>;

  /** Resume a paused session. */
  resume(sessionId: SessionId): Promise<void>;

  /** Cancel (permanently stop) a session. */
  cancel(sessionId: SessionId): Promise<void>;

  /** Compact / reduce the session context window. */
  compactContext(sessionId: SessionId): Promise<void>;

  /** List available tools registered with the runtime. */
  listTools(): Promise<string[]>;

  /** Get token usage stats for a session. */
  getUsage(sessionId: SessionId): Promise<{ inputTokens: number; outputTokens: number }>;

  /** Recover a session from a previous state (if possible). */
  recoverSession(sessionId: SessionId): Promise<void>;

  /** Permanently destroy a session and free resources. */
  destroySession(sessionId: SessionId): Promise<void>;
}
