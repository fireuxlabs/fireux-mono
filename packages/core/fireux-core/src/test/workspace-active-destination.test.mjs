import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(
  new URL(
    '../runtime/composables/navigation/workspace-active-destination.ts',
    import.meta.url
  ),
  'utf8'
).replace('export function', 'function')
const active = compileFunction(
  `${stripTypeScriptTypes(source)}; return workspaceActiveDestination`
)()
const current = (path, query = {}, hash = '') => ({ path, query, hash })

test('nested destinations supersede their group default, including detail routes', () => {
  const links = [
    '/workspace/kitchen/orders',
    '/workspace/kitchen/orders/services',
    '/workspace/kitchen/orders/queue',
  ]
  assert.equal(
    active(links, current('/workspace/kitchen/orders/services')),
    links[1]
  )
  assert.equal(
    active(links, current('/workspace/kitchen/orders/services/breakfast')),
    links[1]
  )
  assert.equal(
    active(links, current('/workspace/kitchen/orders/queue')),
    links[2]
  )
  assert.equal(active(links, current('/workspace/kitchen/orders')), links[0])
})

test('identity child pages do not highlight their parent link', () => {
  const links = [
    '/workspace/kitchen/identity',
    '/workspace/kitchen/identity/appearance',
  ]
  assert.equal(active(links, current(links[1])), links[1])
})

test('in-page sections and existing query destinations take precedence over a plain link', () => {
  const links = [
    '/workspace/project/team',
    '/workspace/project/team#responsibilities',
    '/workspace/project/team?view=roles',
  ]
  assert.equal(
    active(links, current(links[0], {}, '#responsibilities')),
    links[1]
  )
  assert.equal(active(links, current(links[0], { view: 'roles' })), links[2])
  assert.equal(active(links, current(links[0])), links[0])
})

test('path boundaries prevent similarly named capabilities matching each other', () => {
  assert.equal(
    active(
      ['/workspace/kitchen/orders'],
      current('/workspace/kitchen/orders-old')
    ),
    undefined
  )
  assert.equal(
    active(
      ['/workspace/project/apps'],
      current('/workspace/project/apps/demo')
    ),
    '/workspace/project/apps'
  )
})
