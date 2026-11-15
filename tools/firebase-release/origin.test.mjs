import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { fileURLToPath } from 'node:url'
const require = createRequire(
  new URL('../../packages/core/fireux-core/package.json', import.meta.url)
)
const { getRequestURL, getQuery } = require('h3')
const { createJiti } = require('jiti')
const { resolveAppTheme } = await createJiti(import.meta.url).import(
  fileURLToPath(
    new URL(
      '../../packages/core/fireux-core/src/runtime/app/utils/app-theme.ts',
      import.meta.url
    )
  )
)
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
  let workspaceConfig = {
    kitchen: { origin: 'https://workspace.misebox.app' },
  }
  let theme = {
    palette: {
      canvas: '#123456',
      surface: '#ffffff',
      canvas_inverted: '#000000',
      text: '#111111',
      text_muted: '#555555',
      ink: '#222222',
      accent: '#abcdef',
      accent_contrast: '#000000',
    },
  }
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
      'useAppConfig',
      'resolveAppTheme',
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
          workspaceConfig,
        },
      },
    }),
    () => ({ theme }),
    resolveAppTheme,
    { pwaIcon192: '/192.png', pwaIcon512: '/512.png' },
    (value) => value
  )
  const request = event('workspace.misebox.app')
  request.path = '/manifest.webmanifest?surface=workspace&start_url=%2F'
  const manifest = handler(request)
  assert.equal(manifest.name, 'Misebox Workspace')
  assert.equal(manifest.start_url, '/')
  assert.equal(manifest.theme_color, theme.palette.accent)
  assert.equal(manifest.background_color, theme.palette.canvas)
  const foreign = event('other.example')
  foreign.path = request.path
  assert.equal(handler(foreign).name, 'Misebox')

  // Current Misebox uses the ordinary same-host Workspace entrance.
  workspaceConfig = {}
  const sameHost = event('misebox.app')
  sameHost.path =
    '/manifest.webmanifest?surface=workspace&start_url=%2Fworkspace%2Fkitchen'
  assert.equal(handler(sameHost).name, 'Misebox Workspace')
  assert.equal(handler(sameHost).start_url, '/workspace/kitchen')
  for (const startUrl of ['/workspace/kitchen/team', '//other.example']) {
    sameHost.path = `/manifest.webmanifest?surface=workspace&start_url=${encodeURIComponent(startUrl)}`
    assert.equal(handler(sameHost).name, 'Misebox')
    assert.equal(handler(sameHost).start_url, '/')
  }
  theme = undefined
  assert.equal(handler(sameHost).theme_color, '#0f172a')
  assert.equal(handler(sameHost).background_color, '#ffffff')
  theme = { palette: { accent: 'invalid' } }
  assert.throws(() => handler(sameHost), /exactly eight 6-digit/)
})
test('App-only hostname presentation uses native forwarded-origin options', () => {
  for (const path of [
    'projects/misebox/misebox-app/app/middleware/misebox-suppliers-surface.global.ts',
    'projects/misebox/misebox-app/app/middleware/misebox-jobs-surface.global.ts',
  ]) {
    assert.match(
      read(path),
      /useRequestURL\(\{ xForwardedHost: true, xForwardedProto: true \}\)/,
      path
    )
  }
})
