import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import {
  basename,
  dirname,
  extname,
  join,
  resolve as pathResolve,
} from 'node:path'
import { compileFunction } from 'node:vm'

const runtimeFile = (path) => new URL(`../runtime/${path}`, import.meta.url)
const compileSource = (input, exported, dependencies) => {
  const source = stripTypeScriptTypes(
    input
      .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
      .replace(/^export /gm, '')
  )
  return compileFunction(
    `${source}; return ${exported}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const compile = (path, exported, dependencies) =>
  compileSource(readFileSync(runtimeFile(path), 'utf8'), exported, dependencies)
const kinds = ['thumbnail', 'logo', 'wordmarkLight', 'wordmarkDark', 'cover']

function fixture({
  ownerAssets = ['logo'],
  parentAssets = [],
  denied = false,
  invalidImage = false,
  update,
} = {}) {
  const uploads = [],
    patches = [],
    inspected = [],
    deleted = []
  let sequence = 0
  const randomUUID = () => `test-${++sequence}`
  const oldPath = 'apps/child/img/app/logo.png'
  const oldUrl = `https://firebasestorage.googleapis.com/v0/b/owner-bucket/o/${encodeURIComponent(oldPath)}?alt=media&token=old-token`
  const objects = new Map([[oldPath, { token: 'old-token' }]])
  const app = { 'media.logo_url': oldUrl }
  const saveStorageFileWithDownloadToken = compile(
    'server/utils/uploads/storage.ts',
    'saveStorageFileWithDownloadToken',
    {
      randomUUID,
      getAdminApp: () => ({}),
      getStorage: () => ({
        bucket: (bucket) => ({
          file: (path) => ({
            save: async (_data, options) => {
              const token =
                options.metadata.metadata.firebaseStorageDownloadTokens
              objects.set(path, { token })
              uploads.push({ bucket, path, metadata: options.metadata })
            },
            delete: async () => {
              deleted.push(path)
              objects.delete(path)
            },
          }),
        }),
      }),
    }
  )
  const isDownloadable = (value) => {
    const url = new URL(value)
    const path = decodeURIComponent(url.pathname.split('/o/')[1])
    return objects.get(path)?.token === url.searchParams.get('token')
  }
  const cwd = '/repo/projects/misebox/child'
  const paths = new Set([
    '/repo/pnpm-workspace.yaml',
    ...ownerAssets.map((kind) => `${cwd}/public/img/app/${kind}.png`),
    ...parentAssets.map(
      (kind) => `/repo/projects/misebox/misebox-app/public/img/app/${kind}.png`
    ),
  ])
  const sync = compile('app/server/media/sync.ts', 'syncConfiguredAppMedia', {
    findRepoRoot: compile('server/utils/files/repository-root.ts', 'findRepoRoot', {
      existsSync: (path) => paths.has(path), join, pathResolve,
    }),
    normalizeStorageBucketName: compile('server/utils/uploads/storage.ts', 'normalizeStorageBucketName', {}),
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
    basename,
    dirname,
    extname,
    join,
    pathResolve,
    imageSize: () => ({ width: 256, height: 256, type: 'png' }),
    randomUUID,
    saveStorageFileWithDownloadToken,
    FIRESTORE_MUTATION_TARGETS: { runtimeApps: 'fixed-runtime-apps' },
    serverUpdate: async (...args) => {
      patches.push(args)
      const commit = () => Object.assign(app, args[2])
      if (update) await update({ args, commit })
      else commit()
    },
    APP_IMAGE_SYNC_KINDS: kinds,
    appImageLocalPublicPath: (kind) => `/img/app/${kind}.png`,
    appImageRequirement: (kind) => ({ label: kind, dimensions: {} }),
    appImageStoragePath: (appId, kind) => `apps/${appId}/img/app/${kind}.png`,
    appImageFirestoreField: (kind) => `media.${kind}_url`,
    validateAppAssetDimensions: () =>
      invalidImage ? 'Invalid dimensions' : null,
  })
  return {
    sync,
    uploads,
    patches,
    inspected,
    deleted,
    app,
    oldUrl,
    objects,
    isDownloadable,
  }
}

test('single-image and all-image requests use the same fixed-owner server command', async () => {
  const single = fixture()
  const result = await single.sync({}, { kinds: ['logo', 'logo'] })
  assert.equal(result.appId, 'child')
  assert.deepEqual(result.failed, [])
  assert.equal(single.uploads.length, 1)
  assert.equal(single.uploads[0].bucket, 'owner-bucket')
  assert.equal(
    single.uploads[0].path,
    'apps/child/img/app/revisions/test-1/logo.png'
  )
  assert.equal(single.uploads[0].metadata.contentType, 'image/png')
  assert.equal(
    single.uploads[0].metadata.cacheControl,
    'public,max-age=31536000,immutable'
  )
  assert.equal(single.isDownloadable(result.uploaded.logo), true)
  assert.equal(single.isDownloadable(single.oldUrl), true)
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
    'app/utils/sync-app-media.ts',
    'syncAppMediaToStorage',
    {
      useRequireUser: async () => ({ uid: 'actor', getIdToken: async () => 'test-token' }),
      useAuth: () => ({ currentUser: { value: { uid: 'actor' } } }),
      useFireUXConfig: () => ({ appId: 'child' }),
      captureCommandScope: () => ({ isCurrent: () => true, stop() {} }),
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

test('a failed App attachment leaves the previous image usable', async () => {
  const f = fixture({
    update: async () => {
      throw new Error('Firestore unavailable')
    },
  })
  await assert.rejects(f.sync({}, { kinds: ['logo'] }), /Firestore unavailable/)
  assert.equal(f.app['media.logo_url'], f.oldUrl)
  assert.equal(f.isDownloadable(f.oldUrl), true)
  assert.equal(f.isDownloadable(f.patches[0][2]['media.logo_url']), true)
  assert.deepEqual(f.deleted, [])
})

test('an uncertain App attachment retains the image that may have committed', async () => {
  const f = fixture({
    update: async ({ commit }) => {
      commit()
      throw new Error('Acknowledgement lost')
    },
  })
  await assert.rejects(f.sync({}, { kinds: ['logo'] }), /Acknowledgement lost/)
  assert.notEqual(f.app['media.logo_url'], f.oldUrl)
  assert.equal(f.isDownloadable(f.app['media.logo_url']), true)
  assert.equal(f.isDownloadable(f.oldUrl), true)
  assert.deepEqual(f.deleted, [])
})

test('concurrent syncs remain usable when App attachments complete in reverse order', async () => {
  const entered = Promise.withResolvers()
  const blocked = Promise.withResolvers()
  let writes = 0
  const f = fixture({
    update: async ({ commit }) => {
      if (++writes === 1) {
        entered.resolve()
        await blocked.promise
      }
      commit()
    },
  })
  const first = f.sync({}, { kinds: ['logo'] })
  await entered.promise
  const secondResult = await f.sync({}, { kinds: ['logo'] })
  assert.equal(f.app['media.logo_url'], secondResult.uploaded.logo)
  assert.equal(f.isDownloadable(f.app['media.logo_url']), true)
  blocked.resolve()
  const firstResult = await first
  assert.deepEqual(firstResult.failed, [])
  assert.deepEqual(secondResult.failed, [])
  assert.notEqual(firstResult.uploaded.logo, secondResult.uploaded.logo)
  assert.equal(f.app['media.logo_url'], firstResult.uploaded.logo)
  for (const url of [
    f.oldUrl,
    firstResult.uploaded.logo,
    secondResult.uploaded.logo,
  ]) {
    assert.equal(f.isDownloadable(url), true)
  }
  assert.deepEqual(f.deleted, [])
})

test('a concurrent failed sync does not invalidate the successful replacement', async () => {
  const entered = Promise.withResolvers()
  const blocked = Promise.withResolvers()
  let writes = 0
  const f = fixture({
    update: async ({ commit }) => {
      if (++writes === 1) {
        entered.resolve()
        await blocked.promise
        throw new Error('Firestore unavailable')
      }
      commit()
    },
  })
  const first = f.sync({}, { kinds: ['logo'] })
  await entered.promise
  const secondResult = await f.sync({}, { kinds: ['logo'] })
  const rejected = assert.rejects(first, /Firestore unavailable/)
  blocked.resolve()
  await rejected
  assert.equal(f.app['media.logo_url'], secondResult.uploaded.logo)
  assert.equal(f.isDownloadable(f.app['media.logo_url']), true)
  assert.equal(f.isDownloadable(f.oldUrl), true)
  assert.deepEqual(f.deleted, [])
})

test('App media remains inspectable in production without offering an unavailable sync', async () => {
  const component = readFileSync(
    runtimeFile('app/components/Edit/Media.vue'),
    'utf8'
  )
  const script = component.match(
    /<script setup lang="ts">([\s\S]*?)<\/script>/
  )[1]
  for (const development of [false, true]) {
    const calls = []
    const view = compileSource(
      script
        .replaceAll('import.meta.dev', String(development))
        .replaceAll('import.meta.client', 'true'),
      '{ canSync, onSync, syncableItems }',
      {
        ref: (value) => ({ value }),
        computed: (getter) => ({
          get value() {
            return getter()
          },
        }),
        defineProps: () => ({
          app: { media: { logo_url: 'https://example.test/logo.png' } },
        }),
        withDefaults: (props) => props,
        useToastify: () => ({ success() {}, error() {} }),
        appImageLocalPublicPath: (kind) => `/img/app/${kind}.png`,
        appImageRequirement: () => ({ requirementsHtml: '' }),
        appPublicAssetRequirement: () => ({
          requirementsHtml: '',
          localPublicPath: '',
        }),
        syncAppMediaToStorage: async (kinds) => {
          calls.push(kinds)
          return { failed: [] }
        },
      }
    )
    assert.equal(view.canSync, development)
    assert.equal(
      view.syncableItems.value.find((item) => item.key === 'logo').url,
      'https://example.test/logo.png'
    )
    await view.onSync('logo')
    assert.deepEqual(calls, development ? [['logo']] : [])
  }
  assert.match(component, /:disabled="!canSync \|\| Boolean\(saving\)"/)
})
