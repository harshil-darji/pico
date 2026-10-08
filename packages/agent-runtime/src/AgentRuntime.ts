import { RuntimeEvent, SessionId } from './types.js';

export interface CreateSessionOptions {
  name?: string;
  systemPrompt?: string;
  context?: Record<string, unknown>;
}

export interface SessionInfo {
  sessionId: SessionId;
  createdAt: Date;
}

export interface AgentRuntime {
  createSession(opts?: CreateSessionOptions): Promise<SessionId>;

  sendMessage(sessionId: SessionId, text: string): Promise<void>;

  streamEvents(sessionId: SessionId): AsyncIterable<RuntimeEvent>;

  interrupt(sessionId: SessionId): Promise<void>;

  pause(sessionId: SessionId): Promise<void>;

  resume(sessionId: SessionId): Promise<void>;

  cancel(sessionId: SessionId): Promise<void>;

  compactContext(sessionId: SessionId): Promise<void>;

  listTools(): Promise<string[]>;

  getUsage(sessionId: SessionId): Promise<{ inputTokens: number; outputTokens: number }>;

  recoverSession(sessionId: SessionId): Promise<void>;

  destroySession(sessionId: SessionId): Promise<void>;
}
