import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { extname, join, resolve as pathResolve } from 'node:path'
import { compileFunction } from 'node:vm'

const runtimeFile = (path) => new URL(`../runtime/${path}`, import.meta.url)
const compile = (path, exported, dependencies) => {
  const source = stripTypeScriptTypes(
    readFileSync(runtimeFile(path), 'utf8')
      .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
      .replace(/^export /gm, '')
  )
  return compileFunction(
    `${source}; return ${exported}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const kinds = ['thumbnail', 'logo', 'wordmarkLight', 'wordmarkDark', 'cover']

function fixture({
  ownerAssets = ['logo'],
  parentAssets = [],
  denied = false,
  invalidImage = false,
} = {}) {
  const uploads = [],
    patches = [],
    inspected = []
  const cwd = '/repo/projects/misebox/child'
  const paths = new Set([
    '/repo/pnpm-workspace.yaml',
    ...ownerAssets.map((kind) => `${cwd}/public/img/app/${kind}.png`),
    ...parentAssets.map(
      (kind) => `/repo/projects/misebox/misebox-app/public/img/app/${kind}.png`
    ),
  ])
  const sync = compile('app/server/media/sync.ts', 'syncConfiguredAppMedia', {
    requireDevDeveloper: async () => {
      if (denied)
        throw Object.assign(new Error('Developer required'), {
          statusCode: 403,
        })
    },
    useRuntimeConfig: () => ({
      public: {
        firebaseEcosystem: { firebase: { storageBucket: 'gs://owner-bucket' } },
      },
    }),
    useFireUXConfig: () => ({ appId: 'child', ecosystem: 'misebox' }),
    createError: (input) =>
      Object.assign(new Error(input.statusMessage), input),
    process: { cwd: () => cwd },
    existsSync: (path) => paths.has(path),
    readFileSync: (path) => {
      inspected.push(path)
      return Buffer.from('test image')
    },
    extname,
    join,
    pathResolve,
    imageSize: () => ({ width: 256, height: 256, type: 'png' }),
    randomUUID: () => 'test-token',
    getAdminApp: () => ({}),
    getStorage: () => ({
      bucket: (bucket) => ({
        file: (path) => ({ save: async () => uploads.push({ bucket, path }) }),
      }),
    }),
    FIRESTORE_MUTATION_TARGETS: { runtimeApps: 'fixed-runtime-apps' },
    serverUpdate: async (...args) => patches.push(args),
    APP_IMAGE_SYNC_KINDS: kinds,
    appImageLocalPublicPath: (kind) => `/img/app/${kind}.png`,
    appImageRequirement: (kind) => ({ label: kind, dimensions: {} }),
    appImageStoragePath: (appId, kind) => `apps/${appId}/img/app/${kind}.png`,
    appImageFirestoreField: (kind) => `media.${kind}_url`,
    validateAppAssetDimensions: () =>
      invalidImage ? 'Invalid dimensions' : null,
  })
  return { sync, uploads, patches, inspected }
}

test('single-image and all-image requests use the same fixed-owner server command', async () => {
  const single = fixture()
  const result = await single.sync({}, { kinds: ['logo', 'logo'] })
  assert.equal(result.appId, 'child')
  assert.deepEqual(result.failed, [])
  assert.deepEqual(single.uploads, [
    { bucket: 'owner-bucket', path: 'apps/child/img/app/logo.png' },
  ])
  assert.equal(single.patches.length, 1)
  assert.deepEqual(single.patches[0].slice(0, 2), [
    'fixed-runtime-apps',
    'child',
  ])
  assert.deepEqual(Object.keys(single.patches[0][2]), ['media.logo_url'])

  const all = fixture({ ownerAssets: kinds })
  await all.sync({}, {})
  assert.equal(all.uploads.length, kinds.length)
  assert.equal(all.patches.length, 1)
})

test('missing App artwork fails instead of borrowing the parent App brand', async () => {
  const f = fixture({ ownerAssets: [], parentAssets: ['logo'] })
  const result = await f.sync({}, { kinds: ['logo'] })
  assert.deepEqual(result.uploaded, {})
  assert.deepEqual(result.failed, [
    { kind: 'logo', message: 'Missing local asset: /img/app/logo.png' },
  ])
  assert.deepEqual(f.uploads, [])
  assert.deepEqual(f.patches, [])
  assert.deepEqual(f.inspected, [])
})

test('media sync rejects alternate owners, unknown kinds and invalid images before writing', async () => {
  for (const input of [
    { appId: 'other' },
    { kinds: [] },
    { kinds: ['favicon'] },
    { kinds: 'logo' },
  ]) {
    const f = fixture()
    await assert.rejects(f.sync({}, input), { statusCode: 400 })
    assert.deepEqual(f.uploads, [])
  }
  const denied = fixture({ denied: true })
  await assert.rejects(denied.sync({}, { kinds: ['logo'] }), {
    statusCode: 403,
  })
  assert.deepEqual(denied.uploads, [])
  const invalid = fixture({ invalidImage: true })
  const result = await invalid.sync({}, { kinds: ['logo'] })
  assert.match(result.failed[0].message, /Invalid dimensions/)
  assert.deepEqual(invalid.uploads, [])
  assert.deepEqual(invalid.patches, [])
})

test('the media adapter sends only selected kinds through the authenticated command', async () => {
  let request
  const sync = compile(
    'app/composables/firestore/utils/appMediaSync.ts',
    'syncAppMediaToStorage',
    {
      useRequireUser: async () => ({ getIdToken: async () => 'test-token' }),
      fetch: async (url, options) => {
        request = { url, options }
        return {
          ok: true,
          json: async () => ({ appId: 'child', uploaded: {}, failed: [] }),
        }
      },
    }
  )
  await sync(['logo'])
  assert.equal(request.url, '/api/internal/app/sync-media')
  assert.equal(request.options.headers.authorization, 'Bearer test-token')
  assert.deepEqual(JSON.parse(request.options.body), { kinds: ['logo'] })
  await sync()
  assert.deepEqual(JSON.parse(request.options.body), {})
})
