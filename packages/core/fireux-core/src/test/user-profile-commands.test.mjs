import { userDisplayNameSeed } from '../runtime/user/utils/display-name-seed.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import imageSize from 'image-size'

function load(path, name, dependencies = {}) {
  dependencies = {
    userDisplayNameSeed,
    useAuth: () => ({ currentUser: { value: { uid: 'actor' } } }),
    useCommandScope: () => () => () => true,
    captureCommandScope: () => ({ isCurrent: () => true, stop() {} }),
    ...dependencies,
  }
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const validation = '../runtime/user/utils/profile-validation.ts'
const readName = load(validation, 'readUserDisplayName')
const readChanges = load(validation, 'readUserProfileChanges')
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)

test('Creation, profile edits and form validation preserve the same name range', () => {
  const creation = load(
    '../runtime/user/server/user-handle/update.ts',
    'normalizeCreation',
    {
      readUserDisplayName: readName,
      createError,
      USER_ECOSYSTEM_AVATAR_SRC: '/img/ecosystem/avatar.png',
      resolveUserAvatarSource: () => '/img/ecosystem/avatar.png',
    }
  )
  const form = load(
    '../runtime/user/utils/user-formatting.ts',
    '({ DisplayName: USER_DISPLAY_NAME_FIELD })',
    { readUserDisplayName: readName }
  )
  for (const name of ['A', 'N'.repeat(60), 'N'.repeat(120)]) {
    assert.equal(creation({ display_name: name }).displayName, name)
    assert.equal(readChanges({ display_name: name }).display_name, name)
    assert.equal(form.DisplayName.validate(name).isValid, true)
  }
  for (const name of ['', ' ', 'N'.repeat(121)]) {
    assert.throws(() => creation({ display_name: name }))
    assert.throws(() => readChanges({ display_name: name }))
    assert.equal(form.DisplayName.validate(name).isValid, false)
  }
})

test('Profile saves accept nonempty name/bio patches and reject avatar or unknown fields', () => {
  assert.deepEqual(
    readChanges({ display_name: ' Ada ', bio: 'Line one\r\nLine two' }),
    {
      display_name: 'Ada',
      bio: 'Line one\nLine two',
    }
  )
  assert.deepEqual(readChanges({ bio: '' }), { bio: '' })
  for (const input of [
    {},
    [],
    null,
    { bio: 'x'.repeat(281) },
    { avatar: 'https://example.com/a.png' },
    { role: 'admin' },
    { display_name: 12 },
  ]) {
    assert.throws(() => readChanges(input))
  }
})

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR9sAAAAASUVORK5CYII=',
  'base64'
)
const storageUrl = (path) =>
  `https://firebasestorage.googleapis.com/v0/b/owned-bucket/o/${encodeURIComponent(path)}?alt=media&token=test`
const parseUrl = load(
  '../runtime/server/utils/uploads/storage.ts',
  'parseFirebaseStorageDownloadUrl'
)

function avatarHarness(options = {}) {
  const saved = [],
    deleted = []
  let selected = options.previous || storageUrl('users/actor/avatar/old')
  let sequence = 0,
    transactionCount = 0
  const update = load(
    '../runtime/user/server/avatar/update.ts',
    'updateUserAvatar',
    {
      randomUUID: () => `upload-${++sequence}`,
      imageSize,
      createError,
      requireFirebaseBearerUser: async () => {
        if (options.unauthenticated)
          throw createError({ statusCode: 401, statusMessage: 'Sign in' })
        return { uid: 'actor' }
      },
      readMultipartFormData: async () =>
        options.parts || [
          { name: 'avatar', data: png, type: 'untrusted/type' },
        ],
      setResponseHeaders: () => {},
      FIRESTORE_MUTATION_TARGETS: { users: { database: { kind: 'identity' } } },
      saveStorageFileWithDownloadToken: async (input) => {
        saved.push(input)
        return {
          ...input,
          bucketName: 'owned-bucket',
          fileUrl: storageUrl(input.objectPath),
        }
      },
      deleteStorageFileIfExists: async (input) => {
        deleted.push(input.objectPath)
      },
      parseFirebaseStorageDownloadUrl: parseUrl,
      runGuardedServerTransaction: async (_database, work) => {
        transactionCount++
        let patch
        if (transactionCount === 2 && options.selectBeforeCleanup)
          selected = options.selectBeforeCleanup
        const result = await work({
          read: async (_target, uid) => {
            assert.equal(uid, 'actor')
            if (transactionCount > 1 && options.verificationReadFails) {
              throw new Error('Verification read failed')
            }
            return {
              exists: options.exists !== false,
              data: { avatar: selected },
            }
          },
          update: (_target, uid, data) => {
            assert.equal(uid, 'actor')
            patch = data
          },
        })
        if (patch) {
          if (options.commitFails) throw new Error('Commit failed')
          selected = patch.avatar
          if (options.commitThenError)
            throw new Error('Commit result unavailable')
        }
        return result
      },
    }
  )
  return { update, saved, deleted, selected: () => selected }
}

test('Avatar command detects image bytes, attaches a unique file and cleans only the previous owned file', async () => {
  const h = avatarHarness()
  const result = await h.update({})
  assert.equal(result.avatar, h.selected())
  assert.equal(h.saved[0].contentType, 'image/png')
  assert.equal(h.saved[0].objectPath, 'users/actor/avatar/upload-1')
  assert.deepEqual(h.deleted, ['users/actor/avatar/old'])
  await h.update({})
  assert.equal(h.saved[1].objectPath, 'users/actor/avatar/upload-2')
  assert.equal(h.selected(), storageUrl('users/actor/avatar/upload-2'))
})

test('Failed User attachment cleans its new upload and preserves the old avatar', async () => {
  for (const options of [{ commitFails: true }, { exists: false }]) {
    const h = avatarHarness(options)
    await assert.rejects(h.update({}))
    assert.equal(h.selected(), storageUrl('users/actor/avatar/old'))
    assert.deepEqual(h.deleted, ['users/actor/avatar/upload-1'])
  }
})

test('An uncertain commit preserves the selected upload and returns the original error', async () => {
  const h = avatarHarness({ commitThenError: true })
  await assert.rejects(h.update({}), /Commit result unavailable/)
  assert.equal(h.selected(), storageUrl('users/actor/avatar/upload-1'))
  assert.deepEqual(h.deleted, [])
})

test('Failed attachment verification preserves the upload and original transaction error', async () => {
  const h = avatarHarness({ commitFails: true, verificationReadFails: true })
  await assert.rejects(h.update({}), /Commit failed/)
  assert.deepEqual(h.deleted, [])
})

test('Avatar cleanup never deletes another owner, external source, or a reselected previous file', async () => {
  for (const options of [
    { previous: storageUrl('users/other/avatar/old') },
    { previous: 'https://example.com/avatar.png' },
    { selectBeforeCleanup: storageUrl('users/actor/avatar/old') },
  ]) {
    const h = avatarHarness(options)
    await h.update({})
    assert.deepEqual(h.deleted, [])
  }
  const concurrent = avatarHarness({
    selectBeforeCleanup: storageUrl('users/actor/avatar/concurrent'),
  })
  await concurrent.update({})
  assert.equal(
    concurrent.selected(),
    storageUrl('users/actor/avatar/concurrent')
  )
  assert.deepEqual(concurrent.deleted, ['users/actor/avatar/old'])
})

test('Authentication and image validation fail before writing any storage object', async () => {
  for (const options of [
    { unauthenticated: true },
    { parts: [] },
    { parts: [{ name: 'avatar', data: Buffer.from('not an image') }] },
    { parts: [{ name: 'avatar', data: Buffer.alloc(10 * 1024 * 1024 + 1) }] },
  ]) {
    const h = avatarHarness(options)
    await assert.rejects(h.update({}))
    assert.equal(h.saved.length, 0)
  }
})

test('Profile avatar edits use one trusted upload command without a second profile write', async () => {
  const uploads = []
  const profile = load(
    '../runtime/user/composables/identity/useUserProfileUpdate.ts',
    'useUserProfileUpdate',
    {
      updateUserHandle: async () => ({}),
      useRequireUser: async () => ({ uid: 'actor' }),
      provisionSignedInUserAvatar: async (uid, source) => {
        assert.equal(uid, 'actor')
        uploads.push(source)
        return 'saved'
      },
    }
  )({ user: { value: { id: 'actor' } } })
  const blob = new Blob([png], { type: 'image/png' })
  assert.equal(await profile.avatar(blob), 'saved')
  assert.deepEqual(uploads, [blob])
})

test('Local uploads and external provisioning photos share the authenticated avatar request', async () => {
  const image = new Blob([png], { type: 'image/png' })
  for (const source of [image, 'https://example.com/photo.png']) {
    const requests = []
    const provision = load(
      '../runtime/user/utils/provision-user-avatar.ts',
      'provisionSignedInUserAvatar',
      {
        USER_ECOSYSTEM_AVATAR_SRC: '/img/ecosystem/avatar.png',
        useRequireUser: async () => ({
          uid: 'actor',
          getIdToken: async () => 'test-token',
        }),
        fetch: async (url, options) => {
          requests.push([url, options])
          return options.method === 'POST'
            ? { ok: true, json: async () => ({ ok: true, avatar: 'saved' }) }
            : { ok: true, blob: async () => image }
        },
      }
    )
    await assert.rejects(provision('other', source), /own profile/)
    assert.equal(requests.length, 0)
    assert.equal(await provision('actor', source), 'saved')
    const [url, options] = requests.at(-1)
    assert.equal(url, '/api/internal/user/avatar')
    assert.equal(options.headers.authorization, 'Bearer test-token')
    assert.equal(options.body.get('avatar').size, image.size)
    assert.equal(requests.length, typeof source === 'string' ? 2 : 1)
  }
})

test('Provisioning establishes User before an optional avatar and never replaces an existing selection', async () => {
  for (const created of [true, false]) {
    const calls = []
    const create = load(
      '../runtime/user/utils/provision-user.ts',
      'provisionUserIdentity',
      {
        USER_ECOSYSTEM_AVATAR_FALLBACK_SOURCE: '/img/ecosystem/avatar.png',
        updateUserHandle: async (_uid, handle, input) => {
          calls.push(['user', input.avatar])
          return { created, handle }
        },
        provisionSignedInUserAvatar: async (uid, source) => {
          assert.equal(uid, 'actor')
          calls.push(['avatar', source])
        },
      }
    )
    await create('actor', {
      displayName: 'Ada',
      avatar: 'https://example.com/avatar.png',
    })
    assert.deepEqual(calls[0], ['user', '/img/ecosystem/avatar.png'])
    assert.equal(calls.length, created ? 2 : 1)
  }
})

function handleCommandHarness(
  existingHandle,
  alterResponse = (result) => result
) {
  const writes = []
  const actor = { uid: 'actor', getIdToken: async () => 'token' }
  const server = load(
    '../runtime/user/server/user-handle/update.ts',
    'updateUserHandle',
    {
      useRuntimeConfig: () => ({
        public: { fireux: { reservedRouteKeys: [] } },
      }),
      validatePublicSlug: (handle) => ({ isValid: true, slug: handle }),
      readUserDisplayName: readName,
      createError,
      USER_ECOSYSTEM_AVATAR_SRC: '/img/ecosystem/avatar.png',
      resolveUserAvatarSource: (value) => value || '/img/ecosystem/avatar.png',
      readHttpsUrl: (value) =>
        typeof value === 'string' && value.startsWith('https://') ? value : '',
      FIREUX_ACCOUNT_TERMS_VERSION: 'terms',
      FIRESTORE_MUTATION_TARGETS: { users: { key: 'users', database: {} } },
      serverUserAccountTarget: () => ({ key: 'account' }),
      UserAccountStorage: { document: 'account' },
      FieldValue: {
        serverTimestamp: () => 'timestamp',
        delete: () => 'deleted',
      },
      runGuardedServerTransaction: async (_database, work) =>
        work({
          read: async (target) =>
            target.key === 'users'
              ? {
                  exists: Boolean(existingHandle),
                  data: existingHandle
                    ? {
                        handle: existingHandle,
                        display_name: 'Saved name',
                        bio: '',
                        avatar: 'https://example.com/saved.png',
                      }
                    : undefined,
                }
              : {
                  exists: true,
                  data: { terms: { version: 'terms', accepted_at: 1 } },
                },
          query: async () => (existingHandle ? [{ id: 'actor' }] : []),
          create: (_target, uid, data) =>
            writes.push({ action: 'create', uid, data }),
          update: (_target, uid, data) =>
            writes.push({ action: 'update', uid, data }),
        }),
    }
  )
  const client = load(
    '../runtime/user/utils/update-user-handle.ts',
    'updateUserHandle',
    {
      useAuth: () => ({ currentUser: { value: actor } }),
      useRequireUser: async () => actor,
      validateUserHandleForPublicRoute: (handle) => ({ isValid: true, handle }),
      fetch: async (_url, options) => ({
        ok: true,
        json: async () =>
          alterResponse(
            await server({
              uid: 'actor',
              payload: JSON.parse(options.body),
            })
          ),
      }),
    }
  )
  return { client, writes }
}

test('Provisioning accepts an existing customized handle and preserves saved identity', async () => {
  const h = handleCommandHarness('custom-handle')
  const result = await h.client('actor', 'auth-derived', {
    display_name: 'Auth name',
  })
  assert.deepEqual(result, {
    uid: 'actor',
    handle: 'custom-handle',
    created: false,
    changed: false,
  })
  assert.deepEqual(h.writes, [])
})

test('New User creation still requires the requested handle in its response', async () => {
  const h = handleCommandHarness('')
  assert.equal(
    (await h.client('actor', 'auth-derived', { display_name: 'Auth name' }))
      .created,
    true
  )
  assert.equal(h.writes[0].data.handle, 'auth-derived')
  const mismatched = handleCommandHarness('', (result) => ({
    ...result,
    handle: 'different',
  }))
  await assert.rejects(
    mismatched.client('actor', 'auth-derived', { display_name: 'Auth name' }),
    /response did not match/
  )
})

test('Handle edits reject a mismatched response and retain the requested command', async () => {
  const h = handleCommandHarness('custom-handle')
  assert.equal((await h.client('actor', 'new-handle')).handle, 'new-handle')
  assert.equal(h.writes[0].data.handle, 'new-handle')
  const mismatched = handleCommandHarness('custom-handle', (result) => ({
    ...result,
    handle: 'different',
  }))
  await assert.rejects(
    mismatched.client('actor', 'new-handle'),
    /response did not match/
  )
})

test('Retained provisioning handles require canonical text, exact User and boolean result fields', async () => {
  for (const changes of [
    { handle: '' },
    { handle: 'UPPERCASE' },
    { handle: 'wrong/handle' },
    { handle: 12 },
    { uid: 'other' },
    { changed: undefined },
    { created: undefined },
  ]) {
    const h = handleCommandHarness('custom-handle', (result) => ({
      ...result,
      ...changes,
    }))
    await assert.rejects(
      h.client('actor', 'auth-derived', { display_name: 'Auth name' }),
      /response did not match/
    )
  }
})
