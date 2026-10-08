import fastify from 'fastify'
import { PrismaClient } from '@bots/database'
import { createRoutes } from './routes.js'

const prisma = new PrismaClient()

export function buildServer() {
  const server = fastify({ logger: true })

  server.get('/health', async () => ({ status: 'ok' }))
  server.register(createRoutes(prisma as never))

  return server
}
