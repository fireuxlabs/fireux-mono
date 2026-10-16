import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, watch } from 'vue'
function load(path, dependencies, name) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type \{[\s\S]*?\} from[^\n]*\n/gm, '')
    .replace(/^export type \* from[^\n]*\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (x) => Object.assign(new Error(x.statusMessage), x)
const requireFirestoreDocumentId = (value) => {
  if (typeof value !== 'string' || !value || value.includes('/'))
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  return value
}
const readMembershipAccessIds = load(
  '../../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',
  {},
  'readMembershipAccessIds'
)
const readKitchenAccessIds = load(
  '../../runtime/kitchen/utils/kitchen-access.ts',
  { readMembershipAccessIds, KITCHEN_USER_LIMIT: 500 },
  'readKitchenAccessIds'
)
const requireKitchenMutationAuthority = load(
  '../../runtime/kitchen/server/core/mutation-authority.ts',
  {
    serverAppUsersTarget: (app) => `apps/${app}/users`,
    serverKitchenAccessTarget: (app) => 'kitchen_access',
    FIRESTORE_MUTATION_TARGETS: { kitchens: 'kitchens', places: 'places' },
    readKitchenAccessIds,
    isAppUserSubscription: (value) =>
      ['free', 'premium', 'business'].includes(value),
    createError,
  },
  'requireKitchenMutationAuthority'
)

const metadata = load(
  '../../runtime/menu/utils/menu-metadata.ts',
  {},
  '({normalizeMenuMetadataPatch,normalizeMenuDocument})'
)
const readRecordString = (v, k) => (typeof v?.[k] === 'string' ? v[k] : '')
function harness(tier = 'premium') {
  const at = { seconds: 1, nanoseconds: 0 },
    records = new Map([
      ['kitchens/k', { slug: 'venue' }],
      ['places/k', {}],
      [
        'apps/app/users/u',
        { role: 'user', subscription: tier, created: { at } },
      ],
      [
        'kitchen_access/u',
        { apps: { app: { ids: ['k'], membership_created_at: at } } },
      ],
      [
        'kitchens/k/menus/m',
        { name: 'Food', slug: 'food', description: 'Old', status: 'published' },
      ],
      [
        'menus/stable',
        {
          name: 'Food',
          status: 'published',
          created: { at: 'original' },
          source: { app_id: 'original-app', kitchen_id: 'k', menu_id: 'm' },
        },
      ],
      [
        'menus/duplicate',
        { status: 'published', source: { kitchen_id: 'k', menu_id: 'm' } },
      ],
      [
        'menus/foreign',
        { status: 'published', source: { kitchen_id: 'k', menu_id: 'other' } },
      ],
      ['kitchens/k/menus/m/sections/s', { label: 'Section' }],
    ])
  let fail = false,
    before = () => {},
    collision = false
  const deps = {
    ...metadata,
    createError,
    requireFirestoreDocumentId,
    requireKitchenMutationAuthority,
    FIRESTORE_MUTATION_TARGETS: { menus: 'menus' },
    serverKitchenMenusTarget: (k) => `kitchens/${k}/menus`,
    serverKitchenMenuSectionsTarget: (k, m) =>
      `kitchens/${k}/menus/${m}/sections`,
    serverKitchenOfferingsTarget: (k) => `kitchens/${k}/offerings`,
    menuNameAndSlug: (_, name) => {
      if (typeof name !== 'string' || !name.trim())
        throw createError({ statusCode: 400 })
      return {
        name: name.trim(),
        slug: name.toLowerCase().replaceAll(' ', '-'),
      }
    },
    requireAvailableMenuSlug: async () => {
      if (collision) throw createError({ statusCode: 409 })
    },
    readKitchenMutationActor: async () => ({ uid: 'u', runtimeAppId: 'app' }),
    serverAuditStamp: (x) => ({ ...x, at: 'now' }),
    runGuardedServerTransaction: async (_, run) => {
      before()
      let writing = false
      const pending = []
      const tx = {
        read: async (t, id) => {
          assert.equal(writing, false, 'read after write')
          return {
            exists: records.has(`${t}/${id}`),
            data: records.get(`${t}/${id}`),
          }
        },
        readAll: async (t, limit) => {
          assert.equal(writing, false)
          return [...records]
            .filter(
              ([p]) =>
                p.startsWith(t + '/') && !p.slice(t.length + 1).includes('/')
            )
            .slice(0, limit)
            .map(([p, data]) => ({ id: p.split('/').at(-1), data }))
        },
        query: async (t, q) => {
          assert.equal(writing, false)
          return [...records]
            .filter(
              ([p, v]) =>
                p.startsWith(t + '/') &&
                !p.slice(t.length + 1).includes('/') &&
                (q.op === 'array-contains'
                  ? v[q.field]?.includes(q.value)
                  : v[q.field] === q.value)
            )
            .slice(0, q.limit)
            .map(([p, data]) => ({ id: p.split('/').at(-1), data }))
        },
        update: (t, id, p) => {
          writing = true
          pending.push(() =>
            records.set(`${t}/${id}`, { ...records.get(`${t}/${id}`), ...p })
          )
        },
        create: (t, id, p) => {
          writing = true
          pending.push(() => records.set(`${t}/${id}`, p))
        },
        delete: (t, id) => {
          writing = true
          pending.push(() => records.delete(`${t}/${id}`))
        },
      }
      const result = await run(tx)
      if (fail) throw Error('Commit failed')
      pending.forEach((fn) => fn())
      return result
    },
  }
  const commands = {
    ...load(
      '../../runtime/menu/server/publication/state.ts',
      deps,
      '({changeKitchenMenuPublication})'
    ),
    ...load(
      '../../runtime/menu/server/records/update.ts',
      deps,
      '({updateKitchenMenu,renameKitchenMenu})'
    ),
    ...load(
      '../../runtime/menu/server/records/delete.ts',
      deps,
      '({deleteKitchenMenu})'
    ),
  }
  return {
    ...commands,
    records,
    setFailure: () => {
      fail = true
    },
    before: (fn) => {
      before = fn
    },
    collision: () => {
      collision = true
    },
  }
}
test('Metadata updates only the canonical Menu atomically', async () => {
  const h = harness()
  await h.updateKitchenMenu(
    {},
    {
      kitchenId: 'k',
      menuId: 'm',
      changes: { name: 'Dinner', description: 'New', sort_order: 3 },
    }
  )
  assert.equal(h.records.get('kitchens/k/menus/m').slug, 'food')
  assert.equal(h.records.get('kitchens/k/menus/m').name, 'Dinner')
  assert.equal(h.records.get('kitchens/k/menus/m').description, 'New')
  assert.equal(h.records.get('kitchens/k/menus/m').status, 'published')
  assert.equal(h.records.get('menus/stable').name, 'Food')
  const failed = harness()
  const snapshot = structuredClone([...failed.records])
  failed.setFailure()
  await assert.rejects(
    failed.updateKitchenMenu(
      {},
      { kitchenId: 'k', menuId: 'm', changes: { name: 'Dinner' } }
    ),
    /Commit failed/
  )
  assert.deepEqual([...failed.records], snapshot)
})
test('Free may edit operational metadata but only Plus may rename; strict field grammar', async () => {
  const h = harness('free')
  await h.updateKitchenMenu(
    {},
    {
      kitchenId: 'k',
      menuId: 'm',
      changes: { description: '', sort_order: -2 },
    }
  )
  assert.equal(h.records.get('kitchens/k/menus/m').sort_order, -2)
  await assert.rejects(
    h.renameKitchenMenu({}, { kitchenId: 'k', menuId: 'm', name: 'Dinner' }),
    { statusCode: 403 }
  )
  for (const changes of [
    { status: 'draft' },
    { slug: 'x' },
    { schedule: 'daily' },
    { source: {} },
    { created: {} },
    { sort_order: 1.5 },
    { description: 4 },
    { doc: { url: 'x' } },
    {},
  ])
    await assert.rejects(
      h.updateKitchenMenu({}, { kitchenId: 'k', menuId: 'm', changes }),
      { statusCode: 400 }
    )
  const conflict = harness()
  conflict.collision()
  await conflict.renameKitchenMenu(
    {},
    { kitchenId: 'k', menuId: 'm', name: 'Dinner' }
  )
  assert.equal(conflict.records.get('kitchens/k/menus/m').slug, 'food')
  assert.equal(conflict.records.get('kitchens/k/menus/m').name, 'Dinner')
})
test('Metadata/Delete recheck revoked or replaced membership before writing', async () => {
  for (const operation of ['update', 'delete'])
    for (const change of [
      (h) => h.records.delete('apps/app/users/u'),
      (h) =>
        (h.records.get('apps/app/users/u').created.at = {
          seconds: 2,
          nanoseconds: 0,
        }),
      (h) => (h.records.get('kitchen_access/u').apps.app.ids = []),
    ]) {
      const h = harness()
      h.before(() => change(h))
      await assert.rejects(
        operation === 'update'
          ? h.updateKitchenMenu(
              {},
              { kitchenId: 'k', menuId: 'm', changes: { description: 'New' } }
            )
          : h.deleteKitchenMenu({}, { kitchenId: 'k', menuId: 'm' })
      )
      assert.equal(h.records.get('menus/stable').status, 'published')
      assert.equal(h.records.has('kitchens/k/menus/m'), true)
    }
})

test('Archive preserves content and services; restore returns to draft without publishing', async () => {
  const h = harness('free')
  h.records.set('kitchens/k/offerings/lunch', {
    name: 'Lunch',
    menu_ids: ['m'],
  })
  const before = structuredClone(h.records)
  await h.changeKitchenMenuPublication(
    {},
    { kitchenId: 'k', menuId: 'm' },
    'archive'
  )
  assert.equal(h.records.get('kitchens/k/menus/m').status, 'archived')
  for (const [path, record] of before)
    if (path !== 'kitchens/k/menus/m')
      assert.deepEqual(h.records.get(path), record)
  await h.changeKitchenMenuPublication(
    {},
    { kitchenId: 'k', menuId: 'm' },
    'restore'
  )
  assert.equal(h.records.get('kitchens/k/menus/m').status, 'draft')
})

for (const blocker of ['published', 'section', 'document', 'service', 'daily'])
  test(`permanent Menu deletion rejects ${blocker}`, async () => {
    const h = harness()
    const menu = h.records.get('kitchens/k/menus/m')
    menu.status = 'archived'
    h.records.delete('kitchens/k/menus/m/sections/s')
    if (blocker === 'published') menu.status = 'published'
    if (blocker === 'section')
      h.records.set('kitchens/k/menus/m/sections/old', { status: 'archived' })
    if (blocker === 'document') menu.doc = { storage_path: 'owned/file.pdf' }
    if (blocker === 'service')
      h.records.set('kitchens/k/offerings/lunch', {
        enabled: false,
        menu_ids: ['m'],
      })
    if (blocker === 'daily') menu.schedule = 'daily'
    const before = structuredClone(h.records)
    await assert.rejects(
      h.deleteKitchenMenu({}, { kitchenId: 'k', menuId: 'm' }),
      { statusCode: 409 }
    )
    assert.deepEqual(h.records, before)
  })

test('permanent deletion removes only an empty unreferenced Menu', async () => {
  const h = harness()
  h.records.get('kitchens/k/menus/m').status = 'draft'
  h.records.delete('kitchens/k/menus/m/sections/s')
  const before = structuredClone(h.records)
  await h.deleteKitchenMenu({}, { kitchenId: 'k', menuId: 'm' })
  assert.equal(h.records.has('kitchens/k/menus/m'), false)
  for (const [path, record] of before)
    if (path !== 'kitchens/k/menus/m')
      assert.deepEqual(h.records.get(path), record)
})

test('archive rechecks current authority and leaves Daily specials separate', async () => {
  for (const change of [
    (h) => h.records.delete('apps/app/users/u'),
    (h) => (h.records.get('kitchens/k/menus/m').schedule = 'daily'),
  ]) {
    const h = harness()
    change(h)
    const before = structuredClone(h.records)
    await assert.rejects(
      h.changeKitchenMenuPublication(
        {},
        { kitchenId: 'k', menuId: 'm' },
        'archive'
      )
    )
    assert.deepEqual(h.records, before)
  }
})
