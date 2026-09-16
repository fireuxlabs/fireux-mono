import assert from 'node:assert/strict'
import { createHash, timingSafeEqual, webcrypto } from 'node:crypto'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  computed,
  ref,
  toValue,
  effectScope,
  unref,
  watch,
  nextTick,
} from 'vue'
import { createError } from 'h3'
import {
  createMembershipAccess,
  readMembershipAccessIds,
} from 'fireux-core/runtime/app/utils/membership-access'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { resolveWorkspaceEntityCreationId } from 'fireux-core/runtime/server/utils/workspace-entity/creation-identity'
import {
  serverKitchenAccessTarget,
  resolveKitchenGrantIds,
} from '../../runtime/kitchen/server/core/access.ts'
import {
  kitchenAccessCollectionPath,
  readKitchenAccessIds,
} from '../../runtime/kitchen/utils/kitchen-access.ts'
import { KITCHEN_USER_LIMIT } from '../../runtime/kitchen/utils/kitchen-capacity.ts'
import { buildKitchenTeamMemberRecord } from '../../runtime/kitchen/server/team/member-record.ts'
import { createKitchenSystemMenus } from '../../runtime/kitchen/server/index/onboarding/system-menus.ts'

const runtime = new URL('../../runtime/', import.meta.url)
const core = new URL(
  '../../../../../core/fireux-core/src/runtime/',
  import.meta.url
)
function compile(url, name, dependencies) {
  const source = readFileSync(url, 'utf8')
    .replace(/^[\s\S]*<script setup[^>]*>([\s\S]*?)<\/script>[\s\S]*$/, '$1')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export \{[^\n]+\} from [^\n]+\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.server', 'false')
    .replaceAll('import.meta.client', 'true')
  return compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const created = { seconds: 10, nanoseconds: 20 }
const member = () => ({
  role: 'user',
  subscription: 'free',
  created: { at: created },
  updated: { at: created },
})

test('native Kitchen access clears on live removal, failed read and App membership replacement', () => {
  const source = Object.assign(
    ref({ ids: ['one'], membership_created_at: created }),
    { pending: ref(false), error: ref(), outcome: ref('ready') }
  )
  let locator
  const useMembershipAccess = compile(
    new URL('app/composables/useMembershipAccess.ts', core),
    'useMembershipAccess',
    {
      computed,
      toValue,
      readMembershipAccessIds,
      useFirestoreRead: () => ({
        firestoreFetchDoc: (path, id) => {
          locator = { path, id }
          return source
        },
      }),
    }
  )
  const session = {
    uid: ref('user'),
    appUser: ref(member()),
    pending: ref(false),
    error: ref(),
  }
  const useKitchenAccess = compile(
    new URL('kitchen/composables/useKitchenAccess.ts', runtime),
    'useKitchenAccess',
    {
      computed,
      useAppSession: () => session,
      useFireUXConfig: () => ({ appId: 'misebox-app' }),
      useMembershipAccess,
      kitchenAccessCollectionPath,
      KITCHEN_USER_LIMIT,
    }
  )
  const access = useKitchenAccess()
  assert.equal(locator.path.value, 'kitchen_access/misebox-app/users')
  assert.equal(locator.id.value, 'user')
  assert.deepEqual(access.ids.value, ['one'])
  source.value = { ids: [], membership_created_at: created }
  assert.deepEqual(access.ids.value, [])
  source.value = { ids: ['one'], membership_created_at: created }
  source.error.value = new Error('Read failed')
  assert.deepEqual(access.ids.value, [])
  assert.equal(access.outcome.value, 'error')
  source.error.value = undefined
  session.appUser.value = {
    ...member(),
    created: { at: { seconds: 10, nanoseconds: 21 } },
  }
  assert.deepEqual(access.ids.value, [])
  assert.equal(access.outcome.value, 'empty')
  session.appUser.value = null
  assert.equal(locator.id.value, null)
  assert.deepEqual(access.ids.value, [])
  session.appUser.value = member()
  session.pending.value = true
  assert.deepEqual(access.ids.value, [])
  assert.equal(access.outcome.value, 'pending')
})

function shellHarness({
  membership = member(),
  access,
  failCommit = false,
} = {}) {
  const records = new Map([['users/user', { display_name: 'Owner' }]])
  if (membership) records.set('apps/misebox-app/users/user', membership)
  if (access !== undefined)
    records.set('kitchen_access/misebox-app/users/user', access)
  const writes = []
  const target = (collectionPath) => ({ collectionPath })
  const path = (owner, id) => `${owner.collectionPath}/${id}`
  const snapshot = (owner, id) => ({
    id,
    exists: records.has(path(owner, id)),
    data: records.get(path(owner, id)),
  })
  const requireOnboardingMemberRole = compile(
    new URL('server/utils/workspace-entity/onboarding-authority.ts', core),
    'requireWorkspaceEntityMemberRole',
    { createError }
  )
  const command = compile(
    new URL('kitchen/server/index/onboarding/commands.ts', runtime),
    'createKitchenShell',
    {
      request: (value) => value,
      actor: async () => ({
        uid: 'user',
        appId: 'misebox-app',
        canCreate: true,
      }),
      text: (value) => String(value ?? '').trim(),
      fail: (statusCode, statusMessage) => {
        throw createError({ statusCode, statusMessage })
      },
      parseKitchenOnboardingBeneficiaryUserId: (actor, id) => id || actor.uid,
      assertKitchenOnboardingBeneficiaryAuthority: () => {},
      requireOnboardingMemberRole: (exists, role) =>
        requireOnboardingMemberRole({ exists, role, entityLabel: 'Kitchen' }),
      requireFirestoreDocumentId,
      resolveWorkspaceEntityCreationId,
      serverAppUsersTarget: (appId) => target(`apps/${appId}/users`),
      serverKitchenAccessTarget,
      serverKitchenTeamMembersTarget: (id) => target(`kitchens/${id}/team`),
      serverKitchenMenusTarget: (id) => target(`kitchens/${id}/menus`),
      FIRESTORE_MUTATION_TARGETS: {
        runtimeUsers: target('users'),
        places: target('places'),
        kitchens: target('kitchens'),
      },
      readKitchenAccessIds,
      resolveKitchenGrantIds,
      createMembershipAccess,
      normalizeSlug: (name) => name.toLowerCase().replaceAll(' ', '-'),
      serverAuditStamp: ({ by, appId }) => ({ at: created, by, app_id: appId }),
      buildKitchenTeamMemberRecord,
      createKitchenSystemMenus,
      runGuardedServerTransaction: async (_scope, run) => {
        const queued = []
        const tx = {
          read: async (owner, id) => snapshot(owner, id),
          readMany: async (owner, ids) => ids.map((id) => snapshot(owner, id)),
          readAll: async (owner, limit) => [...records].filter(([key]) => key.startsWith(owner.collectionPath + "/")).slice(0, limit).map(([key, data]) => ({ id: key.split("/").at(-1), data })),
          create: (owner, id, value) =>
            queued.push({ path: path(owner, id), value, verb: 'create' }),
          update: (owner, id, value) =>
            queued.push({ path: path(owner, id), value, verb: 'update' }),
        }
        const result = await run(tx)
        if (failCommit) throw new Error('Commit failed')
        for (const write of queued) {
          records.set(write.path, write.value)
          writes.push(write)
        }
        return result
      },
    }
  )
  return {
    records,
    writes,
    create: () => command({}, { intent: 'create_shell', name: 'My Kitchen' }),
  }
}

test('shell creation commits Kitchen, Place, menus, Team and scoped access without changing AppUser', async () => {
  const membership = member()
  const h = shellHarness({ membership })
  const result = await h.create()
  assert.equal(result.owner_user_id, 'user')
  assert.equal('app_user' in result, false)
  assert.deepEqual(h.records.get('kitchen_access/misebox-app/users/user'), {
    ids: ['user'],
    membership_created_at: created,
  })
  assert.equal(h.records.get('apps/misebox-app/users/user'), membership)
  assert.equal(
    h.writes.some((write) => write.path.startsWith('apps/')),
    false
  )
  for (const path of [
    'places/user',
    'kitchens/user',
    'kitchens/user/team/user',
  ])
    assert.ok(h.records.has(path), path)
  const menus = [...h.records].filter(([path]) => path.startsWith('kitchens/user/menus/'))
  assert.deepEqual(menus.map(([, value]) => value.slug).sort(), ['drinks', 'food'])
  assert.ok(menus.every(([path, value]) => path.split('/').at(-1) !== value.slug))
  assert.equal(h.records.has('kitchen_access/another-app/users/user'), false)
  const reopened = await h.create()
  assert.equal(reopened.created_root, false)
  assert.deepEqual(h.records.get('kitchen_access/misebox-app/users/user').ids, [
    'user',
  ])
})

test('missing App membership cannot be created implicitly by Kitchen onboarding', async () => {
  const h = shellHarness({ membership: null })
  await assert.rejects(h.create(), /Current App membership is required/)
  assert.equal(h.writes.length, 0)
})

test('malformed access blocks creation and retained access enforces subscription capacity', async () => {
  for (const access of [
    { ids: ['bad/path'], membership_created_at: created },
    { ids: ['existing'], membership_created_at: created },
  ]) {
    const h = shellHarness({ access })
    await assert.rejects(
      h.create(),
      /invalid stored ids|current subscription supports one Kitchen/
    )
    assert.equal(h.writes.length, 0)
    assert.equal(h.records.has('kitchens/user'), false)
  }
})

test('a stale membership grant cannot carry access into a recreated membership', async () => {
  const h = shellHarness({
    access: {
      ids: ['old-kitchen'],
      membership_created_at: { seconds: 9, nanoseconds: 20 },
    },
  })
  await h.create()
  assert.deepEqual(h.records.get('kitchen_access/misebox-app/users/user').ids, [
    'user',
  ])
})

test('a failed creation commit leaves neither Kitchen nor access', async () => {
  const h = shellHarness({ failCommit: true })
  await assert.rejects(h.create(), /Commit failed/)
  assert.equal(h.records.has('kitchens/user'), false)
  assert.equal(h.records.has('kitchen_access/misebox-app/users/user'), false)
  assert.equal(h.writes.length, 0)
})

test('Kitchen mutation authority requires the current App grant and ignores Team or legacy AppUser fields', async () => {
  const authority = compile(
    new URL('kitchen/server/core/mutation-authority.ts', runtime),
    'requireKitchenMutationAuthority',
    {
      createError,
      serverKitchenAccessTarget,
      readKitchenAccessIds,
      serverAppUsersTarget: (appId) => ({
        collectionPath: `apps/${appId}/users`,
      }),
      FIRESTORE_MUTATION_TARGETS: {
        kitchens: { collectionPath: 'kitchens' },
        places: { collectionPath: 'places' },
      },
      isAppUserSubscription: (value) =>
        ['free', 'premium', 'business'].includes(value),
    }
  )
  const membership = { ...member(), kitchens: ['kitchen'] }
  const records = new Map([
    ['apps/misebox-app/users/user', membership],
    ['kitchens/kitchen', { status: 'active' }],
    ['places/kitchen', { name: 'Place' }],
    ['kitchens/kitchen/team/user', { user_id: 'user' }],
    [
      'kitchen_access/another-app/users/user',
      { ids: ['kitchen'], membership_created_at: created },
    ],
  ])
  const tx = {
    read: async (target, id) => {
      const data = records.get(`${target.collectionPath}/${id}`)
      return { exists: data !== undefined, data }
    },
  }
  const actor = { runtimeAppId: 'misebox-app', uid: 'user' }
  await assert.rejects(
    authority(tx, actor, 'kitchen'),
    /Kitchen association is required/
  )
  records.set('kitchen_access/misebox-app/users/user', {
    ids: ['kitchen'],
    membership_created_at: created,
  })
  assert.equal(
    (await authority(tx, actor, 'kitchen')).ownerAppId,
    'misebox-app'
  )
  records.set('apps/misebox-app/users/user', {
    ...membership,
    created: { at: { seconds: 11, nanoseconds: 20 } },
  })
  await assert.rejects(
    authority(tx, actor, 'kitchen'),
    /Kitchen association is required/
  )
  records.set('kitchen_access/misebox-app/users/user', {
    ids: ['bad/path'],
    membership_created_at: created,
  })
  await assert.rejects(authority(tx, actor, 'kitchen'), /invalid stored ids/)
})

test('all 50 Kitchen and Place bindings stay live and revoke without retaining stale targets', async () => {
  const ids = Array.from({ length: 50 }, (_, index) => `kitchen-${index}`)
  const access = { ids: ref(ids), pending: ref(false), error: ref() }
  const bindings = new Map()
  const options = []
  const exactLoader = compile(
    new URL(
      'composables/fireux/firestore/operations/firestore-exact-doc-loader.ts',
      core
    ),
    'createFirestoreExactDocLoader',
    {
      computed,
      ref,
      unref,
      watch,
      effectScope,
      doc: (_db, collection, id) => `${collection}/${id}`,
      useDocument: (path) => {
        if (!bindings.has(path))
          bindings.set(
            path,
            Object.assign(ref({ name: path }), {
              pending: ref(false),
              error: ref(),
            })
          )
        return bindings.get(path)
      },
      guardFirestorePromise: () => {},
      attachDevCollectionMeta: (value) => value,
    }
  )
  const collection = compile(
    new URL(
      'kitchen/composables/workspace/index/useKitchenWorkspaceKitchens.ts',
      runtime
    ),
    'useKitchenWorkspaceKitchens',
    {
      computed,
      toValue,
      useKitchenAccess: () => access,
      useFirestoreRead: () => ({
        firestoreLoadDocsByIds: (input) => {
          options.push(input)
          return exactLoader({ resolveDb: () => ({}), options: input })
        },
      }),
      useKitchenInterface: () => ({
        surface: ({ kitchen, place }) =>
          place ? { id: kitchen.id, name: place.name } : null,
      }),
    }
  )
  const scope = effectScope()
  const state = scope.run(() => collection())
  try {
    await nextTick()
    assert.equal(state.count.value, 50)
    assert.equal(state.outcome.value, 'ready')
    assert.deepEqual(
      options.map((value) => value.collectionPath),
      ['kitchens', 'places']
    )
    assert.equal(options[0].ids.value.length, 50)
    assert.equal(options[1].ids.value.length, 50)
    assert.equal(bindings.size, 100)
    bindings.get('places/kitchen-49').value.name = 'Updated live'
    await nextTick()
    assert.equal(
      state.kitchens.value.find((value) => value.id === 'kitchen-49').name,
      'Updated live'
    )
    bindings.get('kitchens/kitchen-48').value = undefined
    await nextTick()
    assert.equal(state.count.value, 49)
    access.ids.value = ['kitchen-49']
    assert.equal(
      state.kitchens.value.some((value) => value.id !== 'kitchen-49'),
      false
    )
    await nextTick()
    assert.equal(state.count.value, 1)
    assert.equal(options[1].ids.value.length, 1)
    bindings.get('places/kitchen-49').error.value = new Error(
      'Place read failed'
    )
    await nextTick()
    assert.equal(state.outcome.value, 'error')
    assert.equal(state.count.value, 0)
    bindings.get('places/kitchen-49').error.value = undefined
    await nextTick()
    assert.equal(state.count.value, 1)
    access.ids.value = []
    assert.equal(state.count.value, 0)
    await nextTick()
    assert.equal(state.outcome.value, 'empty')
  } finally {
    scope.stop()
  }
})

function adoptionHarness({
  uid = 'account',
  membership = member(),
  ids = [],
  creator = 'guest',
  appId = 'misebox-app',
} = {}) {
  const records = new Map([
    [
      'kitchens/guest/claims/guest',
      {
        secret_hash: createHash('sha256').update('a'.repeat(64)).digest('hex'),
      },
    ],
    ['kitchens/guest', { created: { by: creator, app_id: appId } }],
    [
      'kitchens/guest/team/guest',
      { name: 'Guest', user_id: 'guest', role_ids: [] },
    ],
    [`users/${uid}`, { display_name: 'Owner' }],
  ])
  if (membership) {
    records.set(`apps/misebox-app/users/${uid}`, membership)
    records.set(
      `kitchen_access/misebox-app/users/${uid}`,
      createMembershipAccess(ids, membership)
    )
  }
  const target = (collectionPath) => ({ collectionPath })
  const command = compile(
    new URL('kitchen/server/index/onboarding/adoption.ts', runtime),
    'adoptAnonymousKitchen',
    {
      createError,
      createHash,
      timingSafeEqual,
      defineFirestoreMutationTarget,
      Buffer,
      requireFirestoreDocumentId,
      text: (value) => String(value ?? '').trim(),
      actor: async () => ({ uid, appId: 'misebox-app' }),
      serverAppUsersTarget: (id) => target(`apps/${id}/users`),
      serverKitchenTeamMembersTarget: (id) => target(`kitchens/${id}/team`),
      serverKitchenAccessTarget,
      readKitchenAccessIds,
      createMembershipAccess,
      resolveKitchenGrantIds,
      buildKitchenTeamMemberRecord,
      requireOnboardingMemberRole: (exists) => {
        if (!exists) throw createError({ statusCode: 403 })
      },
      FIRESTORE_MUTATION_TARGETS: {
        kitchens: target('kitchens'),
        runtimeUsers: target('users'),
      },
      runGuardedServerTransaction: async (_scope, run) => {
        const pending = []
        const key = (owner, id) => `${owner.collectionPath}/${id}`
        const result = await run({
          read: async (owner, id) => ({
            exists: records.has(key(owner, id)),
            data: records.get(key(owner, id)),
          }),
          create: (owner, id, value) =>
            pending.push(() => records.set(key(owner, id), value)),
          update: (owner, id, value) =>
            pending.push(() =>
              records.set(key(owner, id), {
                ...records.get(key(owner, id)),
                ...value,
              })
            ),
          delete: (owner, id) =>
            pending.push(() => records.delete(key(owner, id))),
        })
        pending.forEach((write) => write())
        return result
      },
    }
  )
  return {
    records,
    adopt: (token = 'a'.repeat(64)) =>
      command({}, { kitchen_id: 'guest', claim_secret: token }),
  }
}

test('anonymous adoption atomically grants current membership access and transfers the Team record; retry is harmless', async () => {
  const h = adoptionHarness()
  const root = h.records.get('kitchens/guest')
  assert.equal((await h.adopt()).adopted, true)
  assert.equal(h.records.has('kitchens/guest/team/guest'), false)
  assert.equal(h.records.get('kitchens/guest/team/account').user_id, 'account')
  assert.deepEqual(
    h.records.get('kitchen_access/misebox-app/users/account').ids,
    ['guest']
  )
  assert.equal(h.records.get('kitchens/guest'), root)
  assert.equal((await h.adopt()).adopted, false)
})

test('anonymous adoption rejects invalid proof, foreign creator/App, missing membership and exhausted allowance without writes', async () => {
  for (const options of [
    { creator: 'someone-else' },
    { appId: 'another-app' },
    { membership: null },
    { ids: ['existing'] },
  ]) {
    const h = adoptionHarness(options)
    const before = structuredClone([...h.records])
    await assert.rejects(h.adopt())
    assert.deepEqual([...h.records], before)
  }
  const h = adoptionHarness()
  await assert.rejects(h.adopt('invalid'))
})

test('same UID upgrade still grants access and retains the linked Team member', async () => {
  const h = adoptionHarness({ uid: 'guest' })
  await h.adopt()
  assert.equal(h.records.get('kitchens/guest/team/guest').user_id, 'guest')
  assert.deepEqual(
    h.records.get('kitchen_access/misebox-app/users/guest').ids,
    ['guest']
  )
})

test('guest start creates one unpublished Kitchen with default menus, resumes it, and cannot overwrite a foreign root', async () => {
  const records = new Map()
  const target = (collectionPath) => ({ collectionPath })
  let anonymous = true
  const start = compile(
    new URL('kitchen/server/index/onboarding/guest.ts', runtime),
    'startGuestKitchen',
    {
      readKitchenOnboardingRequest: (body) => body,
      hashGuestKitchenSecret: (secret) =>
        createHash('sha256').update(secret).digest('hex'),
      guestKitchenClaimTarget: (id) => target(`kitchens/${id}/claims`),
      requireFirebaseBearerUser: async () => ({
        uid: 'guest123',
        decoded: {
          firebase: { sign_in_provider: anonymous ? 'anonymous' : 'password' },
        },
      }),
      resolveWorkspaceEntityOnboardingPolicy: () => ({
        appId: 'misebox-app',
        canCreate: true,
      }),
      requireFirestoreDocumentId,
      fail: (statusCode, statusMessage) => {
        throw createError({ statusCode, statusMessage })
      },
      serverKitchenMenusTarget: (id) => target(`kitchens/${id}/menus`),
      serverKitchenTeamMembersTarget: (id) => target(`kitchens/${id}/team`),
      FIRESTORE_MUTATION_TARGETS: {
        kitchens: target('kitchens'),
        places: target('places'),
      },
      createKitchenSystemMenus,
      buildKitchenTeamMemberRecord,
      serverAuditStamp: ({ by, appId }) => ({ by, app_id: appId, at: created }),
      runGuardedServerTransaction: async (_scope, run) => {
        const writes = []
        const key = (owner, id) => `${owner.collectionPath}/${id}`
        const read = async (owner, id) => ({
          id,
          exists: records.has(key(owner, id)),
          data: records.get(key(owner, id)),
        })
        const result = await run({
          read,
          readAll: async (owner, limit) => [...records].filter(([key]) => key.startsWith(owner.collectionPath + "/")).slice(0, limit).map(([key, data]) => ({ id: key.split("/").at(-1), data })),
          readMany: (owner, ids) =>
            Promise.all(ids.map((id) => read(owner, id))),
          create: (owner, id, value) => writes.push([key(owner, id), value]),
          update: (owner, id, value) =>
            writes.push([
              key(owner, id),
              { ...records.get(key(owner, id)), ...value },
            ]),
        })
        writes.forEach(([key, value]) => records.set(key, value))
        return result
      },
    }
  )
  assert.equal(
    (await start({}, { claim_secret: 'b'.repeat(64) })).kitchen_id,
    'guest123'
  )
  assert.equal(records.get('kitchens/guest123').visibility, false)
  assert.equal(records.get('places/guest123').name, 'kitchen-guest1')
  assert.equal(records.size, 6)
  const before = structuredClone([...records])
  await start({}, { claim_secret: 'b'.repeat(64) })
  assert.deepEqual([...records], before)
  await start({}, { claim_secret: 'c'.repeat(64) })
  assert.equal(
    records.get('kitchens/guest123/claims/guest').secret_hash,
    createHash('sha256').update('c'.repeat(64)).digest('hex')
  )
  assert.deepEqual(
    records.get('places/guest123'),
    before.find(([key]) => key === 'places/guest123')[1]
  )
  anonymous = false
  await assert.rejects(start({}, { claim_secret: 'b'.repeat(64) }))
  anonymous = true
  records.get('kitchens/guest123').created.by = 'another-person'
  await assert.rejects(start({}, { claim_secret: 'b'.repeat(64) }))
})

test('claimed recovery key cannot restore removed access or be replayed by another account', async () => {
  const h = adoptionHarness()
  await h.adopt()
  h.records.get('kitchen_access/misebox-app/users/account').ids = []
  await assert.rejects(h.adopt(), /no longer has access/)
  h.records.get('kitchens/guest/claims/guest').claimed_by = 'another-account'
  await assert.rejects(h.adopt(), /another account/)
})

test('browser recovery survives time and reload, stays App-scoped, and clears only the completed proof', async (t) => {
  const stored = new Map()
  const localStorage = {
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, value),
    removeItem: (key) => stored.delete(key),
  }
  const load = () =>
    compile(
      new URL('kitchen/utils/guest-kitchen-claim.ts', runtime),
      '{ readGuestKitchenClaim, rememberGuestKitchenClaim, clearGuestKitchenClaim }',
      {
        localStorage,
        crypto: webcrypto,
        navigator: { locks: { request: async (_key, run) => run() } },
      }
    )
  const first = load()
  const claim = await first.rememberGuestKitchenClaim('app', 'guest')
  assert.match(claim.secret, /^[a-f0-9]{64}$/)
  t.mock.method(Date, 'now', () => Date.UTC(2040, 0, 1))
  const later = load()
  assert.deepEqual(later.readGuestKitchenClaim('app'), claim)
  assert.equal(later.readGuestKitchenClaim('another-app'), null)
  assert.deepEqual(await later.rememberGuestKitchenClaim('app', 'guest'), claim)
  later.clearGuestKitchenClaim('app', { ...claim, secret: 'wrong' })
  assert.deepEqual(later.readGuestKitchenClaim('app'), claim)
  later.clearGuestKitchenClaim('app', claim)
  assert.equal(later.readGuestKitchenClaim('app'), null)
})

test('adopted Kitchen becomes selected only after the live collection contains it', async () => {
  const adopted = ref('guest')
  const selectedId = ref('existing')
  const kitchens = ref([{ id: 'existing' }])
  const outcome = ref('ready')
  const useIndex = compile(
    new URL(
      'kitchen/composables/workspace/index/useKitchenWorkspaceIndex.ts',
      runtime
    ),
    'useKitchenWorkspaceIndex',
    {
      watch,
      useState: () => adopted,
      useFireUXConfig: () => ({ appId: 'app' }),
      useKitchenWorkspaceKitchens: () => ({ kitchens, outcome }),
      useWorkspace: () => ({
        selectedId,
        select: (id) => {
          selectedId.value = id
        },
        reconcile: (ids, state) => {
          if (state === 'ready' && !ids.includes(selectedId.value))
            selectedId.value = ids[0] || ''
        },
      }),
    }
  )
  const scope = effectScope()
  scope.run(useIndex)
  assert.equal(selectedId.value, 'existing')
  kitchens.value = [{ id: 'existing' }, { id: 'guest' }]
  await nextTick()
  assert.equal(selectedId.value, 'guest')
  assert.equal(adopted.value, '')
  scope.stop()
})

test('auth waits for the User read and navigates directly to the required destination once', async () => {
  for (const outcome of ['missing', 'ready']) {
    const coreOutcome = ref('pending')
    const authState = ref('AUTHENTICATED')
    const route = { path: '/auth', query: {} }
    const destinations = []
    const scope = effectScope()
    scope.run(() =>
      compile(
        new URL('components/Auth/System.vue', core),
        'resolvedPostAuthPath',
        {
          computed,
          ref,
          watch,
          useRoute: () => route,
          useRouter: () => ({
            replace: async (path) => {
              destinations.push(path)
              route.path = path
            },
          }),
          useAuth: () => ({
            authState,
            hasAuthState: ref(true),
            lastBindError: ref(null),
            signInWithGoogle: async () => {},
          }),
          useUserSession: () => ({ coreOutcome, coreError: ref(null) }),
          useFireUXConfig: () => ({ ecosystem: 'misebox', isTenant: false }),
          userOnboardingPath: () => '/users/create',
        }
      )
    )
    await nextTick()
    assert.deepEqual(destinations, [])
    coreOutcome.value = outcome
    await nextTick()
    assert.deepEqual(destinations, [
      outcome === 'missing' ? '/users/create' : '/dashboard',
    ])
    scope.stop()
  }
})
