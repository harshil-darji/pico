import {
  RuntimeEvent,
  SessionId,
  AgentSession,
} from './types.js';
import { AgentRuntime, CreateSessionOptions } from './AgentRuntime.js';

class AsyncQueue<T> {
  private items: T[] = [];
  private resolvers: Array<(v: T) => void> = [];
  private closed = false;

  push(item: T) {
    if (this.closed) return;
    const resolve = this.resolvers.shift();
    if (resolve) {
      resolve(item);
    } else {
      this.items.push(item);
    }
  }

  pushMany(items: T[]) {
    for (const item of items) this.push(item);
  }

  async pop(): Promise<T> {
    if (this.items.length > 0) return this.items.shift()!;
    if (this.closed) throw new Error('Queue closed');
    return new Promise<T>((resolve) => this.resolvers.push(resolve));
  }

  close() {
    this.closed = true;
    for (const r of this.resolvers) {
      r(null as unknown as T);
    }
    this.resolvers.length = 0;
  }
}

export class InMemoryAgentRuntime implements AgentRuntime {
  private sessions = new Map<SessionId, { session: AgentSession; queue: AsyncQueue<RuntimeEvent> }>();

  async createSession(_opts?: CreateSessionOptions): Promise<SessionId> {
    const sessionId: SessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date();

    this.sessions.set(sessionId, {
      session: { sessionId, createdAt: now, status: 'idle' },
      queue: new AsyncQueue<RuntimeEvent>(),
    });

    return sessionId;
  }

  async sendMessage(sessionId: SessionId, _text: string): Promise<void> {
    const entry = this.sessions.get(sessionId);
    if (!entry) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    entry.session.status = 'running';

    const base = { _sessionId: sessionId, _timestamp: Date.now() } as const;

    entry.queue.pushMany([
      { type: 'status', ...base, status: 'running', message: 'Processing your message' },
      { type: 'text-delta', ...base, text: 'Here is a simulated response to your message: ' },
      { type: 'text-delta', ...base, text: 'This is a stub — no real model was called yet.' },
      { type: 'done', ...base, reason: 'simulated-completion' },
    ]);
  }

  async *streamEvents(sessionId: SessionId): AsyncIterable<RuntimeEvent> {
    const entry = this.sessions.get(sessionId);
    if (!entry) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    while (true) {
      try {
        const evt = await entry.queue.pop();
        yield evt;
      } catch {
        break;
      }
    }
  }

  async interrupt(_sessionId: SessionId): Promise<void> {
    const entry = this.sessions.get(_sessionId);
    if (entry) entry.session.status = 'interrupted';
  }

  async pause(_sessionId: SessionId): Promise<void> {
    const entry = this.sessions.get(_sessionId);
    if (entry) entry.session.status = 'paused';
  }

  async resume(_sessionId: SessionId): Promise<void> {
    const entry = this.sessions.get(_sessionId);
    if (entry) entry.session.status = 'running';
  }

  async cancel(sessionId: SessionId): Promise<void> {
    const entry = this.sessions.get(sessionId);
    if (entry) {
      entry.session.status = 'completed';
      entry.queue.close();
    }
  }

  async compactContext(_sessionId: SessionId): Promise<void> {}

  async listTools(): Promise<string[]> {
    return ['echo'];
  }

  async getUsage(_sessionId: SessionId): Promise<{ inputTokens: number; outputTokens: number }> {
    return { inputTokens: 0, outputTokens: 0 };
  }

  async recoverSession(_sessionId: SessionId): Promise<void> {}

  async destroySession(sessionId: SessionId): Promise<void> {
    const entry = this.sessions.get(sessionId);
    if (entry) entry.queue.close();
    this.sessions.delete(sessionId);
  }
}
