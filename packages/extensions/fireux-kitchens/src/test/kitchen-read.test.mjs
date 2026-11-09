import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, effectScope, ref, toValue, watch } from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import { resolveAppUserAccess } from '../../../../core/fireux-core/src/runtime/app/utils/app-user-access.ts'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/utils/read-outcome.ts'
import { readKitchenDocument } from '../runtime/kitchen/utils/read-kitchen-document.ts'

const canonical = (id) => ({
  id,
  identity: { slug: id, status: 'active', visibility: false },
  created: { at: { seconds: 123, nanoseconds: 0 }, by: 'user' },
})

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

test('Workspace retains only the granted canonical root through joined Place failure or loading', () => {
  const scope = effectScope()
  const selectedId = ref('a')
  const access = { ids: ref(['a', 'b']), outcome: ref('ready') }
  const targets = {
    access,
    kitchens: ref([]),
    outcome: ref('error'),
  }
  const states = new Map()
  let source
  const bindings = {
    computed,
    watch,
    useCommandScope,
    resolveAppUserAccess,
    defineWorkspace: (factory) => factory,
    useFireUXConfig: () => ({ appId: 'app' }),
    useWorkspaceEntryCta: () => ({
      workspaceEntryPath: ref('/workspace/kitchen'),
    }),
    useState: (key, init) => {
      if (!states.has(key)) states.set(key, ref(init()))
      return states.get(key)
    },
    useRoute: () => ({
      path: '/workspace/kitchen/identity',
      query: {},
      hash: '',
      matched: [],
      meta: { workspace: 'kitchen' },
    }),
    useRouter: () => ({ getRoutes: () => [] }),
    useWorkspace: () => ({
      selectedId,
      select: (id) => {
        selectedId.value = id
      },
      reconcile: () => {},
    }),
    useKitchenCollection: () => targets,
    useAppSession: () => ({
      uid: ref('actor'),
      appUser: ref({ role: 'user', subscription: 'free' }),
      pending: ref(false),
      error: ref(null),
    }),
    useKitchenRead: (id) => {
      source = setup({}, id)
      return source.read
    },
    useKitchenInterface: () => ({ surface: ({ kitchen }) => kitchen }),
    kitchenWorkspaceSwitchPath: () => '',
    navigateTo: () => {
      throw new Error('This read must not navigate.')
    },
  }
  const factory = loadComposable(
    '../runtime/kitchen/composables/workspace/useKitchenWorkspace.ts',
    'useKitchenWorkspace',
    bindings
  )
  try {
    const workspace = scope.run(factory)
    source.kitchen.value = {
      ...canonical('a'),
      slug: 'retired-flat-slug',
      visibility: true,
    }
    source.kitchen.outcome.value = 'ready'
    source.place.error.value = new Error('Place failed')
    assert.deepEqual(workspace.root.value, canonical('a'))
    assert.equal(workspace.root.value.identity.visibility, false)
    assert.equal(workspace.data.value, null)
    assert.equal(workspace.outcome.value, 'error')
    assert.equal(workspace.collectionOutcome.value, 'error')
    assert.deepEqual(workspace.collection.value, [])

    source.place.error.value = null
    source.place.pending.value = true
    source.place.outcome.value = 'pending'
    assert.deepEqual(workspace.root.value, canonical('a'))
    assert.equal(workspace.data.value, null)
    assert.equal(workspace.outcome.value, 'pending')

    selectedId.value = 'b'
    assert.equal(
      workspace.root.value,
      null,
      'retained a cannot become selected b'
    )
    assert.equal(workspace.outcome.value, 'pending')
    source.kitchen.value = canonical('b')
    assert.deepEqual(workspace.root.value, canonical('b'))
    source.kitchen.value = canonical('wrong')
    assert.equal(workspace.root.value, null, 'a mismatched root is unavailable')
    source.kitchen.value = { ...canonical('b'), identity: {} }
    assert.equal(workspace.root.value, null, 'a malformed root is unavailable')
    assert.equal(workspace.outcome.value, 'error')
    source.kitchen.value = canonical('b')

    source.kitchen.pending.value = true
    assert.equal(
      workspace.root.value,
      null,
      'a pending root cannot retain data'
    )
    source.kitchen.pending.value = false
    source.kitchen.error.value = new Error('Kitchen failed')
    assert.equal(workspace.root.value, null, 'a failed root cannot retain data')
    source.kitchen.error.value = null
    source.kitchen.value = null
    source.kitchen.outcome.value = 'empty'
    assert.equal(workspace.root.value, null, 'a missing root is unavailable')
    source.kitchen.value = canonical('b')
    source.kitchen.outcome.value = 'ready'
    assert.deepEqual(workspace.root.value, canonical('b'))

    access.ids.value = ['a']
    assert.equal(source.calls[0].id.value, '')
    assert.equal(
      workspace.root.value,
      null,
      'revoked selection cannot expose a retained root'
    )
    assert.equal(workspace.outcome.value, 'empty')
    access.ids.value = ['a', 'b']
    assert.deepEqual(workspace.root.value, canonical('b'))
    access.outcome.value = 'pending'
    assert.equal(
      workspace.root.value,
      null,
      'unresolved access cannot expose a retained root'
    )
    assert.equal(workspace.outcome.value, 'pending')
    assert.equal(source.calls.length, 2, 'root availability adds no reader')
  } finally {
    scope.stop()
  }
})

test('Kitchen read returns canonical records, tracks identity and hides failed data', () => {
  const s = setup()
  s.kitchen.value = { ...canonical('a'), visibility: true, services: [] }
  s.kitchen.outcome.value = 'ready'
  s.place.value = { id: 'a', name: 'Place name' }
  assert.deepEqual(s.read.kitchen.value, canonical('a'))
  assert.equal(s.read.kitchen.value.name, undefined)
  assert.equal(s.read.place.value.name, 'Place name')
  assert.equal(s.calls[1].id.value, 'a')
  s.place.pending.value = true
  s.place.error.value = new Error('Place failed')
  assert.equal(s.read.outcome.value, 'error')
  assert.equal(s.read.kitchen.value, null)
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
  s.kitchen.value = { ...canonical('a'), identity: {} }
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
  assert.equal(s.read.outcome.value, 'error')
  assert.equal(s.read.kitchen.value, null)
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
