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
    useKitchenMenusContext: () => ({
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
  state.showArchived.value = true
  assert.deepEqual(groups()[1], ['Archived', ['old']])
  state.query.value = 'wine'
  assert.deepEqual(groups(), [['Menus', ['pdf']]])
  assert.deepEqual(records, before)
})

test('Workspace creation has one Menu path and keeps source import available', () => {
  const create = readFileSync(
    new URL(
      '../runtime/kitchen/components/Workspace/Menus/Create/Index.vue',
      import.meta.url
    ),
    'utf8'
  )
  assert.match(create, /<WorkspaceKitchenMenusCreateForm v-else \/>/)
  assert.match(
    create,
    /<WorkspaceKitchenMenusCreateUrl v-else-if="method === 'url'" \/>/
  )
  const url = readFileSync(
    new URL(
      '../runtime/kitchen/components/Workspace/Menus/Create/Url.vue',
      import.meta.url
    ),
    'utf8'
  )
  assert.doesNotMatch(url, /label="Menu name"/)
  assert.match(create, /<WorkspaceKitchenMenusCreateUpload/)
  assert.match(create, /v-if="method === 'upload'"/)
  for (const label of ['PDF or photos', 'Menu URL', 'Start blank'])
    assert.ok(create.includes(label))
  assert.doesNotMatch(
    create,
    /Menu format|Document Menu|format ===|const choices|MenusCreateQueue/
  )
})

test('Menu search and Show archived survive opening a record and remounting the list', () => {
  const records = [
    { id: 'food', name: 'Food', status: 'published', price: 13 },
    { id: 'old', name: 'Old drinks', status: 'archived', price: 4 },
  ]
  const before = structuredClone(records)
  const fixture = listFixture(records)
  const first = fixture.mount()
  first.query.value = 'drinks'
  first.showArchived.value = true
  const returned = fixture.mount()
  assert.equal(returned.query.value, 'drinks')
  assert.equal(returned.showArchived.value, true)
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
  list.showArchived.value = true
  for (const owner of [
    fixture.uid,
    fixture.kitchenId,
    fixture.activeKitchenAppId,
  ]) {
    const original = owner.value
    owner.value = 'another'
    assert.equal(list.query.value, '')
    assert.equal(list.showArchived.value, false)
    owner.value = original
    assert.equal(list.query.value, 'old')
    assert.equal(list.showArchived.value, true)
  }
  fixture.menus.value = []
  assert.equal(list.filteredMenus.value.length, 0)
  assert.equal(list.query.value, 'old')
  assert.equal(list.showArchived.value, true)
  fixture.menus.value = [{ id: 'old', name: 'Old menu', status: 'archived' }]
  assert.equal(list.filteredMenus.value[0].id, 'old')
})
