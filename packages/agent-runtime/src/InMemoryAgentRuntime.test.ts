import { describe, it, expect } from 'vitest';
import { InMemoryAgentRuntime } from './InMemoryAgentRuntime.js';

describe('InMemoryAgentRuntime', () => {
  it('streams a status, two text-deltas, and a done event after sendMessage', async () => {
    const runtime = new InMemoryAgentRuntime();
    const sessionId = await runtime.createSession();

    await runtime.sendMessage(sessionId, 'hello');

    const events = [];
    for await (const event of runtime.streamEvents(sessionId)) {
      events.push(event);
      if (event.type === 'done') break;
    }

    expect(events.map((e) => e.type)).toEqual(['status', 'text-delta', 'text-delta', 'done']);
  });

  it('throws when sending a message to an unknown session', async () => {
    const runtime = new InMemoryAgentRuntime();
    await expect(runtime.sendMessage('does-not-exist', 'hi')).rejects.toThrow('Session not found');
  });

  it('marks a session completed and stops its event stream on cancel', async () => {
    const runtime = new InMemoryAgentRuntime();
    const sessionId = await runtime.createSession();
    await runtime.cancel(sessionId);

    const events = [];
    for await (const event of runtime.streamEvents(sessionId)) {
      events.push(event);
    }

    expect(events).toEqual([]);
  });
});
