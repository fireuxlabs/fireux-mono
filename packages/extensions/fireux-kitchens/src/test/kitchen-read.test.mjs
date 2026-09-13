import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/read-outcome.ts'

function setup(options = {}) {
  const calls = []
  const source = () => Object.assign(ref(null), { pending: ref(false), error: ref(null), outcome: ref('missing') })
  const kitchen = source(), place = source()
  const text = readFileSync(new URL('../runtime/kitchen/composables/firestore/useKitchenRead.ts', import.meta.url), 'utf8')
    .replace(/^import[^\n]*\n/gm, '').replace(/^export /gm, '')
  const factory = compileFunction(`${stripTypeScriptTypes(text)}; return useKitchenRead`, ['computed', 'toValue', 'resolveReadOutcome', 'useFirestoreRead'])(computed, toValue, resolveReadOutcome, () => ({
    firestoreFetchDoc: (path, id) => { calls.push({ path, id }); return calls.length === 1 ? kitchen : place },
  }))
  const id = ref('a')
  return { id, kitchen, place, calls, read: factory(id, options) }
}

test('Kitchen read returns canonical records, tracks identity and hides failed data', () => {
  const s = setup()
  s.kitchen.value = { id: 'a', slug: 'venue', status: 'active' }
  s.kitchen.outcome.value = 'ready'
  s.place.value = { id: 'a', name: 'Place name' }
  assert.deepEqual(s.read.kitchen.value, s.kitchen.value)
  assert.equal(s.read.kitchen.value.name, undefined)
  assert.equal(s.read.place.value.name, 'Place name')
  assert.equal(s.calls[1].id.value, 'a')
  s.place.pending.value = true
  s.place.error.value = new Error('Place failed')
  assert.equal(s.read.outcome.value, 'error')
  assert.equal(s.read.kitchen.value, null)
  s.place.pending.value = false; s.place.error.value = null
  s.id.value = 'b'; s.kitchen.pending.value = true
  assert.equal(s.read.outcome.value, 'pending')
  assert.equal(s.read.place.value, null)
  assert.equal(s.calls.length, 2)
})

test('Access-only reads disable Place and explicit empty scope disables Kitchen', () => {
  const path = ref('kitchens'), s = setup({ hydrate: false, collectionPath: path })
  s.kitchen.value = { id: 'a' }; s.kitchen.outcome.value = 'ready'
  assert.equal(s.calls[1].id.value, '')
  assert.equal(s.read.place.value, null)
  assert.equal(s.read.outcome.value, 'ready')
  path.value = ''
  assert.equal(s.calls[0].path.value, '')
  assert.equal(s.read.outcome.value, 'idle')
  assert.equal(s.read.kitchen.value, null)
})
