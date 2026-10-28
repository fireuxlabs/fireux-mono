import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { initializeApp, deleteApp } from 'firebase/app'
import { VueFire, useDocument as nativeUseDocument } from 'vuefire'
import {
  createSSRApp,
  computed,
  ref,
  unref,
  watch,
  effectScope,
  onScopeDispose,
  nextTick,
} from 'vue'

const source = stripTypeScriptTypes(
  readFileSync(
    new URL(
      '../runtime/composables/fireux/firestore/operations/firestore-exact-doc-loader.ts',
      import.meta.url
    ),
    'utf8'
  )
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
  .replaceAll('import.meta.server', 'false')
const load = compileFunction(
  `${source}; return createFirestoreExactDocLoader`,
  [
    'useNuxtApp',
    'doc',
    'effectScope',
    'useDocument',
    'computed',
    'ref',
    'unref',
    'watch',
    'attachDevCollectionMeta',
    'guardFirestorePromise',
  ]
)

test('exact IDs stay live for edits and deletion, and dispose on source change and unmount', async () => {
  const bindings = []
  let stopped = 0
  const app = createSSRApp({ render: () => null })
  const reader = load(
    () => ({ vueApp: app }),
    (_db, path, id) => ({ path, id }),
    effectScope,
    (target) => {
      const value = ref({ name: target.id })
      value.pending = ref(false)
      value.error = ref()
      bindings.push(value)
      onScopeDispose(() => stopped++)
      return value
    },
    computed,
    ref,
    unref,
    watch,
    (value) => value,
    () => {}
  )
  const ids = ref(['a'])
  const scope = effectScope()
  const result = scope.run(() =>
    reader({ resolveDb: () => ({}), options: { collectionPath: 'users', ids } })
  )
  bindings[0].value = { name: 'changed' }
  await nextTick()
  assert.equal(result.docs.value[0].name, 'changed')
  bindings[0].value = null
  await nextTick()
  assert.deepEqual(result.docs.value, [])
  ids.value = ['b']
  await nextTick()
  assert.equal(stopped, 1)
  assert.equal(result.docs.value[0].id, 'b')
  scope.stop()
  assert.equal(stopped, 2)
})

test('late exact-ID bindings retain native VueFire injection context without starting network reads', async (t) => {
  const firebaseApp = initializeApp({ projectId: 'demo-fireux-exact-docs' })
  const app = createSSRApp({ render: () => null })
  app.use(VueFire, { firebaseApp })
  const warning = t.mock.method(console, 'warn', () => {})
  const reader = load(
    () => ({ vueApp: app }),
    () => null,
    effectScope,
    nativeUseDocument,
    computed,
    ref,
    unref,
    watch,
    (value) => value,
    () => {}
  )
  const ids = ref([])
  const scope = effectScope()
  try {
    const result = scope.run(() =>
      reader({
        resolveDb: () => ({}),
        options: { collectionPath: 'users', ids },
      })
    )
    ids.value = ['a']
    await nextTick()
    ids.value = ['b', 'c']
    await nextTick()
    assert.deepEqual(result.docs.value, [])
    assert.deepEqual(
      warning.mock.calls.filter((call) =>
        call.arguments.some((value) => String(value).includes('inject()'))
      ),
      []
    )
  } finally {
    scope.stop()
    await deleteApp(firebaseApp)
  }
})
