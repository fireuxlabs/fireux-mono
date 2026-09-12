import test from 'node:test'
import assert from 'node:assert/strict'
import { AsyncLocalStorage } from 'node:async_hooks'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = stripTypeScriptTypes(
  readFileSync(
    new URL('../runtime/server/api/fireux/live.post.ts', import.meta.url),
    'utf8'
  )
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace('export default', 'return')
function fixture(reads) {
  let close
  const messages = []
  const liveResponseSink = new AsyncLocalStorage()
  const handler = compileFunction(source, [
    'createError',
    'createEventStream',
    'defineEventHandler',
    'getHeader',
    'readBody',
    'liveResponseSink',
  ])(
    (value) => Object.assign(new Error(value.message), value),
    () => ({
      onClosed: (fn) => (close = fn),
      push: async (value) => messages.push(JSON.parse(value.data)),
      send: () => 'stream',
    }),
    (fn) => fn,
    () => '',
    async () => ({ reads }),
    liveResponseSink
  )
  return { handler, messages, liveResponseSink, disconnect: () => close() }
}

test('multiplex delegates only local GET reads with separate authorization and disconnect cleanup', async () => {
  const f = fixture([
    { id: 'a', url: '/api/one', headers: { authorization: 'Bearer one' } },
    { id: 'b', url: '/api/two', headers: { authorization: 'Bearer two' } },
  ])
  const requests = [],
    stopped = []
  await f.handler({
    $fetch: async (url, options) => {
      requests.push({ url, options })
      const sink = f.liveResponseSink.getStore()
      sink.onClosed(() => stopped.push(url))
      await sink.push({ data: JSON.stringify({ url }) })
    },
  })
  assert.deepEqual(
    requests.map(({ options }) => options.method),
    ['GET', 'GET']
  )
  assert.deepEqual(
    requests.map(({ options }) => options.headers.authorization),
    ['Bearer one', 'Bearer two']
  )
  assert.deepEqual(
    f.messages.map(({ id }) => id),
    ['a', 'b']
  )
  f.disconnect()
  assert.deepEqual(stopped, ['/api/one', '/api/two'])
})

test('multiplex rejects external and recursive destinations before dispatch', async () => {
  for (const url of [
    'https://example.com/api/x',
    '//example.com/api/x',
    '/private',
    '/api/fireux/live',
  ]) {
    const f = fixture([{ id: 'a', url }])
    await assert.rejects(
      f.handler({ $fetch: () => assert.fail('must not dispatch') }),
      { statusCode: 400 }
    )
  }
})

test('multiplex preserves each order capability and ignores untrusted headers', async () => {
  const capabilities = ['a'.repeat(43), 'b'.repeat(43)]
  const f = fixture(
    capabilities.map((capability, index) => ({
      id: String(index),
      url: '/api/menus/menu/orders/order',
      headers: {
        authorization: 'Bearer customer',
        'x-fireux-order-capability': capability,
        cookie: 'untrusted=1',
        host: 'attacker.example',
        'x-untrusted-header': 'ignored',
      },
    }))
  )
  const requests = []
  await f.handler({
    $fetch: async (url, options) => {
      requests.push({ url, options })
      const sink = f.liveResponseSink.getStore()
      sink.onClosed(() => {})
      await sink.push({ data: '{}' })
    },
  })
  assert.deepEqual(
    requests.map(({ options }) => options.headers),
    capabilities.map((capability) => ({
      accept: 'text/event-stream',
      authorization: 'Bearer customer',
      'x-fireux-order-capability': capability,
      cookie: '',
    }))
  )
  f.disconnect()
})
