import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { generateKeyPairSync } from 'node:crypto'
import {
  applicationDefault,
  cert,
  deleteApp,
  getApps,
  initializeApp,
} from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const projectId = 'demo-fireux-admin'
const source = readFileSync(
  new URL('../runtime/server/utils/getAdmin.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
const parse = compileFunction(
  `${stripTypeScriptTypes(source)}; return parseServiceAccountJson`
)()
const account = {
  project_id: 'fixture-project',
  client_email: 'fixture@example.test',
  private_key: 'fixture\\nkey',
}
test('Core accepts JSON and the existing App inline base64 credential contract without changing file input', () => {
  const json = JSON.stringify(account)
  const expected = {
    projectId: account.project_id,
    clientEmail: account.client_email,
    privateKey: 'fixture\nkey',
  }
  assert.deepEqual(parse(json, 'FIREBASE_SERVICE_ACCOUNT'), expected)
  assert.deepEqual(
    parse(Buffer.from(json).toString('base64'), 'FIREBASE_SERVICE_ACCOUNT'),
    expected
  )
  assert.deepEqual(parse(json, 'FIREBASE_SERVICE_ACCOUNT_FILE'), expected)
  assert.throws(
    () =>
      parse(
        Buffer.from(json).toString('base64'),
        'FIREBASE_SERVICE_ACCOUNT_FILE'
      ),
    /valid JSON/
  )
})
test('Invalid credential configuration fails without exposing its contents', () => {
  const privateValue = 'fixture-sensitive-input'
  for (const value of [
    privateValue,
    JSON.stringify({ project_id: 'incomplete' }),
    Buffer.from('{}').toString('base64'),
  ]) {
    assert.throws(
      () => parse(value, 'FIREBASE_SERVICE_ACCOUNT'),
      (error) =>
        !error.message.includes(privateValue) &&
        /JSON|missing/.test(error.message)
    )
  }
})

function compile(source, result, dependencies) {
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function adminHarness(t, env = {}) {
  t.after(() => Promise.all(getApps().map((app) => deleteApp(app))))
  const runtime = {
    public: {
      firebaseEcosystem: {
        firebase: {
          projectId,
          databaseId: 'runtime',
          identityDatabaseId: 'identity',
        },
      },
      vuefire: { config: { projectId } },
    },
    vuefire: { admin: { options: { projectId } } },
  }
  const credentials = []
  const getAdminApp = compile(source, 'getAdminApp', {
    getApps,
    initializeApp,
    applicationDefault() {
      credentials.push('adc')
      return applicationDefault()
    },
    cert(options) {
      credentials.push('explicit')
      return cert(options)
    },
    useRuntimeConfig: () => runtime,
    process: { env },
  })
  const ssrSource = readFileSync(
    new URL(
      '../runtime/plugins/firebase/firebase-admin-fallback.server.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import .*\n/gm, '')
    .replace('export default', 'const plugin =')
  const ssr = compile(ssrSource, 'plugin', {
    defineNuxtPlugin: (setup) => setup,
    getAdminApp,
  })
  const firestoreSource = readFileSync(
    new URL('../runtime/server/utils/getRuntimeFirestore.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import .*\n/gm, '')
    .replace(/^export /gm, '')
  const firestore = compile(
    firestoreSource,
    '{ getRuntimeFirestore, getRuntimeIdentityFirestore }',
    {
      useRuntimeConfig: () => runtime,
      getAdminApp,
      getFirestore,
    }
  )
  return { runtime, getAdminApp, ssr, firestore, credentials }
}

for (const order of ['SSR first', 'Nitro first']) {
  test(`${order} shares one correctly bound Admin app and keeps named databases separate`, async (t) => {
    const harness = adminHarness(t)
    const unrelated = initializeApp({ projectId: 'demo-unrelated-default' })
    initializeApp(
      { projectId: 'demo-directory-target' },
      'platform-directory-demo-directory-target'
    )
    if (order === 'SSR first') harness.ssr()
    else harness.firestore.getRuntimeFirestore()

    const admin = harness.getAdminApp()
    harness.ssr()
    const repeated = await Promise.all(
      Array.from({ length: 8 }, async () => harness.getAdminApp())
    )
    assert.ok(repeated.every((item) => item === admin))
    assert.equal(admin.name, 'vuefire-admin')
    assert.equal(admin.options.projectId, projectId)
    assert.notEqual(admin, unrelated)
    assert.deepEqual(harness.credentials, ['adc'])
    assert.equal(getApps().length, 3)

    for (const [database, id] of [
      [harness.firestore.getRuntimeFirestore(), 'runtime'],
      [harness.firestore.getRuntimeIdentityFirestore(), 'identity'],
    ]) {
      assert.equal(database.projectId, projectId)
      assert.equal(database.databaseId, id)
    }
  })
}

test('an existing named Admin app is reused only for the bound project', async (t) => {
  const harness = adminHarness(t)
  const matching = initializeApp({ projectId }, 'vuefire-admin')
  assert.equal(harness.getAdminApp(), matching)
  assert.deepEqual(harness.credentials, [])
  await deleteApp(matching)
  initializeApp({ projectId: 'demo-wrong-project' }, 'vuefire-admin')
  assert.throws(
    harness.getAdminApp,
    /Existing vuefire-admin app targets a different project/
  )
  assert.deepEqual(harness.credentials, [])
})

test('conflicting VueFire configuration and a missing Ecosystem binding fail before initialization', (t) => {
  const harness = adminHarness(t, {
    FIREBASE_PROJECT_ID: 'demo-credential-project',
  })
  harness.runtime.vuefire.admin.options.projectId = 'demo-other-admin'
  assert.throws(harness.getAdminApp, /VueFire project configuration conflicts/)
  harness.runtime.vuefire.admin.options.projectId = projectId
  harness.runtime.public.vuefire.config.projectId = 'demo-other-browser'
  assert.throws(harness.getAdminApp, /VueFire project configuration conflicts/)
  delete harness.runtime.public.firebaseEcosystem
  assert.throws(
    harness.getAdminApp,
    /An Ecosystem Firebase project is required/
  )
  assert.equal(getApps().length, 0)
})

test('an explicit credential authenticates the Admin SDK without choosing the target project', (t) => {
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  })
  const harness = adminHarness(t, {
    FIREBASE_PROJECT_ID: 'demo-credential-project',
    FIREBASE_CLIENT_EMAIL:
      'fixture@demo-credential-project.iam.gserviceaccount.com',
    FIREBASE_PRIVATE_KEY: privateKey,
    FIREBASE_SERVICE_ACCOUNT_ID:
      'fixture@demo-credential-project.iam.gserviceaccount.com',
  })
  const admin = harness.getAdminApp()
  assert.deepEqual(harness.credentials, ['explicit'])
  assert.equal(admin.options.projectId, projectId)
  assert.equal(admin.options.credential.projectId, 'demo-credential-project')
  assert.equal(
    admin.options.serviceAccountId,
    'fixture@demo-credential-project.iam.gserviceaccount.com'
  )
})
