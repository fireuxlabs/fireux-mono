import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  createSSRApp,
  h,
  useId,
  computed,
  getCurrentInstance,
  onServerPrefetch,
  ref,
  shallowRef,
  unref,
  watch,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import { initializeApp, deleteApp } from 'firebase/app'
import { VueFire, useDocument } from 'vuefire'

function load(path, name, dependencies, server) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.server', String(server))
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

const resolveReadOutcome = load(
  '../runtime/utils/read-outcome.ts',
  'resolveReadOutcome',
  {},
  true
)

test('server placeholders preserve native VueFire child IDs without resolving a database or starting reads', async () => {
  const firebaseApp = initializeApp(
    { projectId: 'demo-fireux-lifecycle' },
    'fireux-lifecycle-test'
  )
  let databaseCalls = 0
  const factory = (server) =>
    load(
      '../runtime/composables/fireux/firestore/operations/useFirestoreRead.ts',
      'useFirestoreRead',
      {
        computed,
        getCurrentInstance,
        onServerPrefetch,
        ref,
        shallowRef,
        unref,
        watch,
        resolveReadOutcome,
        useFirestoreResolver: () => () => {
          databaseCalls++
          throw new Error('Database must not be resolved')
        },
        readRuntimeFirestoreDatabaseId: () => 'fixture',
        useDocument,
        guardFirestorePromise() {},
      },
      server
    )
  const child = {
    setup() {
      const id = useId()
      return () => h('input', { id })
    },
  }
  const render = async (server, documentId = '') => {
    const read = factory(server)
    const app = createSSRApp({
      setup() {
        const record = read().firestoreFetchDoc('apps', documentId)
        assert.equal(record.outcome.value, documentId ? 'pending' : 'idle')
        assert.equal(record.value, undefined)
        return () => h(child)
      },
    })
    app.use(VueFire, { firebaseApp })
    return renderToString(app)
  }
  try {
    const nativeBinding = await render(false)
    assert.equal(await render(true), nativeBinding)
    assert.equal(await render(true, 'pending-target'), nativeBinding)
    assert.equal(databaseCalls, 0)
  } finally {
    await deleteApp(firebaseApp)
  }
})
