import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const app = 'misebox'
const family = 'kitchen'
const localHost = 'workspace.localhost'
const routeSource = readFileSync(
  new URL(
    `../middleware/00-${app}-workspace-surface.global.ts`,
    import.meta.url
  ),
  'utf8'
)
const serverSource = readFileSync(
  new URL('../../server/middleware/workspace-indexing.ts', import.meta.url),
  'utf8'
)
function body(source) {
  return stripTypeScriptTypes(source.replace(/^import .*?\n/gm, '')).replace(
    'export default ',
    'return '
  )
}

function route(hostname, path, query = {}, hash = '') {
  const handler = compileFunction(body(routeSource), [
    'defineNuxtRouteMiddleware',
    'navigateTo',
    'useRequestURL',
  ])(
    (fn) => fn,
    (to, options) => ({ to, options }),
    () => ({ hostname })
  )
  const search = new URLSearchParams(query).toString()
  return handler({
    path,
    query,
    hash,
    fullPath: path + (search ? `?${search}` : '') + hash,
  })
}
function headers(hostname, path) {
  const result = {}
  const handler = compileFunction(body(serverSource), [
    'defineEventHandler',
    'getRequestURL',
    'setHeader',
  ])(
    (fn) => fn,
    () => new URL(`http://${hostname}${path}`),
    (_event, key, value) => {
      result[key] = value
    }
  )
  handler({})
  return result
}

for (const host of [`workspace.${app}.app`, localHost]) {
  test(`${host} root preserves query and fragment`, () => {
    assert.deepEqual(
      route(host, '/', { source: 'invite', next: '/team' }, '#start'),
      {
        to: {
          path: `/workspace/${family}`,
          query: { source: 'invite', next: '/team' },
          hash: '#start',
        },
        options: { redirectCode: 302, replace: true },
      }
    )
  })
  test(`${host} keeps capability routes on the same host`, () => {
    assert.equal(route(host, `/workspace/${family}/team`), undefined)
  })
  test(`${host} responses are excluded from indexing`, () => {
    assert.deepEqual(headers(host, '/'), {
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
    })
  })
}
for (const host of [`${app}.app`, `www.${app}.app`]) {
  test(`${host} never redirects visitors to another domain`, () => {
    for (const path of ['/', '/ingredients', '/workspace', `/workspace/${family}/team`, '/workspace-guide']) {
      assert.equal(route(host, path, { source: 'invite' }, '#member'), undefined)
    }
  })
}
test('localhost stays same-origin and Workspace paths are noindex', () => {
  for (const path of [
    '/workspace',
    `/workspace/${family}`,
    `/workspace/${family}/team`,
  ]) {
    assert.equal(route('localhost', path), undefined)
    assert.deepEqual(headers('localhost', path), {
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
    })
  }
  assert.deepEqual(headers('localhost', '/'), {})
  assert.deepEqual(headers('localhost', '/workspace-guide'), {})
})
test('lookalike hosts cannot trigger a redirect or Workspace-host indexing policy', () => {
  const host = `workspace.${app}.app.example.org`
  assert.equal(route(host, '/'), undefined)
  assert.deepEqual(headers(host, '/'), {})
})
