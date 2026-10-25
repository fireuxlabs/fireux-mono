import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = readFileSync(new URL('../config/module/pages-config.ts', import.meta.url), 'utf8')
  .replace(/^import .*\n/gm, '').replace(/^export /gm, '')
const configure = compileFunction(`${stripTypeScriptTypes(source)}; return configureWorkspacePageTransitions`)()

test('Workspace transitions are disabled recursively without changing other route metadata', () => {
  const hooks = []
  configure({ hook: (name, callback) => hooks.push({ name, callback }) })
  assert.equal(hooks.length, 1)
  assert.equal(hooks[0].name, 'pages:extend')
  const pages = [
    { path: '/workspace/project', meta: { layout: false, workspacePage: true, pageTransition: true } },
    { path: '/', children: [{ path: 'identity', file: '/runtime/pages/workspace/identity.vue', meta: { auth: true } }] },
    { path: '/product', meta: { pageTransition: { name: 'product' } } },
  ]
  hooks[0].callback(pages)
  assert.deepEqual(pages[0].meta, { layout: false, workspacePage: true, pageTransition: false })
  assert.deepEqual(pages[1].children[0].meta, { auth: true, pageTransition: false })
  assert.deepEqual(pages[2].meta, { pageTransition: { name: 'product' } })
})
