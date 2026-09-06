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
  .replace('import.meta.dev', 'false')
const response = {
  appId: 'misebox-app',
  contextId: 'product',
  schemaVersion: 1,
  visibility: 'public',
  sourcePath: '/api/fireux/context/product',
  revision: 'a'.repeat(64),
  context: {
    title: 'Misebox',
    summary: 'Background',
    source: 'Review',
    reviewStatus: 'reviewed',
    private: 'omit',
  },
  private: 'omit',
}
function harness(denied = false, failure = null) {
  let request
  const run = compileFunction(
    `${stripTypeScriptTypes(source)};return readProjectAppContext`,
    ['createError', 'requireProjectOperator', '$fetch']
  )(
    (e) => Object.assign(new Error(e.statusMessage), e),
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
  return { run, request: () => request }
}
test('Project authority is checked before the public API request', async () => {
  const h = harness(true)
  await assert.rejects(h.run({}, 'misebox'))
  assert.equal(h.request(), undefined)
})
test('public request sends no credentials and bounds the response', async () => {
  const h = harness()
  const result = await h.run({}, 'misebox')
  assert.equal(
    h.request().url,
    'https://misebox.app/api/fireux/context/product'
  )
  assert.equal(h.request().options.query, undefined)
  assert.equal(h.request().options.headers, undefined)
  assert.equal(h.request().options.redirect, 'error')
  assert.equal(h.request().options.retry, 0)
  assert.equal(result.private, undefined)
  assert.equal(result.context.private, undefined)
})

test('upstream errors are sanitized', async () => {
  const h = harness(false, {
    statusCode: 403,
    data: { statusMessage: 'private details' },
  })
  await assert.rejects(
    h.run({}, 'misebox'),
    (e) =>
      e.statusCode === 502 &&
      e.message === 'Misebox public context service is unavailable.'
  )
})

test('reader rejects draft or unversioned context', () => {
  const project = compileFunction(
    `${stripTypeScriptTypes(source)};return projectSharedContext`,
    ['createError']
  )((e) => Object.assign(new Error(e.statusMessage), e))
  assert.throws(
    () =>
      project({
        ...response,
        context: { ...response.context, reviewStatus: 'draft' },
      }),
    { statusCode: 502 }
  )
  assert.throws(() => project({ ...response, schemaVersion: undefined }), {
    statusCode: 502,
  })
})

test('published identity is bounded and rejects unsafe URLs', () => {
  const project = compileFunction(
    `${stripTypeScriptTypes(source)};return projectSharedContext`,
    ['createError']
  )((e) => Object.assign(new Error(e.statusMessage), e))
  const identity = {
    name: 'Misebox',
    description: 'Published',
    imageUrl: 'https://misebox.app/img/app/logo.png',
    url: 'https://misebox.app',
    private: 'omit',
  }
  assert.deepEqual(project({ ...response, identity }).identity, {
    name: identity.name,
    description: identity.description,
    imageUrl: identity.imageUrl,
    url: identity.url,
  })
  for (const imageUrl of [
    'javascript:alert(1)',
    'http://example.com/image.png',
    'https://user:password@example.com/image.png',
  ]) {
    assert.throws(
      () => project({ ...response, identity: { ...identity, imageUrl } }),
      { statusCode: 502 }
    )
  }
})
