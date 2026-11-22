import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { deleteApp, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import {
  deleteApp as deleteAdminApp,
  initializeApp as initializeAdminApp,
} from 'firebase-admin/app'
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore'
import { unref } from 'vue'

function load(path, result, dependencies, dev = true) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export \* from .*\n/gm, '')
    .replace(/^export (default )?/gm, '')
    .replaceAll('import.meta.dev', String(dev))
  return compileFunction(
    stripTypeScriptTypes(source) + '\nreturn ' + result,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

const makeOverride = load(
  '../config/app/database.ts',
  'createAppDatabaseRuntimeModule',
  { defineNuxtModule: (module) => module }
)

const projectId = 'demo-fireux-firestore-routing'

for (const scenario of [
  { name: 'default binding', identity: '(default)', data: '(default)' },
  {
    name: 'named binding',
    base: 'ecosystem',
    identity: 'ecosystem',
    data: 'ecosystem',
  },
  {
    name: 'explicit identity and runtime override',
    base: 'ecosystem',
    explicit: 'identity',
    override: 'app-data',
    identity: 'identity',
    data: 'app-data',
  },
  {
    name: 'default identity and runtime override',
    override: 'app-data',
    identity: '(default)',
    data: 'app-data',
  },
]) {
  test(`${scenario.name} agrees across the client and Admin SDKs`, async (t) => {
    const app = initializeApp({ projectId }, scenario.name)
    const admin = initializeAdminApp({ projectId }, scenario.name)
    t.after(async () => {
      await deleteApp(app)
      await deleteAdminApp(admin)
    })
    const firebase = {
      databaseId: scenario.base,
      identityDatabaseId: scenario.explicit,
    }
    const runtime = { public: { firebaseEcosystem: { firebase }, vuefire: {} } }
    makeOverride(scenario.override)?.setup(
      {},
      { options: { runtimeConfig: runtime } }
    )

    const [useFirestore, identityId] = load(
      '../runtime/composables/fireux/firestore/vuefire.ts',
      '[useFirestore, readRuntimeIdentityFirestoreDatabaseId]',
      {
        connectFirestoreEmulator,
        getFirestore,
        useRuntimeConfig: () => runtime,
        useFirebaseApp: () => app,
        unref,
      }
    )
    const [dataDb, identityDb] = load(
      '../runtime/server/utils/getRuntimeFirestore.ts',
      '[getRuntimeFirestore, getRuntimeIdentityFirestore]',
      {
        useRuntimeConfig: () => runtime,
        getAdminApp: () => admin,
        getFirestore: getAdminFirestore,
      }
    )
    assert.equal(useFirestore()._databaseId.database, scenario.data)
    assert.equal(
      useFirestore(identityId())._databaseId.database,
      scenario.identity
    )
    assert.equal(dataDb().databaseId, scenario.data)
    assert.equal(identityDb().databaseId, scenario.identity)
    assert.equal(useFirestore()._getSettings().host, 'firestore.googleapis.com')
  })
}

test('named SDK instances use VueFire’s Firestore emulator and reuse the connection', async (t) => {
  const app = initializeApp({ projectId }, 'explicit-emulators')
  t.after(() => deleteApp(app))
  const emulator = { host: '127.0.0.1', port: 8181 }
  // The installed VueFire plugin owns this default instance.
  connectFirestoreEmulator(getFirestore(app), emulator.host, emulator.port)
  let connections = 0
  const getNamed = load(
    '../runtime/composables/fireux/firestore/vuefire.ts',
    'getAppFirestore',
    {
      connectFirestoreEmulator(...args) {
        connections++
        connectFirestoreEmulator(...args)
      },
      getFirestore,
    }
  )
  for (const id of ['identity', 'app-data']) {
    const firestore = getNamed(app, id, emulator)
    assert.equal(firestore._getSettings().host, '127.0.0.1:8181')
    assert.equal(getNamed(app, id, emulator), firestore)
  }
  assert.equal(
    getNamed(app, '(default)', emulator)._getSettings().host,
    '127.0.0.1:8181'
  )
  assert.equal(connections, 2)
})

test('Nitro rejects inherited emulator destinations outside a matching explicit development session', () => {
  const firestore = { host: '127.0.0.1', port: 8181 }
  const verify = (env, emulators, dev = true) =>
    load(
      '../runtime/plugins/firebase/firebase-emulators.nitro.ts',
      'verifyFirebaseEmulatorEnvironment',
      {
        process: { env },
        useRuntimeConfig: () => ({ public: { vuefire: { emulators } } }),
      },
      dev
    )()
  assert.doesNotThrow(() => verify({}))
  assert.throws(
    () => verify({ FIRESTORE_EMULATOR_HOST: '127.0.0.1:8181' }),
    /must match/
  )
  assert.throws(
    () => verify({ VUEFIRE_EMULATORS: 'true' }, { firestore }, false),
    /requires explicit development/
  )
  assert.throws(
    () => verify({ VUEFIRE_EMULATORS: 'true' }, { firestore }),
    /must match/
  )
  assert.doesNotThrow(() =>
    verify(
      {
        VUEFIRE_EMULATORS: 'true',
        FIRESTORE_EMULATOR_HOST: '127.0.0.1:8181',
      },
      { firestore }
    )
  )
})
