import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { deleteApp, initializeApp } from 'firebase/app'
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
} from 'firebase/auth'
import {
  deleteApp as deleteAdminApp,
  initializeApp as initializeAdminApp,
} from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../../runtime/user/models/user-account-provisioning.ts'

export async function verifyCoreAccountJourney({ cwd, modulesDir, nuxtCli }) {
  const projectId = 'demo-fireux-live'
  const firestoreHost = '127.0.0.1:8181'
  const authHost = '127.0.0.1:9199'
  assert.equal(process.env.FIRESTORE_EMULATOR_HOST, firestoreHost)
  assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST, authHost)
  const authReady = await fetch(`http://${authHost}/`, {
    signal: AbortSignal.timeout(3000),
  })
  await authReady.body?.cancel()

  const id = `core-only-${Date.now().toString(36)}`
  const firebase = {
    apiKey: 'demo-api-key',
    authDomain: `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: `${projectId}.appspot.com`,
    messagingSenderId: '123456789',
    databaseId: 'fireux',
    identityDatabaseId: 'live-identity',
  }
  const appId = '1:123456789:web:core-only'
  const config = {
    extends: ['fireux-core/layer'],
    modules: ['@nuxt/ui', 'fireux-core/config/app/firebase', 'fireux-core'],
    modulesDir: [modulesDir],
    ssr: false,
    devtools: { enabled: false },
    telemetry: false,
    vuefire: {
      auth: { enabled: true, sessionCookie: false },
      emulators: { enabled: true },
    },
    runtimeConfig: {
      public: {
        fireux: {
          id,
          name: 'Core-only fixture',
          shortName: 'Core fixture',
          role: 'tenant',
          ecosystem: 'fireux',
          ecosystemId: 'fireux',
        },
        firebaseEcosystem: { firebase },
        firebaseApp: { appId },
      },
    },
    nitro: {
      externals: {
        external: [
          'firebase-admin',
          'firebase-functions',
          '@google-cloud/firestore',
        ],
      },
    },
  }
  writeFileSync(
    join(cwd, 'package.json'),
    JSON.stringify({ private: true, dependencies: { nuxt: '*' } })
  )
  writeFileSync(
    join(cwd, 'nuxt.config.mjs'),
    `export default ${JSON.stringify(config)}`
  )

  const listener = createServer().listen(0, '127.0.0.1')
  await once(listener, 'listening')
  const { port } = listener.address()
  await new Promise((resolve, reject) =>
    listener.close((error) => (error ? reject(error) : resolve()))
  )
  const env = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    TMPDIR: process.env.TMPDIR,
    NUXT_TELEMETRY_DISABLED: '1',
    FIREBASE_PROJECT_ID: projectId,
    GCLOUD_PROJECT: projectId,
    GOOGLE_CLOUD_PROJECT: projectId,
    FIRESTORE_EMULATOR_HOST: firestoreHost,
    FIREBASE_AUTH_EMULATOR_HOST: authHost,
    VUEFIRE_EMULATORS: 'true',
  }
  const child = spawn(
    process.execPath,
    [
      nuxtCli,
      'dev',
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
      '--dotenv',
      '/dev/null',
    ],
    { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] }
  )
  const exited = once(child, 'exit')
  let log = ''
  for (const stream of [child.stdout, child.stderr])
    stream.on('data', (chunk) => {
      log = (log + chunk).slice(-6000)
    })

  const client = initializeApp({ ...firebase, appId }, id)
  const auth = getAuth(client)
  connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true })
  const admin = initializeAdminApp({ projectId }, id)
  const appDb = getFirestore(admin, firebase.databaseId)
  const identityDb = getFirestore(admin, firebase.identityDatabaseId)
  const origin = `http://127.0.0.1:${port}`

  async function request(path, { method = 'GET', body, status = 200 } = {}) {
    const token = await auth.currentUser?.getIdToken()
    const response = await fetch(origin + path, {
      method,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20000),
    })
    const result = await response.json()
    assert.equal(response.status, status, `${path}: ${JSON.stringify(result)}`)
    return result
  }

  try {
    for (let i = 0; !log.includes('Nuxt Nitro server built'); i++) {
      assert.ok(
        i < 160 && child.exitCode === null,
        `Nuxt startup failed:\n${log}`
      )
      await delay(250)
    }
    const stamp = { at: Timestamp.now(), by: 'fixture' }
    await appDb.doc(`apps/${id}`).set({
      name: 'Core-only fixture',
      ecosystem_id: 'fireux',
      role: 'tenant',
      status: 'active',
      created: stamp,
      updated: stamp,
    })

    const { user } = await createUserWithEmailAndPassword(
      auth,
      `${id}@example.test`,
      'fixture-password-2026'
    )
    const uid = user.uid
    const identity = identityDb.doc(`users/${uid}`)
    const account = identity.collection('private').doc('account')
    const membership = appDb.doc(`apps/${id}/users/${uid}`)
    const locator = identity.collection('apps').doc(id)
    const refs = [identity, account, membership, locator]
    const snapshot = () =>
      Promise.all(refs.map(async (ref) => (await ref.get()).data()))

    assert.deepEqual(await snapshot(), [
      undefined,
      undefined,
      undefined,
      undefined,
    ])
    const setupAccount = await request('/api/internal/user/account', {
      method: 'POST',
      body: { terms_version: FIREUX_ACCOUNT_TERMS_VERSION },
    })
    assert.equal(setupAccount.terms_recorded, true)
    const setupIdentity = await request('/api/internal/user/handle', {
      method: 'POST',
      body: { handle: id, create: { display_name: 'Core Fixture' } },
    })
    assert.equal(setupIdentity.created, true)
    const setup = await snapshot()
    assert.equal(setup[0]?.handle, id)
    assert.equal(setup[1]?.terms.version, FIREUX_ACCOUNT_TERMS_VERSION)
    assert.deepEqual(setup.slice(2), [undefined, undefined])
    assert.equal((await request('/api/app/status')).app?.id, id)
    assert.deepEqual(await snapshot(), setup)

    const joinApp = () =>
      request('/api/internal/app/membership', {
        method: 'POST',
        body: { action: 'ensure-self' },
      })
    assert.equal((await joinApp()).created, true)
    const joined = await snapshot()
    assert.deepEqual(joined.slice(0, 2), setup.slice(0, 2))
    assert.equal(joined[2]?.role, 'user')
    assert.equal(joined[2]?.subscription, 'free')
    assert.equal(joined[3]?.database_id, firebase.databaseId)
    assert.equal(joined[3]?.app_id, id)

    assert.equal((await joinApp()).created, false)
    assert.deepEqual(await snapshot(), joined)
    await signOut(auth)
    assert.equal(auth.currentUser, null)
    await request('/api/internal/user/account', { status: 401 })
    assert.deepEqual(await snapshot(), joined)
  } catch (error) {
    console.error(log)
    throw error
  } finally {
    child.kill('SIGTERM')
    await exited
    await Promise.all([
      appDb.terminate(),
      identityDb.terminate(),
      deleteApp(client),
    ])
    await deleteAdminApp(admin)
  }
}
