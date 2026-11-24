import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, effectScope, ref, toValue, watch } from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import { resolveAppUserAccess } from '../../../../core/fireux-core/src/runtime/app/utils/membership/access.ts'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/utils/read-outcome.ts'
import {
  readKitchenDocument,
  resolveKitchenPlaceId,
} from '../runtime/kitchen/utils/read-kitchen-document.ts'

const canonical = (id) => ({ id, name: id })

function loadComposable(path, name, bindings) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(bindings)
  )(...Object.values(bindings))
}

function setup(options = {}, id = ref('a')) {
  const calls = []
  const source = () =>
    Object.assign(ref(null), {
      pending: ref(false),
      error: ref(null),
      outcome: ref('empty'),
    })
  const kitchen = source(),
    place = source()
  const factory = loadComposable(
    '../runtime/kitchen/composables/useKitchenRead.ts',
    'useKitchenRead',
    {
      computed,
      toValue,
      resolveReadOutcome,
      readKitchenDocument,
      resolveKitchenPlaceId,
      useFirestoreRead: () => ({
        firestoreFetchDoc: (path, id) => {
          calls.push({ path, id })
          return calls.length === 1 ? kitchen : place
        },
      }),
    }
  )
  return { id, kitchen, place, calls, read: factory(id, options) }
}

test('Kitchen read returns canonical records, tracks identity and hides failed data', () => {
  const s = setup()
  s.kitchen.value = canonical('a')
  s.kitchen.outcome.value = 'ready'
  s.place.value = { id: 'a', name: 'Place name' }
  assert.deepEqual(s.read.kitchen.value, canonical('a'))
  assert.equal(s.read.kitchen.value.name, 'a')
  assert.equal(s.read.place.value.name, 'Place name')
  assert.equal(s.calls[1].id.value, 'a')
  s.place.pending.value = true
  s.place.error.value = new Error('Place failed')
  assert.equal(s.read.outcome.value, 'ready')
  assert.deepEqual(s.read.kitchen.value, canonical('a'))
  assert.equal(s.read.place.value, null)
  s.place.pending.value = false
  s.place.error.value = null
  s.id.value = 'b'
  s.kitchen.pending.value = true
  assert.equal(s.read.outcome.value, 'pending')
  assert.equal(s.read.place.value, null)
  assert.equal(s.calls.length, 2)
})

test('Access-only reads disable Place and explicit empty scope disables Kitchen', () => {
  const path = ref('kitchens'),
    s = setup({ hydrate: false, collectionPath: path })
  s.kitchen.value = canonical('a')
  s.kitchen.outcome.value = 'ready'
  assert.equal(s.calls[1].id.value, '')
  assert.equal(s.read.place.value, null)
  assert.equal(s.read.outcome.value, 'ready')
  path.value = ''
  assert.equal(s.calls[0].path.value, '')
  assert.equal(s.read.outcome.value, 'idle')
  assert.equal(s.read.kitchen.value, null)
})

test('Malformed ready Kitchen data is an error, disables Place and recovers from a valid replacement', () => {
  const s = setup()
  s.kitchen.outcome.value = 'ready'
  s.kitchen.value = []
  assert.equal(s.read.outcome.value, 'error')
  assert.equal(s.read.kitchen.value, null)
  assert.equal(s.read.place.value, null)
  assert.equal(s.calls[1].id.value, '')
  assert.match(s.read.error.value.message, /Invalid canonical Kitchen/)

  s.kitchen.value = canonical('a')
  assert.equal(s.read.outcome.value, 'ready')
  assert.equal(s.read.kitchen.value.id, 'a')
  assert.equal(s.calls[1].id.value, 'a')
  assert.equal(s.read.error.value, undefined)

  s.kitchen.value = { ...canonical('a'), created: { at: 'yesterday' } }
  assert.equal(s.read.outcome.value, 'ready')
  assert.deepEqual(s.read.kitchen.value, canonical('a'))
})

test('Exact Kitchen reads mask old identities and release errors when their scope is disabled', () => {
  const path = ref('kitchens')
  const s = setup({ collectionPath: path, hydrate: false })
  s.kitchen.value = canonical('a')
  s.kitchen.outcome.value = 'ready'
  s.id.value = 'b'
  assert.equal(s.read.outcome.value, 'pending')
  assert.equal(s.read.kitchen.value, null)
  assert.equal(s.read.error.value, undefined)
  s.kitchen.value = canonical('b')
  assert.equal(s.read.outcome.value, 'ready')
  assert.equal(s.read.kitchen.value.id, 'b')
  s.kitchen.error.value = new Error('Old read failure')
  assert.equal(s.read.outcome.value, 'error')
  path.value = ''
  assert.equal(s.read.outcome.value, 'idle')
  assert.equal(s.read.error.value, undefined)
  assert.equal(s.read.kitchen.value, null)
})
