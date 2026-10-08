import { describe, it, expect } from 'vitest'
import { buildServer } from './server'

describe('/health', () => {
  it('returns 200 with { status: "ok" }', async () => {
    const server = buildServer()
    const res = await server.inject({ method: 'GET', url: '/health' })
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({ status: 'ok' })
  })
})
