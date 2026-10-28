import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = readFileSync(
  new URL('../config/module/pages-config.ts', import.meta.url),
  'utf8'
)
  .replace(/^import .*\n/gm, '')
  .replace(/^export /gm, '')
const configure = compileFunction(
  `${stripTypeScriptTypes(source)}; return configurePageTransitions`
)()

test('Workspace transitions are disabled recursively without changing other route metadata', () => {
  const hooks = []
  const options = { experimental: { extraPageMetaExtractionKeys: ['nav'] } }
  configure({
    options,
    hook: (name, callback) => hooks.push({ name, callback }),
  })
  assert.deepEqual(options.experimental.extraPageMetaExtractionKeys, [
    'nav',
    'layout',
  ])
  assert.equal(hooks.length, 1)
  assert.equal(hooks[0].name, 'pages:resolved')
  const pages = [
    {
      path: '/workspace/project',
      meta: { layout: false, workspacePage: true, pageTransition: true },
    },
    {
      path: '/',
      children: [
        {
          path: 'identity',
          file: '/runtime/pages/workspace/identity.vue',
          meta: { auth: true },
        },
      ],
    },
    { path: '/product', meta: { pageTransition: { name: 'product' } } },
  ]
  hooks[0].callback(pages)
  assert.deepEqual(pages[0].meta, {
    layout: false,
    workspacePage: true,
    pageTransition: false,
  })
  assert.deepEqual(pages[1].children[0].meta, {
    auth: true,
    pageTransition: false,
  })
  assert.deepEqual(pages[2].meta, { pageTransition: { name: 'product' } })
})

test('Dashboard layout policy follows nested routes and respects layout overrides', () => {
  let apply
  configure({
    options: { experimental: { extraPageMetaExtractionKeys: [] } },
    hook: (_name, callback) => {
      apply = callback
    },
  })
  const pages = [
    {
      path: '/account',
      meta: { layout: 'dashboard', requiresAuth: true, pageTransition: true },
      children: [
        { path: 'profile', meta: { title: 'Profile' } },
        {
          path: 'public',
          meta: { layout: 'default', pageTransition: { name: 'public' } },
        },
        { path: 'standalone', meta: { layout: false } },
      ],
    },
    { path: '/diagnostics', meta: { layout: 'diagnostics' } },
    { path: '/', meta: { layout: 'landing' } },
    { path: '/auth', meta: { layout: 'auth' } },
  ]
  apply(pages)
  assert.deepEqual(pages[0].meta, {
    layout: 'dashboard',
    requiresAuth: true,
    pageTransition: false,
  })
  assert.deepEqual(pages[0].children[0].meta, {
    title: 'Profile',
    pageTransition: false,
  })
  assert.deepEqual(pages[0].children[1].meta, {
    layout: 'default',
    pageTransition: { name: 'public' },
  })
  assert.deepEqual(pages[0].children[2].meta, { layout: false })
  for (const page of pages.slice(1))
    assert.equal('pageTransition' in page.meta, false)
})
