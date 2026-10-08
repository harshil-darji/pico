import { buildServer } from './server.js'

const server = buildServer()

const PORT = Number(process.env.PORT) || 3000

await server.listen({ port: PORT, host: '0.0.0.0' })
