import test from 'node:test'
import assert from 'node:assert/strict'
import { createApp, defineEventHandler, toWebHandler } from 'h3'
import middleware from '../../server/middleware/live-read-cors.ts'

const app = createApp()
app.use(middleware)
app.use(defineEventHandler(() => ({ reached: true })))
const handle = toWebHandler(app)
const endpoint = 'https://backend.example/api/fireux/live'

test('customer and workspace origins can preflight and read without cookies', async () => {
  for (const origin of ['https://misebox.app', 'https://workspace.misebox.app']) {
    const preflight = await handle(new Request(endpoint, {
      method: 'OPTIONS',
      headers: { origin, 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type' },
    }))
    assert.equal(preflight.status, 204)
    assert.equal(preflight.headers.get('access-control-allow-origin'), origin)
    assert.equal(preflight.headers.get('access-control-allow-credentials'), null)
    const response = await handle(new Request(endpoint, { method: 'POST', headers: { origin } }))
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('access-control-allow-origin'), origin)
  }
})

test('unrecognised sites cannot use the cross-origin stream', async () => {
  const response = await handle(new Request(endpoint, {
    method: 'POST', headers: { origin: 'https://misebox.app.attacker.example' },
  }))
  assert.equal(response.status, 403)
  assert.equal(response.headers.get('access-control-allow-origin'), null)
})

test('same-origin development and other API routes retain their existing behaviour', async () => {
  const response = await handle(new Request('http://localhost:3001/api/fireux/live', {
    method: 'POST', headers: { origin: 'http://localhost:3001', host: 'localhost:3001' },
  }))
  assert.equal(response.status, 200)
  const other = await handle(new Request('https://backend.example/api/kitchens', {
    headers: { origin: 'https://elsewhere.example' },
  }))
  assert.equal(other.status, 200)
  assert.equal(other.headers.get('access-control-allow-origin'), null)
})
