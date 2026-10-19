import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { computed, ref } from 'vue'

const source = readFileSync(
  new URL(
    '../runtime/kitchen/components/Workspace/Menus/Collection/List.vue',
    import.meta.url
  ),
  'utf8'
)
const list = (records) =>
  compileFunction(
    source.slice(
      source.indexOf("const query = ref('')"),
      source.indexOf('watch(kitchenId')
    ) + '; return { groups, query, showArchived }',
    ['menus', 'computed', 'ref']
  )(ref(records), computed, ref)

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
