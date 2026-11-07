import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, existsSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'

const root = new URL('../../../../../', import.meta.url)
for (const [family, workspace] of [
  ['bringli', 'supplier'],
  ['buenohost', 'property'],
  ['granite', 'portfolio'],
  ['misebox', 'kitchen'],
]) {
  test(`${family} opens its registered Workspace and preserves entrance intent`, async () => {
    const page = readFileSync(
      new URL(`projects/${family}/${family}-app/app/pages/index.vue`, root),
      'utf8'
    )
    const script = page
      .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
      .replace(/^import .*\n/gm, '')
    const query = { source: 'invite', selected: 'record / +' }
    const calls = []
    await compileFunction(
      `return (async () => { ${stripTypeScriptTypes(script)} })()`,
      ['definePageMeta', 'useRoute', 'useWorkspaceEntryCta', 'navigateTo']
    )(
      () => {},
      () => ({ query, hash: '#start' }),
      () => ({ workspaceEntryPath: { value: `/workspace/${workspace}` } }),
      (...args) => calls.push(args)
    )
    assert.deepEqual(calls, [
      [
        { path: `/workspace/${workspace}`, query, hash: '#start' },
        { redirectCode: 302, replace: true },
      ],
    ])
    const config = readFileSync(
      new URL(`projects/${family}/${family}-app/nuxt.config.ts`, root),
      'utf8'
    )
    assert.match(config, /homePath: '\/home'/)
    assert.ok(
      existsSync(
        new URL(`projects/${family}/${family}-app/app/pages/home.vue`, root)
      )
    )
  })
}

test('Misebox uses native same-origin routes and guest Workspace metadata', () => {
  assert.equal(
    existsSync(
      new URL(
        'projects/misebox/misebox-app/app/middleware/00-misebox-workspace-surface.global.ts',
        root
      )
    ),
    false
  )
  const config = readFileSync(
    new URL('projects/misebox/misebox-app/nuxt.config.ts', root),
    'utf8'
  )
  assert.doesNotMatch(
    config,
    /workspace\.misebox|workspace\.localhost|pages:extend/
  )
  const page = readFileSync(
    new URL(
      'projects/misebox/misebox-app/app/pages/workspace/kitchen/index.vue',
      root
    ),
    'utf8'
  )
  assert.match(page, /workspacePage: true/)
  assert.match(page, /requiresAuth: false/)
})

test('Misebox Workspace responses are private from indexing on every host; Home stays public', () => {
  const source = readFileSync(
    new URL(
      'projects/misebox/misebox-app/server/middleware/workspace-indexing.ts',
      root
    ),
    'utf8'
  )
  const code = stripTypeScriptTypes(
    source.replace(/^import .*\n/gm, '')
  ).replace('export default ', 'return ')
  for (const host of ['localhost:3001', 'misebox.app']) {
    for (const path of [
      '/',
      '/workspace/kitchen',
      '/workspace/kitchen/team',
      '/home',
      '/kitchens',
    ]) {
      const headers = {}
      const handler = compileFunction(code, [
        'defineEventHandler',
        'getRequestURL',
        'setHeader',
      ])(
        (fn) => fn,
        () => new URL(`http://${host}${path}`),
        (_event, key, value) => {
          headers[key] = value
        }
      )
      handler({})
      assert.deepEqual(
        headers,
        path === '/' || path.startsWith('/workspace/')
          ? { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' }
          : {}
      )
    }
  }
})

test('FireUX keeps its public entrance', () => {
  const page = readFileSync(
    new URL('projects/fireux/fireux-app/app/pages/index.vue', root),
    'utf8'
  )
  assert.match(page, /<FrameworkHome/)
  assert.doesNotMatch(page, /navigateTo/)
})
