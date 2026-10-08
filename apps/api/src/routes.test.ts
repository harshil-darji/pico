import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createRoutes } from './routes.js'
import { PrismaClient as TestPrismaClient } from './test-db.js'
import fastify from 'fastify'

const testDb = new TestPrismaClient()

// Clean up test data before each test suite
beforeAll(async () => {
  await testDb.message.deleteMany()
  await testDb.conversation.deleteMany()
  await testDb.bot.deleteMany()
  await testDb.user.deleteMany()
})

afterAll(async () => {
  // Keep DB for debugging if tests fail
})

describe('/conversations', () => {
  it('creates a conversation with a title', async () => {
    const server = fastify()
    server.register(createRoutes(testDb))

    const res = await server.inject({
      method: 'POST',
      url: '/conversations',
      payload: { title: 'Test chat' },
    })
    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.body)
    expect(body.conversation).toBeDefined()
    expect(body.conversation.title).toBe('Test chat')
    expect(body.conversation.botId).toBe('bot-default')
    expect(body.conversation.id).toBeDefined()
  })

  it('creates a conversation with a default title when none is provided', async () => {
    const server = fastify()
    server.register(createRoutes(testDb))

    const res = await server.inject({
      method: 'POST',
      url: '/conversations',
      payload: {},
    })
    expect(res.statusCode).toBe(201)
    expect(JSON.parse(res.body).conversation.title).toBe('New conversation')
  })

  it('returns conversation with empty messages list', async () => {
    const server = fastify()
    server.register(createRoutes(testDb))

    const createRes = await server.inject({
      method: 'POST',
      url: '/conversations',
      payload: { title: 'Empty' },
    })
    const { conversation } = JSON.parse(createRes.body)

    const getRes = await server.inject({
      method: 'GET',
      url: `/conversations/${conversation.id}`,
    })
    expect(getRes.statusCode).toBe(200)
    const body = JSON.parse(getRes.body)
    expect(body.messages).toBeDefined()
    expect(body.messages.length).toBe(0)
  })

  it('returns 404 for non-existent conversation', async () => {
    const server = fastify()
    server.register(createRoutes(testDb))

    const res = await server.inject({
      method: 'GET',
      url: '/conversations/nonexistent-id',
    })
    expect(res.statusCode).toBe(404)
    expect(JSON.parse(res.body).error).toBe('Conversation not found')
  })
})

describe('/conversations/:id/messages', () => {
  it('posts a user message and gets an assistant reply', async () => {
    const server = fastify()
    server.register(createRoutes(testDb))

    // Create a conversation first
    const createRes = await server.inject({
      method: 'POST',
      url: '/conversations',
      payload: { title: 'Message test' },
    })
    const { conversation } = JSON.parse(createRes.body)

    // Post a message
    const msgRes = await server.inject({
      method: 'POST',
      url: `/conversations/${conversation.id}/messages`,
      payload: { content: 'Hello!' },
    })
    expect(msgRes.statusCode).toBe(201)
    const body = JSON.parse(msgRes.body)
    expect(body.messages.length).toBe(2)

    const userMsg = body.messages.find((m: { role: string }) => m.role === 'user')
    const assistantMsg = body.messages.find((m: { role: string }) => m.role === 'assistant')
    expect(userMsg.content).toBe('Hello!')
    expect(assistantMsg.content).toContain('simulated response')
    expect(body.userMessage.role).toBe('user')
    expect(body.assistantMessage.role).toBe('assistant')
  })

  it('returns 400 when content is missing', async () => {
    const server = fastify()
    server.register(createRoutes(testDb))

    const res = await server.inject({
      method: 'POST',
      url: '/conversations/bot-default/messages',
      payload: {},
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 404 when conversation does not exist', async () => {
    const server = fastify()
    server.register(createRoutes(testDb))

    const res = await server.inject({
      method: 'POST',
      url: '/conversations/nonexistent/messages',
      payload: { content: 'Hello' },
    })
    expect(res.statusCode).toBe(404)
  })
})
