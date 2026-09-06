import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

test('draft handoff is scoped, bounded, expiring and consumed once', () => {
  const source = readFileSync(new URL('../runtime/composables/fireux/workspace/useWorkspaceDraftHandoff.ts', import.meta.url), 'utf8')
    .replace(/^import .*\n/gm, '').replace('export function', 'function')
  const uid = { value: 'alice' }
  const pending = { value: null }
  const handoff = compileFunction(`${stripTypeScriptTypes(source)}; return useWorkspaceDraftHandoff()`, ['useState', 'useAuth'])(() => pending, () => ({ uid }))
  assert.equal(handoff.put('kitchen:pizza:team', '  Add Alex  '), true)
  assert.equal(handoff.take('kitchen:burger:team'), '')
  assert.equal(handoff.take('project:pizza:team'), '')
  assert.equal(handoff.take('kitchen:pizza:team'), 'Add Alex')
  assert.equal(handoff.take('kitchen:pizza:team'), '')
  handoff.put('kitchen:pizza:team', 'Private draft')
  uid.value = 'bob'
  assert.equal(handoff.take('kitchen:pizza:team'), '')
  assert.equal(pending.value, null)
  handoff.put('kitchen:pizza:team', 'Old draft')
  pending.value.expires = 0
  assert.equal(handoff.take('kitchen:pizza:team'), '')
  handoff.put('kitchen:pizza:team', 'x'.repeat(5000))
  assert.equal(handoff.take('kitchen:pizza:team').length, 4000)
  uid.value = ''
  assert.equal(handoff.put('kitchen:pizza:team', 'Guest draft'), false)
})
