import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'
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
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export \{[^\n]+\} from [^\n]+\n/gm, '')
    .replace(/^export /gm, '')
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
      KitchenSystemMenuKinds: ['food', 'drinks'],
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
    'kitchens/user/menus/food',
    'kitchens/user/menus/drinks',
  ])
    assert.ok(h.records.has(path), path)
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
