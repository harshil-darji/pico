import fastify from 'fastify'

export function buildServer() {
  const server = fastify({ logger: true })

  server.get('/health', async () => ({ status: 'ok' }))

  return server
}
