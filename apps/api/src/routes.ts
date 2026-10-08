import type { FastifyPluginCallback } from 'fastify';
import { InMemoryAgentRuntime } from '@bots/agent-runtime';

// Generic database interface — works with any ORM/client.
type Db = Record<string, Record<string, (...args: unknown[]) => unknown>>;

// ---------------------------------------------------------------------------
// Seed helpers (idempotent — safe to call every startup)
// ---------------------------------------------------------------------------

const DEFAULT_BOT_ID = 'bot-default';

async function ensureSeed(db: Db) {
  const user = db.user;
  const bot = db.bot;

  // Seed user (upsert — no-op if exists)
  await user.upsert({
    where: { id: DEFAULT_BOT_ID },
    update: {},
    create: {
      id: DEFAULT_BOT_ID,
      email: 'user@localhost',
      name: 'Local User',
    },
  } as never);

  // Seed bot (upsert — no-op if exists)
  await bot.upsert({
    where: { id: DEFAULT_BOT_ID },
    update: {},
    create: {
      id: DEFAULT_BOT_ID,
      userId: DEFAULT_BOT_ID,
      name: 'Ana',
      role: 'assistant',
    },
  } as never);
}

// ---------------------------------------------------------------------------
// Routes factory — accepts any database client instance
// ---------------------------------------------------------------------------

export function createRoutes(db: Db): FastifyPluginCallback {
  const routes: FastifyPluginCallback = (server, _opts, done) => {
    const message = db.message;
    const conversation = db.conversation;

    // POST /conversations
    server.post('/conversations', async (req, reply) => {
      await ensureSeed(db);

      const { title } = req.body as { title?: string };

      const created = await conversation.create({
        data: {
          botId: DEFAULT_BOT_ID,
          title: title ?? 'New conversation',
        },
      } as never);

      return reply.code(201).send({ conversation: created });
    });

    // GET /conversations/:id
    server.get<{ Params: { id: string } }>(
      '/conversations/:id',
      async (req, reply) => {
        const { id } = req.params;

        const result = await conversation.findUnique({
          where: { id },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
            },
          },
        } as never);

        if (!result) {
          return reply.code(404).send({ error: 'Conversation not found' });
        }

        return { conversation: result, messages: (result as Record<string, unknown[]>).messages };
      },
    );

    // POST /conversations/:id/messages
    server.post<{ Params: { id: string } }>(
      '/conversations/:id/messages',
      async (req, reply) => {
        await ensureSeed(db);

        const { id: conversationId } = req.params;
        const { content } = req.body as { content: string };

        if (!content || typeof content !== 'string') {
          return reply.code(400).send({ error: 'content is required' });
        }

        // Verify conversation exists
        const existing = await conversation.findUnique({
          where: { id: conversationId },
        } as never);
        if (!existing) {
          return reply.code(404).send({ error: 'Conversation not found' });
        }

        // Persist user message
        const userMessage = await message.create({
          data: {
            conversationId,
            role: 'user',
            content,
          },
        } as never);

        // Trigger agent runtime
        const runtime = new InMemoryAgentRuntime();
        const sessionId = await runtime.createSession({ name: 'phase-1' });
        await runtime.sendMessage(sessionId, content);

        let fullText = '';
        for await (const event of runtime.streamEvents(sessionId)) {
          if (event.type === 'text-delta' && 'text' in event) {
            fullText += event.text;
          }
          if (event.type === 'done') {
            break;
          }
        }

        // Persist assistant message
        const assistantMessage = await message.create({
          data: {
            conversationId,
            role: 'assistant',
            content: fullText,
          },
        } as never);

        // Return conversation with all messages
        const updated = await conversation.findUnique({
          where: { id: conversationId },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
            },
          },
        } as never);

        return reply.code(201).send({
          conversation: updated,
          messages: (updated as Record<string, unknown[]>).messages,
          userMessage,
          assistantMessage,
        });
      },
    );

    done();
  };

  return routes;
}
