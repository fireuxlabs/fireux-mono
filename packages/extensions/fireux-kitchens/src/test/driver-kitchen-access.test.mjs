import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { createError } from 'h3'
import { planDriverKitchenLinks } from '../runtime/user/utils/driver/kitchen-links.ts'
import { readKitchenAccessIds } from '../runtime/kitchen/utils/kitchen-access.ts'

const kitchen = { slug: 'venue', identity: { display_name: 'Kitchen' } }
const grant = { action: 'grant', driver_id: 'driver', kitchen_id: 'k' }
const empty = () => ({ kitchen_links: [], active_kitchen_ids: [] })
const link = (id, active = true) => ({
  app_id: 'app',
  kitchen_id: id,
  kitchen_slug: 'venue',
  kitchen_name: 'Kitchen',
  relation: 'available',
  active,
})

test('Driver grant uses Kitchen presentation without mutating saved state or input', () => {
  const driver = empty(),
    before = structuredClone(driver),
    input = { ...grant, relation: 'preferred' }
  const result = planDriverKitchenLinks(driver, 'app', input, kitchen)
  assert.deepEqual(result, {
    ok: true,
    changed: true,
    links: [{ ...link('k'), relation: 'preferred' }],
    activeKitchenIds: ['k'],
  })
  assert.deepEqual(driver, before)
  assert.equal(input.relation, 'preferred')
})

test('Driver revoke retains the relationship and makes repeated grant/revoke a no-op', () => {
  const driver = {
    kitchen_links: [link('k'), link('other')],
    active_kitchen_ids: ['k', 'other'],
  }
  assert.equal(
    planDriverKitchenLinks(driver, 'app', grant, kitchen).changed,
    false
  )
  const revoked = planDriverKitchenLinks(
    driver,
    'app',
    { ...grant, action: 'revoke' },
    kitchen
  )
  assert.deepEqual(revoked.activeKitchenIds, ['other'])
  assert.equal(revoked.links[0].active, false)
  assert.deepEqual(revoked.links[1], link('other'))
  assert.equal(
    planDriverKitchenLinks(
      {
        kitchen_links: revoked.links,
        active_kitchen_ids: revoked.activeKitchenIds,
      },
      'app',
      { ...grant, action: 'revoke' },
      kitchen
    ).changed,
    false
  )
})

test('Driver capacity counts retained links and permits changes to an existing link', () => {
  const links = Array.from({ length: 50 }, (_, i) => link(`k-${i}`))
  const driver = {
    kitchen_links: links,
    active_kitchen_ids: links.map((x) => x.kitchen_id),
  }
  assert.deepEqual(planDriverKitchenLinks(driver, 'app', grant, kitchen), {
    ok: false,
    reason: 'reached',
  })
  assert.equal(
    planDriverKitchenLinks(
      driver,
      'app',
      { ...grant, kitchen_id: 'k-0', relation: 'exclusive' },
      kitchen
    ).ok,
    true
  )
  assert.equal(
    planDriverKitchenLinks(
      driver,
      'app',
      { ...grant, kitchen_id: 'k-0', action: 'revoke' },
      kitchen
    ).ok,
    true
  )
  assert.deepEqual(
    planDriverKitchenLinks(
      { ...driver, kitchen_links: [...links, link('overflow')] },
      'app',
      grant,
      kitchen
    ),
    { ok: false, reason: 'exceeded' }
  )
})

test('Driver link normalization keeps one bounded App-owned record per Kitchen', () => {
  const driver = {
    kitchen_links: [
      null,
      { kitchen_id: 'bad/path' },
      link('other'),
      {
        ...link('other'),
        app_id: 'foreign',
        relation: 'invalid',
        active: false,
      },
    ],
    active_kitchen_ids: ['other', 'other'],
  }
  const result = planDriverKitchenLinks(driver, 'app', grant, kitchen)
  assert.deepEqual(result.links, [link('other', false), link('k')])
  assert.deepEqual(result.activeKitchenIds, ['k'])
})

function commandHarness() {
  const at = { seconds: 1, nanoseconds: 0 }
  const records = new Map([
    ['runtime/apps/app', {}],
    ['runtime/apps/app/users/actor', { role: 'user', created: { at } }],
    ['runtime/apps/app/users/driver', { role: 'user' }],
    ['runtime/kitchens/k', kitchen],
    [
      'runtime/kitchen_access/actor',
      { apps: { app: { ids: ['k'], membership_created_at: at } } },
    ],
    ['identity/users/driver/profiles/driver/driver', {}],
    ['identity/users/driver/profiles/driver/app-state/app/app', empty()],
  ])
  const writes = [],
    stages = []
  const source = readFileSync(
    new URL('../runtime/user/server/driver/access.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const deps = {
    createError,
    planDriverKitchenLinks,
    readKitchenAccessIds,
    FieldValue: { serverTimestamp: () => 'server-time' },
    APP_MUTATION_TARGETS: { runtimeApps: 'apps' },
KITCHEN_MUTATION_TARGETS: { kitchens: 'kitchens' },
    serverAppUsersTarget: (app) => `apps/${app}/users`,
    serverKitchenAccessTarget: () => 'kitchen_access',
    serverUserProfileTarget: (uid) => `users/${uid}/profiles/driver`,
    serverUserProfileAppStateTarget: (uid, _, app) =>
      `users/${uid}/profiles/driver/app-state/${app}`,
    runGuardedServerTransaction: async ({ kind }, run) => {
      stages.push(kind)
      let writing = false
      return run({
        read: async (target, id) => {
          assert.equal(writing, false, 'transaction reads must precede writes')
          const key = `${kind}/${target}/${id}`
          return { exists: records.has(key), data: records.get(key) }
        },
        update: (target, id, patch) => {
          writing = true
          writes.push({ kind, target, id, patch })
        },
      })
    },
  }
  const mutate = compileFunction(
    `${stripTypeScriptTypes(source)}; return mutateDriverKitchenAccess`,
    Object.keys(deps)
  )(...Object.values(deps))
  return {
    mutate: () =>
      mutate({
        actorUid: 'actor',
        appId: 'app',
        databaseId: 'runtime',
        input: grant,
      }),
    records,
    writes,
    stages,
  }
}

test('Driver command retains exact runtime authority and identity write scope', async () => {
  const h = commandHarness(),
    result = await h.mutate()
  assert.deepEqual(h.stages, ['runtime', 'identity'])
  assert.deepEqual(result, {
    ok: true,
    action: 'grant',
    app_id: 'app',
    driver_id: 'driver',
    kitchen_id: 'k',
    changed: true,
    active_kitchen_ids: ['k'],
  })
  assert.deepEqual(h.writes, [
    {
      kind: 'identity',
      target: 'users/driver/profiles/driver/app-state/app',
      id: 'app',
      patch: {
        kitchen_links: [link('k')],
        active_kitchen_ids: ['k'],
        updated: { at: 'server-time', by: 'actor' },
      },
    },
  ])
})

test('Driver command rejects revoked, stale or foreign grants before entering the identity transaction', async () => {
  for (const invalidate of [
    (h) => h.records.delete('runtime/apps/app/users/actor'),
    (h) =>
      (h.records.get('runtime/apps/app/users/actor').created.at = {
        seconds: 2,
        nanoseconds: 0,
      }),
    (h) =>
      (h.records.get('runtime/kitchen_access/actor').apps = {
        other: {
          ids: ['k'],
          membership_created_at: { seconds: 1, nanoseconds: 0 },
        },
      }),
    (h) => h.records.delete('runtime/apps/app/users/driver'),
    (h) => h.records.delete('runtime/kitchens/k'),
  ]) {
    const h = commandHarness()
    invalidate(h)
    await assert.rejects(h.mutate())
    assert.deepEqual(h.stages, ['runtime'])
    assert.equal(h.writes.length, 0)
  }
})

test('Driver command does not write an unchanged link or incomplete identity profile', async () => {
  const unchanged = commandHarness()
  unchanged.records.set(
    'identity/users/driver/profiles/driver/app-state/app/app',
    { kitchen_links: [link('k')], active_kitchen_ids: ['k'] }
  )
  assert.equal((await unchanged.mutate()).changed, false)
  assert.equal(unchanged.writes.length, 0)
  const missing = commandHarness()
  missing.records.delete('identity/users/driver/profiles/driver/driver')
  await assert.rejects(missing.mutate(), { statusCode: 409 })
  assert.equal(missing.writes.length, 0)
})
