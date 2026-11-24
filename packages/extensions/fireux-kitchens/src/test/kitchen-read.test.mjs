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

test('authorized Kitchen acquisition gates the document and masks scope transitions', () => {
  const uid = ref('alice')
  const hasAuthState = ref(false)
  const isAuthenticated = ref(true)
  const access = { outcome: ref('pending'), ids: ref([]) }
  const id = ref('a')
  const source = { outcome: ref('idle'), kitchen: ref(null), error: ref(null) }
  let readId
  let readOptions
  const factory = loadComposable(
    '../runtime/kitchen/composables/useAuthorizedKitchenRead.ts',
    'useAuthorizedKitchenRead',
    {
      computed,
      ref,
      toValue,
      watch,
      useAuth: () => ({
        uid,
        hasAuthState,
        isAuthenticated,
        lastBindError: ref(null),
      }),
      useKitchenAccess: () => access,
      useKitchenRead: (target, options) => {
        readId = target
        readOptions = options
        return source
      },
    }
  )
  const scope = effectScope()
  const result = scope.run(() => factory(id))
  try {
    assert.equal(readId.value, '')
    assert.equal(result.outcome.value, 'pending')
    assert.equal(readOptions.hydrate, false)
    hasAuthState.value = true
    access.outcome.value = 'empty'
    assert.equal(result.outcome.value, 'denied')
    access.outcome.value = 'error'
    assert.equal(result.outcome.value, 'error')
    access.ids.value = ['a', 'b']
    access.outcome.value = 'ready'
    assert.equal(readId.value, 'a')
    assert.equal(result.outcome.value, 'pending')
    source.outcome.value = 'empty'
    assert.equal(result.outcome.value, 'missing')
    source.outcome.value = 'error'
    assert.equal(result.outcome.value, 'error')
    source.error.value = { code: 'permission-denied' }
    assert.equal(result.outcome.value, 'denied')
    source.outcome.value = 'ready'
    source.kitchen.value = canonical('a')
    assert.equal(result.kitchen.value.id, 'a')
    id.value = 'b'
    assert.equal(readId.value, 'b')
    assert.equal(result.kitchen.value, null)
    source.kitchen.value = canonical('b')
    assert.equal(result.kitchen.value.id, 'b')
    const firstBinding = readOptions.bindingKey.value
    uid.value = 'bob'
    assert.ok(readOptions.bindingKey.value > firstBinding)
    access.outcome.value = 'pending'
    assert.equal(result.kitchen.value, null)
    access.outcome.value = 'ready'
    access.ids.value = ['a']
    assert.equal(readId.value, '')
    assert.equal(result.outcome.value, 'denied')
    access.ids.value = ['b']
    assert.equal(result.kitchen.value.id, 'b')
    isAuthenticated.value = false
    assert.equal(readId.value, '')
    assert.equal(result.outcome.value, 'denied')
    assert.equal(result.kitchen.value, null)
  } finally {
    scope.stop()
  }
})
