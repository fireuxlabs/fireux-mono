import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  readKitchenTeamAccountLinkInTransaction,
  requireUnambiguousKitchenTeamLink,
} from '../../runtime/kitchen/server/team/account-link.ts'
import { resolveKitchenAllowance } from '../../runtime/kitchen/utils/kitchen-capacity.ts'
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
const { kitchenOnboardingAccessDecision } = load(
  `${base}index/onboarding/onboarding-policy.ts`,
  'kitchenOnboardingAccessDecision',
  { resolveKitchenAllowance }
)
function harness({
  exists = true,
  grants = ['venue'],
  role = 'user',
  team = exists ? [{ id: 'actor', data: { user_id: 'actor' } }] : [],
} = {}) {
  const writes = []
  let writing = false
  const tx = {
    read: async (target, id) => {
      assert.equal(writing, false, 'all reads precede writes')
      if (target === 'kitchens') return { exists, data: { slug: 'venue' } }
      if (target === 'team') {
        const row = team.find((member) => member.id === id)
        return { exists: Boolean(row), data: row?.data }
      }
      assert.ok(
        !target.endsWith('/stations'),
        'Onboarding does not read Stations'
      )
      if (target === 'places') return { exists: true, data: { name: 'Venue' } }
      if (target === 'users')
        return { exists: true, data: { display_name: 'Operator' } }
      return {
        exists: true,
        data: {
          role,
          subscription: 'free',
          created: { at: 1 },
          user_id: 'actor',
        },
      }
    },
    readAll: async () =>
      assert.fail('Kitchen Core must not list capability records'),
    query: async (target, { field, op, value, limit }) => {
      assert.equal(target, 'team')
      assert.equal(writing, false)
      assert.equal(op, '==')
      return team.filter((row) => row.data[field] === value).slice(0, limit)
    },
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
    readKitchenTeamAccountLinkInTransaction,
    requireUnambiguousKitchenTeamLink,
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
    USER_MUTATION_TARGETS: { runtimeUsers: 'users' },
    PLACE_MUTATION_TARGETS: { places: 'places' },
    KITCHEN_MUTATION_TARGETS: { kitchens: 'kitchens' },
    requireOnboardingMemberRole: () => role,
    assertKitchenOnboardingBeneficiaryAuthority: () => {},
    assertKitchenOnboardingPlaceDefaults: () => {},
    readKitchenAccessIds: () => grants,
    createMembershipAccess: (x) => x,
    withKitchenAppAccess: (_, appId, grant) => ({ apps: { [appId]: grant } }),
    resolveKitchenGrantIds: () => ['venue'],
    kitchenOnboardingAccessDecision,
    text: (x) => String(x || ''),
    normalizeSlug: (x) => x,
    serverAuditStamp: ({ by, appId }) => ({
      at: { seconds: 10, nanoseconds: 20 },
      by,
      ...(appId ? { app_id: appId } : {}),
    }),
    fail: (_, message) => {
      throw Error(message || 'denied')
    },
  }
  const { completeKitchenOnboarding } = load(
    `${base}index/onboarding/complete.ts`,
    'completeKitchenOnboarding',
    dependencies
  )
  return {
    writes,
    run: () => completeKitchenOnboarding({}, { place_id: 'venue' }),
  }
}
test('creating from an existing Place writes only a Kitchen and owner grant', async () => {
  const h = harness({ exists: false, grants: [] })
  const result = await h.run()
  assert.equal(result.created_root, true)
  assert.equal(result.created_team_member, false)
  assert.deepEqual(
    h.writes.map((write) => write.target),
    ['kitchens', 'access']
  )
  const root = h.writes[0].data
  assert.deepEqual(root.identity, {
    source: 'place',
    slug: 'Venue',
    status: 'active',
    visibility: true,
  })
  assert.deepEqual(root.created, {
    at: { seconds: 10, nanoseconds: 20 },
    by: 'actor',
    app_id: 'app',
  })
  assert.deepEqual(root.updated, { at: root.created.at, by: 'actor' })
})

test('an existing empty Kitchen opens with a current grant and no roster row', async () => {
  const h = harness({ team: [] })
  const result = await h.run()
  assert.equal(result.action, 'open')
  assert.equal(result.created_root, false)
  assert.equal(result.created_team_member, false)
  assert.deepEqual(
    h.writes.map((write) => write.target),
    ['access']
  )
})

test('denied association writes no defaults or authority', async () => {
  const h = harness({ grants: [], team: [] })
  await assert.rejects(h.run())
  assert.deepEqual(h.writes, [])
})

test('explicit Add reuses a uniquely linked roster member under either ID', async () => {
  for (const id of ['actor', 'existing-roster-uuid']) {
    const team = [{ id, data: { user_id: 'actor', role_ids: ['cook'] } }]
    for (const grants of [[], ['venue']]) {
      const h = harness({ team, grants })
      const result = await h.run()
      assert.equal(result.action, grants.length ? 'open' : 'connect')
      assert.equal(result.created_team_member, false)
      assert.deepEqual(
        h.writes.map((write) => write.target),
        ['access']
      )
    }
  }
})

test('an ambiguous or mismatched link cannot create a roster record or grant', async () => {
  const linked = { user_id: 'actor' }
  for (const team of [
    [{ id: 'actor', data: { user_id: 'someone-else' } }],
    [
      { id: 'actor', data: linked },
      { id: 'duplicate', data: linked },
    ],
  ]) {
    const h = harness({ grants: [], team })
    await assert.rejects(h.run(), { statusCode: 409 })
    assert.deepEqual(h.writes, [])
  }
  const h = harness({
    grants: ['other-kitchen'],
    team: [{ id: 'uuid', data: linked }],
  })
  await assert.rejects(h.run(), /plan includes one kitchen/)
  assert.deepEqual(h.writes, [])
})
