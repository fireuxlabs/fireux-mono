import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, watch, effectScope } from 'vue'

const path = new URL(
  '../runtime/kitchen/composables/workspace/menus/useMenuSectionItemSelection.ts',
  import.meta.url
)
const source = readFileSync(path, 'utf8')
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
function fixture(createItem = async () => {}) {
  const lifetime = effectScope()
  let current = true
  let reset
  const context = {
    kitchenId: ref('k'),
    menuId: ref('m'),
    sectionId: ref('s'),
    canWrite: ref(true),
    activeItemRows: ref([{ dishId: 'placed' }]),
    itemsOutcome: ref('ready'),
    itemSource: {
      outcome: ref('ready'),
      error: ref(null),
      dishes: ref([
        { id: 'placed', name: 'Already on menu' },
        {
          id: 'a',
          name: 'Soup',
          description: 'Roasted tomato',
          category: 'starter',
        },
        { id: 'b', name: 'Burger', category: 'main' },
      ]),
    },
    createItem,
  }
  const useSelection = compileFunction(
    `${stripTypeScriptTypes(source)};return useMenuSectionItemSelection`,
    ['computed', 'ref', 'watch', 'useMenuEditorScope']
  )(computed, ref, watch, (_, onReset) => {
    reset = onReset
    return () => () => current
  })
  const state = lifetime.run(() => useSelection(context))
  return {
    state,
    context,
    stop() {
      current = false
      reset()
      lifetime.stop()
    },
  }
}
test('search finds descriptions, keeps selection across filters, and skips existing placements', async () => {
  const calls = []
  const f = fixture(async (input) => calls.push(input))
  f.state.query.value = 'tomato'
  assert.deepEqual(
    f.state.visible.value.map((x) => x.id),
    ['a']
  )
  f.state.selected.value = ['a', 'b', 'placed']
  f.state.query.value = 'burger'
  assert.equal(await f.state.add(), 2)
  assert.deepEqual(
    calls.map((x) => x.dishId),
    ['a', 'b']
  )
  assert.ok(
    calls.every(
      (x) => x.kitchenId === 'k' && x.menuId === 'm' && x.sectionId === 's'
    )
  )
  assert.deepEqual(f.state.selectedIds.value, [])
  f.stop()
})
test('partial failure keeps remaining choices and retry does not duplicate successful placement', async () => {
  const calls = []
  let fail = true
  const f = fixture(async (input) => {
    calls.push(input.dishId)
    if (input.dishId === 'b' && fail) throw Error('Offline')
  })
  f.state.selected.value = ['a', 'b']
  await f.state.add()
  assert.match(f.state.error.value, /1 added.*Offline/)
  assert.deepEqual(f.state.selected.value, ['b'])
  fail = false
  assert.equal(await f.state.add(), 1)
  assert.deepEqual(calls, ['a', 'b', 'b'])
  f.stop()
})
test('scope disposal stops a batch before its next command or completion feedback', async () => {
  let resolve
  const calls = []
  const f = fixture((input) => {
    calls.push(input.dishId)
    return new Promise((done) => (resolve = done))
  })
  f.state.selected.value = ['a', 'b']
  const work = f.state.add()
  f.stop()
  resolve()
  assert.equal(await work, undefined)
  assert.deepEqual(calls, ['a'])
  assert.equal(f.state.busy.value, false)
  assert.equal(f.state.error.value, '')
})
test('unresolved placement reads and read-only access prevent adds', async () => {
  const f = fixture(() => {
    throw Error('must not write')
  })
  f.state.selected.value = ['a']
  f.context.itemsOutcome.value = 'pending'
  assert.equal(f.state.canAdd.value, false)
  await f.state.add()
  f.context.itemsOutcome.value = 'ready'
  f.context.canWrite.value = false
  assert.equal(f.state.canAdd.value, false)
  await f.state.add()
  f.stop()
})
