import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  readItemReferenceIds,
  validateItemReferenceIds,
  resolveItemPreparationStations,
} from '../runtime/kitchen/utils/item-organisation.ts'
const base = new URL('../runtime/kitchen/', import.meta.url)
function load(path, deps, result) {
  const source = readFileSync(new URL(path, base), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const createError = (value) => Object.assign(Error(value.statusMessage), value)
const targets = {
  kitchenItemGroupsTarget: (k) => `kitchens/${k}/item-groups`,
  kitchenStationsTarget: (k) => `kitchens/${k}/stations`,
}
const requireItemOrganisationReferences = load(
  'server/item-groups/references.ts',
  { createError, ...targets },
  'requireItemOrganisationReferences'
)
function fixture() {
  const writes = [],
    records = new Map([
      [
        'kitchens/k/stations/bar',
        { kitchen_id: 'k', active: true, role: 'preparation' },
      ],
      ['kitchens/k/stations/pass', { kitchen_id: 'k', active: true }],
      ['kitchens/k/stations/foreign', { kitchen_id: 'other', active: true }],
      ['kitchens/k/stations/inactive', { kitchen_id: 'k', active: false }],
    ])
  let allowed = true,
    writing = false
  const tx = {
    read: async (target, id) => {
      assert.equal(writing, false)
      return {
        exists: records.has(`${target}/${id}`),
        data: records.get(`${target}/${id}`),
      }
    },
    create: (target, id, data) => {
      writing = true
      writes.push(['create', target, id, data])
      records.set(`${target}/${id}`, data)
    },
    update: (target, id, data) => {
      writing = true
      writes.push(['update', target, id, data])
      records.set(`${target}/${id}`, {
        ...records.get(`${target}/${id}`),
        ...data,
      })
    },
  }
  const input = load(
    'server/dishes/record-input.ts',
    { createError },
    '({dishFields,dishText,validateDishInput})'
  )
  const save = load(
    'server/item-groups/save.ts',
    {
      ...input,
      ...targets,
      createError,
      validateItemReferenceIds,
      requireItemOrganisationReferences,
      normalizeSlug: (x) => x.toLowerCase().replace(/\s+/g, '-'),
      requireFirestoreDocumentId: (x) => {
        if (!x || x.includes('/')) throw Error('Invalid id')
        return x
      },
      readKitchenMutationActor: async () => ({ uid: 'u' }),
      requireKitchenRecordMutationAuthority: async () => {
        if (!allowed) throw Error('Denied')
        return { ownerAppId: 'app' }
      },
      serverAuditStamp: (x) => ({ ...x, at: 'now' }),
      runGuardedServerTransaction: async (_, run) => {
        writing = false
        return run(tx)
      },
    },
    'saveKitchenItemGroup'
  )
  return {
    save,
    records,
    writes,
    tx,
    revoke() {
      allowed = false
    },
  }
}
test('group names do not drive Station resolution; explicit empty differs from inheritance', () => {
  const groups = [
    { id: 'drinks', name: 'Food', active: true, default_station_ids: ['bar'] },
    { id: 'old', active: false, default_station_ids: ['kitchen'] },
  ]
  assert.deepEqual(
    resolveItemPreparationStations({ group_ids: ['drinks', 'old'] }, groups),
    ['bar']
  )
  assert.deepEqual(
    resolveItemPreparationStations(
      { group_ids: ['drinks'], preparation_station_ids: [] },
      groups
    ),
    []
  )
  assert.deepEqual(
    resolveItemPreparationStations(
      { group_ids: ['drinks'], preparation_station_ids: ['kitchen'] },
      groups
    ),
    ['kitchen']
  )
  assert.deepEqual(
    resolveItemPreparationStations(
      { spec: { station: 'Bar' }, item_kind: 'drink' },
      groups
    ),
    []
  )
})
test('reference readers tolerate historical absence; writers reject malformed or unbounded references', () => {
  assert.deepEqual(readItemReferenceIds(undefined), [])
  assert.deepEqual(readItemReferenceIds(['bar', 'bar', 'wrong/path', null]), [
    'bar',
  ])
  for (const value of [null, 'bar', ['wrong/path'], Array(51).fill('bar')])
    assert.throws(() => validateItemReferenceIds(value))
})
test('groups are Kitchen-owned records; rename preserves identity and defaults never depend on Food/Drink', async () => {
  const f = fixture()
  await f.save(
    {},
    { kitchenId: 'k', name: 'Drinks', default_station_ids: ['bar'] },
    'create'
  )
  const created = f.records.get('kitchens/k/item-groups/drinks')
  assert.deepEqual(created.created, created.updated)
  await f.save(
    {},
    { kitchenId: 'k', groupId: 'drinks', name: 'Refreshments' },
    'update'
  )
  const renamed = f.records.get('kitchens/k/item-groups/drinks')
  assert.equal(renamed.name, 'Refreshments')
  assert.deepEqual(renamed.default_station_ids, ['bar'])
  assert.deepEqual(renamed.created, created.created)
  await assert.rejects(
    f.save({}, { kitchenId: 'k', name: 'Drinks' }, 'create'),
    /already exists/
  )
})
test('foreign, inactive and coordination Stations cannot become preparation defaults', async () => {
  for (const id of ['foreign', 'inactive', 'pass', 'missing']) {
    const f = fixture()
    await assert.rejects(
      f.save(
        {},
        { kitchenId: 'k', name: 'Food', default_station_ids: [id] },
        'create'
      ),
      /preparation Station/
    )
    assert.equal(f.writes.length, 0)
  }
})
test('group writes recheck authority and reject foreign group ownership', async () => {
  const f = fixture()
  f.revoke()
  await assert.rejects(
    f.save({}, { kitchenId: 'k', name: 'Food' }, 'create'),
    /Denied/
  )
  assert.equal(f.writes.length, 0)
  const other = fixture()
  other.records.set('kitchens/k/item-groups/foreign', { kitchen_id: 'other' })
  await assert.rejects(
    other.save(
      {},
      { kitchenId: 'k', groupId: 'foreign', name: 'Food' },
      'update'
    ),
    /not found/
  )
  assert.equal(other.writes.length, 0)
})
test('Item references require real groups and preparation Stations in the same Kitchen', async () => {
  const f = fixture()
  f.records.set('kitchens/k/item-groups/food', {
    kitchen_id: 'k',
    active: true,
  })
  await requireItemOrganisationReferences(f.tx, 'k', {
    group_ids: ['food'],
    preparation_station_ids: ['bar'],
  })
  await assert.rejects(
    requireItemOrganisationReferences(f.tx, 'k', { group_ids: ['unknown'] }),
    /group is unavailable/
  )
  await assert.rejects(
    requireItemOrganisationReferences(f.tx, 'k', {
      preparation_station_ids: ['pass'],
    }),
    /preparation Station/
  )
})

test('group client captures input before credentials and cancels changed account or editor intent', async () => {
  for (const change of ['stable', 'account', 'owner']) {
    let resolveToken
    const calls = []
    const token = new Promise((resolve) => {
      resolveToken = resolve
    })
    const currentUser = { value: { uid: 'u', getIdToken: () => token } }
    let ownerCurrent = true
    const useCommands = load(
      'composables/workspace/dishes/useKitchenItemGroupCommands.ts',
      {
        useAuth: () => ({ currentUser }),
        useRequireUser: async () => currentUser.value,
        useDishEditorScope: () => () => () => true,
        isFirestoreDocumentId: (value) =>
          typeof value === 'string' && Boolean(value) && !value.includes('/'),
        $fetch: async (...args) => {
          calls.push(args)
          return { id: 'drinks' }
        },
      },
      'useKitchenItemGroupCommands'
    )
    const input = {
      kitchenId: 'k',
      name: 'Drinks',
      default_station_ids: ['bar'],
    }
    const work = useCommands([]).save(input, () => ownerCurrent)
    await Promise.resolve()
    input.name = 'Changed'
    input.default_station_ids.push('kitchen')
    if (change === 'account') currentUser.value = { uid: 'other' }
    if (change === 'owner') ownerCurrent = false
    const result =
      change === 'stable' ? work : assert.rejects(work, /editor changed/)
    resolveToken('token')
    await result
    assert.equal(calls.length, change === 'stable' ? 1 : 0)
    if (calls.length)
      assert.deepEqual(calls[0][1].body, {
        kitchenId: 'k',
        name: 'Drinks',
        default_station_ids: ['bar'],
      })
  }
})

test('public Menu sections keep untyped Items neutral while historical Food/Drink remain classified', () => {
  const readSections = load(
    '../menu/server/payload/sections.ts',
    {
      readDishItemKind: (value) =>
        value === 'food' || value === 'drink' ? value : '',
    },
    'readMenuManifestSections'
  )
  const families = load(
    '../menu/utils/catalogue/families.ts',
    {},
    'menuCatalogueFamilies'
  )
  const sections = readSections([
    {
      id: 'new',
      label: 'Merch',
      items: [{ id: 'umbrella', name: 'Umbrella', item_kind: null, price: 10 }],
    },
    {
      id: 'old',
      label: 'Lunch',
      items: [{ id: 'soup', name: 'Soup', price: 10 }],
    },
    {
      id: 'bar',
      label: 'Bar',
      items: [{ id: 'cola', name: 'Cola', item_kind: 'drink', price: 4 }],
    },
  ])
  assert.equal(sections[0].items[0].itemKind, null)
  assert.equal(
    readSections(JSON.parse(JSON.stringify(sections)))[0].items[0].itemKind,
    null
  )
  assert.equal(sections[1].items[0].itemKind, 'food')
  assert.equal(sections[2].items[0].itemKind, 'drink')
  assert.deepEqual(
    families(sections).map((family) => [
      family.id,
      family.sections.map((section) => section.id),
    ]),
    [
      ['items', ['new']],
      ['food', ['old']],
      ['drinks', ['bar']],
    ]
  )
})
