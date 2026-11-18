import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, ref } from 'vue'

function listFixture(records) {
  const menus = ref(records)
  const kitchenId = ref('kitchen-a')
  const activeKitchenAppId = ref('misebox')
  const uid = ref('operator-a')
  const state = ref({})
  const source = readFileSync(
    new URL(
      '../runtime/kitchen/composables/workspace/menus/useMenuList.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const deps = {
    computed,
    useState: () => state,
    useAppSession: () => ({ uid }),
    useKitchenMenus: () => ({
      rawMenus: menus,
      kitchenId,
      activeKitchenAppId,
    }),
  }
  const mount = compileFunction(
    stripTypeScriptTypes(source) + '; return useMenuList;',
    Object.keys(deps)
  )(...Object.values(deps))
  return { mount, menus, kitchenId, activeKitchenAppId, uid }
}
const list = (records) => listFixture(records).mount()

test('Menu list keeps regular menus together and Daily specials and archives separate', () => {
  const records = [
    { id: 'food', name: 'Food', format: 'interactive', status: 'published' },
    { id: 'pdf', name: 'Wine list', format: 'document', status: 'published' },
    {
      id: 'empty-document',
      name: 'New document',
      format: 'document',
      status: 'draft',
    },
    {
      id: 'daily',
      name: 'Daily specials',
      format: 'interactive',
      schedule: 'daily',
    },
    { id: 'old', name: 'Old menu', format: 'document', status: 'archived' },
  ]
  const before = structuredClone(records)
  const state = list(records)
  const groups = () =>
    state.groups.value.map(({ label, menus }) => [
      label,
      menus.map(({ id }) => id),
    ])
  assert.deepEqual(groups(), [
    ['Menus', ['food', 'pdf', 'empty-document']],
    ['Daily specials', ['daily']],
  ])
  state.status.value = 'archived'
  assert.deepEqual(groups(), [['Archived', ['old']]])
  state.status.value = 'all'
  state.query.value = 'wine'
  assert.deepEqual(groups(), [['Menus', ['pdf']]])
  assert.deepEqual(records, before)
})

test('Workspace creation has one Menu path and keeps source import available', () => {
  const create = readFileSync(
    new URL(
      '../runtime/kitchen/components/Menu/Menus/Create/Index.vue',
      import.meta.url
    ),
    'utf8'
  )
  assert.match(create, /<KitchenMenuMenusCreateForm v-else \/>/)
  assert.match(
    create,
    /<KitchenMenuMenusCreateUrl v-else-if="method === 'url'" \/>/
  )
  const url = readFileSync(
    new URL(
      '../runtime/kitchen/components/Menu/Menus/Create/Url.vue',
      import.meta.url
    ),
    'utf8'
  )
  assert.doesNotMatch(url, /label="Menu name"/)
  assert.match(create, /<KitchenMenuMenusCreateUpload/)
  assert.match(create, /v-if="method === 'upload'"/)
  for (const label of ['PDF or photos', 'Menu URL', 'Start blank'])
    assert.ok(create.includes(label))
  assert.doesNotMatch(
    create,
    /Menu format|Document Menu|format ===|const choices|MenusCreateQueue/
  )
})

test('Menu search and status selection survive opening a record and remounting the list', () => {
  const records = [
    { id: 'food', name: 'Food', status: 'published', price: 13 },
    { id: 'old', name: 'Old drinks', status: 'archived', price: 4 },
  ]
  const before = structuredClone(records)
  const fixture = listFixture(records)
  const first = fixture.mount()
  first.query.value = 'drinks'
  first.status.value = 'archived'
  const returned = fixture.mount()
  assert.equal(returned.query.value, 'drinks')
  assert.equal(returned.status.value, 'archived')
  assert.deepEqual(
    returned.filteredMenus.value.map((menu) => menu.id),
    ['old']
  )
  assert.deepEqual(records, before)
})

test('Menu list choices are isolated by account, Kitchen and App, and follow live records', () => {
  const fixture = listFixture([
    { id: 'old', name: 'Old menu', status: 'archived' },
  ])
  const list = fixture.mount()
  list.query.value = 'old'
  list.status.value = 'archived'
  for (const owner of [
    fixture.uid,
    fixture.kitchenId,
    fixture.activeKitchenAppId,
  ]) {
    const original = owner.value
    owner.value = 'another'
    assert.equal(list.query.value, '')
    assert.equal(list.status.value, 'all')
    owner.value = original
    assert.equal(list.query.value, 'old')
    assert.equal(list.status.value, 'archived')
  }
  fixture.menus.value = []
  assert.equal(list.filteredMenus.value.length, 0)
  assert.equal(list.query.value, 'old')
  assert.equal(list.status.value, 'archived')
  fixture.menus.value = [{ id: 'old', name: 'Old menu', status: 'archived' }]
  assert.equal(list.filteredMenus.value[0].id, 'old')
})

test('list owner sorts published first then saved order and name without mutating the source', () => {
  const records = [
    { id: 'draft', name: 'Draft', status: 'draft', sort_order: 0 },
    { id: 'z', name: 'Zulu', status: 'published', sort_order: 2 },
    { id: 'a', name: 'Alpha', status: 'published', sort_order: 2 },
    { id: 'first', name: 'First', status: 'published', sort_order: 1 },
    { id: 'old', name: 'Old', status: 'archived', sort_order: 0 },
  ]
  const before = structuredClone(records)
  const list = listFixture(records).mount()
  assert.deepEqual(
    list.visibleMenus.value.map((menu) => menu.id),
    ['first', 'a', 'z', 'draft']
  )
  list.query.value = 'old'
  assert.deepEqual(list.visibleMenus.value, [])
  list.status.value = 'archived'
  assert.deepEqual(
    list.visibleMenus.value.map((menu) => menu.id),
    ['old']
  )
  assert.deepEqual(records, before)
})

test('status selection separates published, draft and archived records and follows live changes', () => {
  const fixture = listFixture([
    { id: 'p', name: 'Published', status: 'published' },
    { id: 'd', name: 'Draft', status: 'draft' },
    { id: 'a', name: 'Archived', status: 'archived' },
  ])
  const state = fixture.mount()
  const ids = () => state.visibleMenus.value.map((menu) => menu.id)
  assert.deepEqual(ids(), ['p', 'd'])
  for (const [status, expected] of [
    ['published', ['p']],
    ['draft', ['d']],
    ['archived', ['a']],
  ]) {
    state.status.value = status
    assert.deepEqual(ids(), expected)
  }
  state.status.value = 'published'
  fixture.menus.value = fixture.menus.value.map((menu) =>
    menu.id === 'd' ? { ...menu, status: 'published' } : menu
  )
  assert.deepEqual(ids(), ['d', 'p'])
  state.query.value = 'draft'
  assert.deepEqual(ids(), ['d'])
})

test('simultaneous Controls and Collection list projections share live filter choices', () => {
  const fixture = listFixture([
    { id: 'p', name: 'Food', status: 'published' },
    { id: 'd', name: 'Drinks', status: 'draft' },
    { id: 'a', name: 'Old', status: 'archived' },
  ])
  const controls = fixture.mount()
  const collection = fixture.mount()
  assert.notEqual(controls, collection)
  for (const [status, ids] of [
    ['published', ['p']],
    ['draft', ['d']],
    ['archived', ['a']],
    ['all', ['p', 'd']],
  ]) {
    controls.status.value = status
    assert.equal(collection.status.value, status)
    assert.deepEqual(
      collection.visibleMenus.value.map((menu) => menu.id),
      ids
    )
    assert.equal(
      controls.visibleMenus.value.length,
      collection.visibleMenus.value.length
    )
  }
  controls.query.value = 'food'
  assert.deepEqual(
    collection.visibleMenus.value.map((menu) => menu.id),
    ['p']
  )
  collection.status.value = 'draft'
  assert.equal(controls.status.value, 'draft')
  assert.equal(controls.visibleMenus.value.length, 0)
})
