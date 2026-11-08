import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, watch } from 'vue'
import { validatePublicSlug } from '../runtime/utils/slug/validate-public-slug.ts'
import { userDisplayNameSeed } from '../runtime/user/utils/display-name-seed.ts'

function load(path, name, dependencies) {
  const source = readFileSync(
    new URL('../runtime/' + path, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + '; return ' + name,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

const captureCommandScope = load(
  'composables/fireux/commands/useCommandScope.ts',
  'captureCommandScope',
  { watch }
)
const readUserDisplayName = load(
  'user/utils/profile-validation.ts',
  'readUserDisplayName',
  {}
)
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)

function harness(options = {}) {
  const records = new Map(options.records)
  const requests = [],
    writes = [],
    uploads = []
  const actor = {
    uid: options.uid || 'alice111111111111',
    getIdToken: async () => 'token',
  }
  const currentUser = ref(actor)
  let conflicts = options.conflicts || 0
  const validateUserHandleForPublicRoute = load(
    'user/utils/user-handle.ts',
    'validateUserHandleForPublicRoute',
    { useRuntimeConfig: () => ({}), validatePublicSlug }
  )
  const server = load('user/server/user-handle/update.ts', 'updateUserHandle', {
    useRuntimeConfig: () => ({}),
    validatePublicSlug,
    readUserDisplayName,
    createError,
    USER_ECOSYSTEM_AVATAR_SRC: '/img/ecosystem/avatar.png',
    resolveUserAvatarSource: (source) => source || '/img/ecosystem/avatar.png',
    readHttpsUrl: (source) =>
      typeof source === 'string' && source.startsWith('https://') ? source : '',
    FIREUX_ACCOUNT_TERMS_VERSION: 'current-terms',
    UserAccountStorage: { document: 'account' },
    USER_MUTATION_TARGETS: { users: { key: 'users', database: 'identity' } },
    serverUserAccountTarget: () => ({ key: 'account' }),
    FieldValue: {
      serverTimestamp: () => 'server-time',
      delete: () => 'deleted',
    },
    runGuardedServerTransaction: async (_database, run) =>
      run({
        read: async (target, uid) =>
          target.key === 'users'
            ? { exists: records.has(uid), data: records.get(uid) }
            : {
                exists: options.currentTerms !== false,
                data: { terms: { version: 'current-terms', accepted_at: 1 } },
              },
        query: async (_target, input) => {
          if (conflicts > 0) {
            conflicts--
            return [{ id: 'another-person' }]
          }
          return [...records]
            .filter(([, data]) => data.handle === input.value)
            .map(([id, data]) => ({ id, data }))
        },
        create: (_target, uid, data) => {
          assert.equal(uid, actor.uid)
          writes.push({ uid, data })
          records.set(uid, data)
        },
        update: (_target, uid, data) => {
          assert.equal(uid, actor.uid)
          writes.push({ uid, data })
          records.set(uid, { ...records.get(uid), ...data })
        },
      }),
  })
  const dependencies = {
    refreshNuxtData: async () => {},
    useAuth: () => ({ currentUser }),
    captureCommandScope,
    useRequireUser: async () => actor,
    validateUserHandleForPublicRoute,
  }
  const updateUserHandle = load(
    'user/utils/update-user-handle.ts',
    'updateUserHandle',
    {
      ...dependencies,
      fetch: async (_url, request) => {
        const payload = JSON.parse(request.body)
        requests.push(payload)
        let response
        try {
          response = {
            ok: true,
            status: 200,
            json: async () => await server({ uid: actor.uid, payload }),
          }
          // Execute the trusted command before the simulated HTTP response arrives.
          const result = await response.json()
          response.json = async () => result
        } catch (error) {
          response = {
            ok: false,
            status: error.statusCode,
            json: async () => ({
              statusMessage: error.message,
              data: error.data,
            }),
          }
        }
        options.afterResponse?.({ currentUser, actor, requests, response })
        return response
      },
    }
  )
  const provision = load(
    'user/utils/provision-user.ts',
    'provisionUserIdentity',
    {
      ...dependencies,
      updateUserHandle,
      userDisplayNameSeed,
      USER_ECOSYSTEM_AVATAR_SRC: '/img/ecosystem/avatar.png',
      provisionSignedInUserAvatar: async (...args) => uploads.push(args),
    }
  )
  return { provision, records, requests, writes, uploads, currentUser, actor }
}

test('long identical names retain distinct UID discriminators and pass shared handle validation', async () => {
  const handles = []
  for (const uid of ['alice111111111111', 'bobby222222222222']) {
    const h = harness({ uid })
    const result = await h.provision(uid, {
      displayName: 'Daniel Watson'.repeat(8),
    })
    assert.equal(h.requests.length, 1)
    assert.equal(h.writes.length, 1)
    assert.equal(result.handle, h.writes[0].data.handle)
    assert.ok(result.handle.includes(uid.slice(0, 8)))
    assert.ok(result.handle.length <= 30)
    const validated = validatePublicSlug(result.handle, {
      required: true,
      minLength: 3,
      maxLength: 30,
      reservedScope: 'root',
    })
    assert.equal(validated.isValid, true)
    assert.equal(validated.slug, result.handle)
    handles.push(result.handle)
  }
  assert.notEqual(handles[0], handles[1])
})

test('only structured handle conflicts retry, using distinct bounded candidates and one captured input', async () => {
  const input = {
    displayName: 'A long name'.repeat(10),
    avatar: 'https://example.test/original.png',
  }
  const h = harness({
    conflicts: 2,
    afterResponse: () => {
      input.displayName = 'Changed after dispatch'
      input.avatar = 'https://example.test/changed.png'
    },
  })
  const result = await h.provision(h.actor.uid, input)
  assert.equal(h.requests.length, 3)
  assert.equal(new Set(h.requests.map((request) => request.handle)).size, 3)
  assert.ok(h.requests.every((request) => request.handle.length <= 30))
  assert.ok(
    h.requests.every(
      (request) => request.create.display_name === 'A long name'.repeat(10)
    )
  )
  assert.equal(h.writes.length, 1)
  assert.equal(result.handle, h.requests[2].handle)
  assert.equal(h.uploads[0][1], 'https://example.test/original.png')
})

test('handle conflict exhaustion stops after five attempts without writes or avatar uploads', async () => {
  const h = harness({ conflicts: 100 })
  await assert.rejects(
    h.provision(h.actor.uid, {
      displayName: 'Daniel Watson',
      avatar: 'https://example.test/avatar.png',
    }),
    {
      statusCode: 409,
      data: { code: 'USER_HANDLE_UNAVAILABLE' },
    }
  )
  assert.equal(h.requests.length, 5)
  assert.equal(new Set(h.requests.map((request) => request.handle)).size, 5)
  assert.deepEqual(h.writes, [])
  assert.deepEqual(h.uploads, [])
})

test('consent failures remain immediate and never become handle retries', async () => {
  const h = harness({ currentTerms: false })
  await assert.rejects(
    h.provision(h.actor.uid, { displayName: 'Daniel Watson' }),
    { statusCode: 409 }
  )
  assert.equal(h.requests.length, 1)
  assert.deepEqual(h.writes, [])
})

test('repeated bootstrap retains an existing canonical handle and selected avatar', async () => {
  const uid = 'alice111111111111'
  const saved = {
    handle: 'custom-handle',
    display_name: 'Saved name',
    bio: 'Saved bio',
    avatar: 'https://example.test/saved.png',
  }
  const h = harness({ uid, records: [[uid, saved]] })
  const result = await h.provision(uid, {
    displayName: 'New Auth name',
    avatar: 'https://example.test/new.png',
  })
  assert.equal(result.handle, saved.handle)
  assert.equal(result.created, false)
  assert.deepEqual(h.records.get(uid), saved)
  assert.deepEqual(h.writes, [])
  assert.deepEqual(h.uploads, [])
})

test('explicit bootstrap repairs invalid saved names without renaming their canonical handle', async () => {
  const uid = 'alice111111111111'
  for (const display_name of ['N'.repeat(121), 42]) {
    const saved = {
      handle: 'custom-handle',
      display_name,
      bio: 'Saved bio',
      avatar: 'https://example.test/saved.png',
    }
    const h = harness({ uid, records: [[uid, saved]] })
    const result = await h.provision(uid, { displayName: 'Repaired name' })
    assert.equal(result.created, false)
    assert.equal(result.handle, 'custom-handle')
    assert.equal(h.requests.length, 1)
    assert.deepEqual(h.writes, [
      {
        uid,
        data: {
          display_name: 'Repaired name',
          updated: { at: 'server-time', by: uid },
        },
      },
    ])
    assert.deepEqual(h.records.get(uid), {
      ...saved,
      display_name: 'Repaired name',
      updated: { at: 'server-time', by: uid },
    })
  }
})

test('bootstrap preserves a valid saved name at the shared maximum length', async () => {
  const uid = 'alice111111111111'
  const saved = {
    handle: 'custom-handle',
    display_name: 'N'.repeat(120),
    bio: 'Saved bio',
    avatar: 'https://example.test/saved.png',
  }
  const h = harness({ uid, records: [[uid, saved]] })
  await h.provision(uid, { displayName: 'New Auth name' })
  assert.deepEqual(h.records.get(uid), saved)
  assert.deepEqual(h.writes, [])
})

for (const change of ['account-round-trip', 'owner-disposal']) {
  test(`a conflict cannot dispatch a retry after ${change}`, async () => {
    let ownerCurrent = true
    const h = harness({
      conflicts: 2,
      afterResponse: ({ currentUser, actor }) => {
        if (change === 'account-round-trip') {
          currentUser.value = { uid: 'other-person' }
          currentUser.value = actor
        } else ownerCurrent = false
      },
    })
    await assert.rejects(
      h.provision(
        h.actor.uid,
        { displayName: 'Daniel Watson' },
        () => ownerCurrent
      ),
      /context changed/
    )
    assert.equal(h.requests.length, 1)
    assert.deepEqual(h.writes, [])
    assert.deepEqual(h.uploads, [])
  })
}

test('an obsolete successful creation cannot start the follow-on avatar upload', async () => {
  let ownerCurrent = true
  const h = harness({
    afterResponse: () => {
      ownerCurrent = false
    },
  })
  await assert.rejects(
    h.provision(
      h.actor.uid,
      {
        displayName: 'Daniel Watson',
        avatar: 'https://example.test/avatar.png',
      },
      () => ownerCurrent
    ),
    /context changed/
  )
  assert.equal(h.writes.length, 1)
  assert.equal(h.requests.length, 1)
  assert.deepEqual(h.uploads, [])
})
