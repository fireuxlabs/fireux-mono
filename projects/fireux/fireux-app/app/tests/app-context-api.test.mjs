import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const source = readFileSync(
  new URL('../../server/project/index/app-context.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  .replace(/^export /gm, '')
const response = {
  appId: 'misebox-app',
  contextId: 'product',
  sourcePath: 'apps/misebox-app/context/product',
  revision: 'a'.repeat(64),
  context: {
    title: 'Misebox',
    summary: 'Background',
    source: 'Review',
    reviewStatus: 'draft',
    private: 'omit',
  },
  private: 'omit',
}
function harness(denied = false, failure = null) {
  let request,
    identity = 0
  const run = compileFunction(
    `${stripTypeScriptTypes(source)};return readProjectAppContext`,
    ['createError', 'GoogleAuth', 'requireProjectOperator', '$fetch']
  )(
    (e) => Object.assign(new Error(e.statusMessage), e),
    class {
      async getIdTokenClient() {
        identity++
        return { idTokenProvider: { fetchIdToken: async () => 'secret' } }
      }
    },
    async () => {
      if (denied) throw Error('Denied')
      return { projectId: 'misebox' }
    },
    async (url, options) => {
      request = { url, options }
      if (failure) throw failure
      return response
    }
  )
  return { run, request: () => request, identity: () => identity }
}
test('Project authority is checked before obtaining a service token', async () => {
  const h = harness(true)
  await assert.rejects(h.run({}, 'misebox'))
  assert.equal(h.identity(), 0)
  assert.equal(h.request(), undefined)
})
test('request uses one fixed endpoint, carries selected Project and bounds the response', async () => {
  const h = harness()
  const result = await h.run({}, 'misebox')
  assert.equal(
    h.request().url,
    'https://misebox.app/api/fireux/context/product'
  )
  assert.deepEqual(h.request().options.query, { projectId: 'misebox' })
  assert.equal(h.request().options.redirect, 'error')
  assert.equal(h.request().options.retry, 0)
  assert.equal(result.private, undefined)
  assert.equal(result.context.private, undefined)
})

test('service rejection is not reported as a missing sharing grant', async () => {
  const h = harness(false, {
    statusCode: 403,
    data: { statusMessage: 'This service cannot read Misebox context.' },
  })
  await assert.rejects(
    h.run({}, 'misebox'),
    (error) =>
      error.statusCode === 503 &&
      error.message ===
        'This environment is not authorized to use the Misebox context service.'
  )
})
test('unknown remote errors do not leak arbitrary server text', async () => {
  const h = harness(false, {
    statusCode: 403,
    data: { statusMessage: 'private internal details' },
  })
  await assert.rejects(
    h.run({}, 'misebox'),
    (error) =>
      error.statusCode === 403 &&
      error.message === 'Misebox denied access to this context.'
  )
})
