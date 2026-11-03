import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const require = createRequire(
  new URL('../../projects/misebox/misebox-app/package.json', import.meta.url)
)
const { getRequestURL, getQuery } = require('h3')
const read = (path) =>
  readFileSync(new URL('../../' + path, import.meta.url), 'utf8')
const body = (source) =>
  stripTypeScriptTypes(
    source.replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  ).replace('export default ', 'return ')
const event = (host) => ({
  node: {
    req: {
      headers: {
        host: 'internal-function.a.run.app',
        'x-forwarded-host': host,
        'x-forwarded-proto': 'https',
      },
    },
  },
  path: '/',
})
test('FireUX Workspace routing and cache policy use the Firebase public host', () => {
  const request = event('workspace.fireux.app')
  const middleware = compileFunction(
    body(
      read(
        'projects/fireux/fireux-app/app/middleware/00-fireux-workspace-surface.global.ts'
      )
    ),
    ['defineNuxtRouteMiddleware', 'navigateTo', 'useRequestURL']
  )(
    (fn) => fn,
    (to, options) => ({ to, options }),
    (options) => getRequestURL(request, options)
  )
  assert.equal(
    middleware({ path: '/', fullPath: '/', query: {}, hash: '' }).to.path,
    '/workspace/project'
  )
  const headers = {}
  const handler = compileFunction(
    body(
      read('projects/fireux/fireux-app/server/middleware/workspace-indexing.ts')
    ),
    ['defineEventHandler', 'getRequestURL', 'setHeader']
  )(
    (fn) => fn,
    getRequestURL,
    (_event, key, value) => {
      headers[key] = value
    }
  )
  handler(request)
  assert.equal(headers['Cache-Control'], 'no-store')
  assert.equal(headers['X-Robots-Tag'], 'noindex, nofollow')
  assert.equal(
    middleware({
      path: '/workspace/project',
      fullPath: '/workspace/project',
      query: {},
      hash: '',
    }),
    undefined
  )
})
test('Core PWA manifest recognises the Workspace installation behind Firebase', () => {
  const handler = compileFunction(
    body(
      read(
        'packages/core/fireux-core/src/runtime/server/manifest.webmanifest.get.ts'
      )
    ),
    [
      'defineEventHandler',
      'getQuery',
      'getRequestURL',
      'setHeader',
      'useRuntimeConfig',
      'brandAssets',
      'withBuildVersion',
    ]
  )(
    (fn) => fn,
    getQuery,
    getRequestURL,
    () => {},
    () => ({
      public: {
        fireux: {
          name: 'Misebox',
          workspaces: ['kitchen'],
          workspaceConfig: {
            kitchen: { origin: 'https://workspace.misebox.app' },
          },
        },
      },
    }),
    { pwaIcon192: '/192.png', pwaIcon512: '/512.png' },
    (value) => value
  )
  const request = event('workspace.misebox.app')
  request.path = '/manifest.webmanifest?surface=workspace&start_url=%2F'
  const manifest = handler(request)
  assert.equal(manifest.name, 'Misebox Workspace')
  assert.equal(manifest.start_url, '/')
  const foreign = event('other.example')
  foreign.path = request.path
  assert.equal(handler(foreign).name, 'Misebox')
})
test('App-only hostname presentation uses native forwarded-origin options', () => {
  for (const path of [
    'projects/misebox/misebox-app/app/middleware/misebox-suppliers-surface.global.ts',
    'projects/misebox/misebox-app/app/middleware/misebox-jobs-surface.global.ts',
    'projects/sharer/sharer-app/app/pages/index.vue',
  ]) {
    assert.match(
      read(path),
      /useRequestURL\(\{ xForwardedHost: true, xForwardedProto: true \}\)/,
      path
    )
  }
})
