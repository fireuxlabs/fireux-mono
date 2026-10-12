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
  return stripTypeScriptTypes(source.replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')).replace(
    'export default ',
    'return '
  )
}

function route(hostname, path, query = {}, hash = '', meta = {}) {
  const handler = compileFunction(body(routeSource), [
    'defineNuxtRouteMiddleware',
    'navigateTo',
    'useRequestURL',
    'useRuntimeConfig',
    'createError',
  ])(
    (fn) => fn,
    (to, options) => ({ to, options }),
    () => new URL(`http://${hostname}:3001/`),
    () => ({ public: { fireux: { workspaceConfig: { kitchen: {
      origin: `http://${hostname === localHost ? localHost : 'workspace.misebox.app'}:3001`,
    } } } } }),
    (details) => Object.assign(new Error(details.statusMessage), details)
  )
  const search = new URLSearchParams(query).toString()
  return handler({
    path,
    meta,
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
  test(`${host} renders the root in the Workspace shell without redirecting`, () => {
    const meta = {}
    assert.equal(route(host, '/', { source: 'invite' }, '#start', meta), undefined)
    assert.deepEqual(meta, {
      layout: 'workspace', workspace: 'kitchen', workspaceSurface: 'browse',
    })
    for (const path of ['/workspace', '/workspace/', '/workspace/kitchen', '/workspace/kitchen/']) {
      assert.throws(() => route(host, path), (error) => error.statusCode === 404)
    }
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
for (const host of [
  `${app}.app`, `www.${app}.app`,
  'misebox-78f9c.web.app', 'misebox-78f9c.firebaseapp.com',
]) {
  test(`${host} sends only Workspace routes to the Workspace origin`, () => {
    for (const path of [`/workspace/${family}/menus/menu-name`]) {
      assert.deepEqual(route(host, path, { source: 'invite' }, '#member'), {
        to: `https://workspace.misebox.app${path}?source=invite#member`,
        options: { external: true, redirectCode: 302, replace: true },
      })
    }
    for (const path of ['/', '/ingredients', '/pricing', '/workspace-guide', '/auth']) {
      assert.equal(route(host, path, { redirect: '/workspace/kitchen' }), undefined)
    }
  })
}
for (const host of ['localhost', '127.0.0.1', '[::1]']) {
  test(`${host} preserves the local port, destination, query and fragment`, () => {
    for (const path of [`/workspace/${family}/team`]) {
      assert.deepEqual(route(host, path, { source: 'invite' }, '#member'), {
        to: `http://workspace.localhost:3001${path}?source=invite#member`,
        options: { external: true, redirectCode: 302, replace: true },
      })
      assert.deepEqual(headers(host, path), {
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'no-store',
      })
    }
    assert.equal(route(host, '/'), undefined)
    assert.equal(route(host, '/workspace-guide'), undefined)
    assert.equal(route(host, '/auth', { redirect: '/workspace/kitchen' }), undefined)
  })
}
test('unconfigured tenant and service origins remain unchanged', () => {
  for (const host of ['baeren-ringgenberg.ch', 'jobs.localhost', 'suppliers.localhost']) {
    assert.equal(route(host, '/workspace/kitchen/team'), undefined)
  }
})
test('lookalike hosts cannot trigger a redirect or Workspace-host indexing policy', () => {
  const host = `workspace.${app}.app.example.org`
  assert.equal(route(host, '/'), undefined)
  assert.equal(route(host, '/workspace/kitchen/team'), undefined)
  assert.deepEqual(headers(host, '/'), {})
})

test('public root uses discovery metadata and never carries Kitchen Workspace scope', () => {
  const meta = { workspace: 'kitchen', workspaceSurface: 'browse', layout: 'workspace' }
  assert.equal(route('localhost', '/', {}, '', meta), undefined)
  assert.deepEqual(meta, { workspace: undefined, workspaceSurface: undefined, layout: 'landing' })
})

test('Misebox route registration removes both retired homes while retaining capabilities', () => {
  const source = readFileSync(new URL('../../nuxt.config.ts', import.meta.url), 'utf8')
  const hook = source.match(/'pages:extend'\(pages: NuxtPage\[\]\) \{([\s\S]*?)\n    \}/)?.[1]
  assert.ok(hook)
  const pages = ['/','/workspace','/workspace/kitchen','/workspace/kitchen/menus','/workspace/kitchen/team']
    .map((path) => ({ path }))
  compileFunction(hook, ['pages'])(pages)
  assert.deepEqual(pages.map((page) => page.path), ['/','/workspace/kitchen/menus','/workspace/kitchen/team'])
})
