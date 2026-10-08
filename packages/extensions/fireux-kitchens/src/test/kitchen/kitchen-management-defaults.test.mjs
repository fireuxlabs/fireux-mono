import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const load = (path, names, deps = {}) =>
  compileFunction(
    `${stripTypeScriptTypes(
      readFileSync(new URL(path, import.meta.url), 'utf8')
        .replace(/import[\s\S]*?from ['"][^'"]+['"]\n/g, '')
        .replace(/^export \{[^}]+\} from [^\n]+\n/gm, '')
        .replace(/^export /gm, '')
    )}\nreturn {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
const base = '../../runtime/kitchen/server/'
const { buildKitchenSystemMenu, KitchenSystemMenuKinds } = load(
  '../../runtime/menu/utils/kitchen-system-menus.ts',
  'buildKitchenSystemMenu, KitchenSystemMenuKinds'
)
const defaults = load(
  `${base}index/onboarding/system-menus.ts`,
  'readKitchenManagementMenus, ensureKitchenManagementMenus',
  {
    randomUUID: (() => {
      let n = 0
      return () => `new-${++n}`
    })(),
    buildKitchenSystemMenu,
    KitchenSystemMenuKinds,
  }
)
const station = load(
  `${base}stations/default.ts`,
  'createDefaultKitchenStation, kitchenStationsTarget',
  {
    assertFirestoreMutationSegment: (x) => x,
    defineFirestoreMutationTarget: (x) => x.collectionPath,
  }
)
function harness({
  exists = true,
  menus = [],
  pass = false,
  allowed = true,
} = {}) {
  const writes = []
  let writing = false
  const tx = {
    read: async (target, id) => {
      assert.equal(writing, false, 'all reads precede writes')
      if (target === 'kitchens') return { exists, data: { slug: 'venue' } }
      if (target === 'team') return { exists, data: { user_id: 'actor' } }
      if (target === 'menus') throw Error('query expected')
      if (target.endsWith('/stations'))
        return { exists: pass, data: { name: 'Custom Pass' } }
      if (target === 'places') return { exists: true, data: { name: 'Venue' } }
      if (target === 'users')
        return { exists: true, data: { display_name: 'Operator' } }
      return {
        exists: true,
        data: { role: 'user', created: { at: 1 }, user_id: 'actor' },
      }
    },
    readAll: async () => menus,
    create: (target, id, data) => {
      writing = true
      writes.push({ target, id, data })
    },
    update: (target, id, data) => {
      writing = true
      writes.push({ target, id, data })
    },
  }
  const dependencies = {
    ...defaults,
    ...station,
    runGuardedServerTransaction: async (_, fn) => fn(tx),
    actor: async () => ({ uid: 'actor', appId: 'app', canCreate: true }),
    request: (x) => x,
    parseKitchenOnboardingBeneficiaryUserId: () => 'actor',
    resolveKitchenOnboardingTransactionLocator: () => ({
      kitchenId: 'venue',
      placeId: 'venue',
      requireExistingKitchen: false,
    }),
    serverAppUsersTarget: () => 'members',
    serverKitchenAccessTarget: () => 'access',
    serverKitchenTeamMembersTarget: () => 'team',
    serverKitchenMenusTarget: () => 'menus',
    FIRESTORE_MUTATION_TARGETS: {
      runtimeUsers: 'users',
      places: 'places',
      kitchens: 'kitchens',
    },
    requireOnboardingMemberRole: () => 'user',
    assertKitchenOnboardingBeneficiaryAuthority: () => {},
    assertKitchenOnboardingPlaceDefaults: () => {},
    readKitchenAccessIds: () => ['venue'],
    createMembershipAccess: (x) => x,
    withKitchenAppAccess: (_, appId, grant) => ({ apps: { [appId]: grant } }),
    resolveKitchenGrantIds: () => ['venue'],
    kitchenOnboardingAccessDecision: () => ({
      can_complete: allowed,
      action: allowed ? 'open' : 'request_access',
    }),
    text: (x) => String(x || ''),
    normalizeSlug: (x) => x,
    serverAuditStamp: (x) => x,
    buildKitchenTeamMemberRecord: (x) => x,
    fail: (_, message) => {
      throw Error(message || 'denied')
    },
  }
  const { completeKitchenOnboarding } = load(
    `${base}index/onboarding/commands.ts`,
    'completeKitchenOnboarding',
    dependencies
  )
  return {
    writes,
    run: () => completeKitchenOnboarding({}, { place_id: 'venue' }),
  }
}
test('authorized existing directory root gains draft defaults and Pass without recreating root', async () => {
  const h = harness()
  await h.run()
  assert.deepEqual(
    h.writes.filter((x) => x.target === 'menus').map((x) => x.data.slug),
    ['food', 'drinks']
  )
  assert.equal(
    h.writes.some((x) => x.target === 'kitchens'),
    false
  )
  assert.equal(h.writes.find((x) => x.target.endsWith('/stations')).id, 'pass')
})
test('new management root gets the same defaults', async () => {
  const h = harness({ exists: false })
  await h.run()
  assert.equal(h.writes.filter((x) => x.target === 'kitchens').length, 1)
  assert.equal(h.writes.filter((x) => x.target === 'menus').length, 2)
})
test('existing customized/archived defaults and Pass are preserved; only missing kind added', async () => {
  const menus = [
    {
      id: 'food-id',
      data: { slug: 'food', status: 'archived', name: 'Custom' },
    },
  ]
  const before = structuredClone(menus)
  const h = harness({ menus, pass: true })
  await h.run()
  assert.deepEqual(menus, before)
  assert.deepEqual(
    h.writes.filter((x) => x.target === 'menus').map((x) => x.data.slug),
    ['drinks']
  )
  assert.equal(
    h.writes.some((x) => x.target.endsWith('/stations')),
    false
  )
})
test('repeated management completion adds no duplicate defaults', async () => {
  const h = harness({
    menus: [
      { id: 'f', data: { slug: 'food' } },
      { id: 'd', data: { slug: 'drinks' } },
    ],
    pass: true,
  })
  await h.run()
  assert.deepEqual(
    h.writes.map((x) => x.target),
    ['access']
  )
})
test('denied association writes no defaults or authority', async () => {
  const h = harness({ allowed: false })
  await assert.rejects(h.run())
  assert.deepEqual(h.writes, [])
})

test('management Menu read includes later pages before deciding missing defaults', async () => {
  const first = Array.from({ length: 1000 }, (_, i) => ({ id: `m${i}`, data: { slug: `custom-${i}` } }))
  const calls = []
  const result = await defaults.readKitchenManagementMenus({ readAll: async (_target, limit, after) => {
    calls.push({ limit, after })
    return after ? [{ id: 'last', data: { slug: 'food' } }] : first
  } }, 'menus')
  assert.equal(result.length, 1001)
  assert.deepEqual(calls, [{ limit: 1000, after: undefined }, { limit: 1000, after: 'm999' }])
})
