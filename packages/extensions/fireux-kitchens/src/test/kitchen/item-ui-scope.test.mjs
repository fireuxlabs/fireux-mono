import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import { commandScopeDeps } from '../command-scope-fixture.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { ref, computed, watch, watchEffect } from 'vue'
function evaluate(relative, deps, result, vue = false) {
  deps = commandScopeDeps({
    useRoute: () => ({ fullPath: '/items/dish' }),
    ...deps,
  })
  if (vue) deps = { ...specification, ...deps }
  if (relative === component('Menu/Menus/Items/Add/ByName')) {
    deps.useMenuSectionItemCreation = evaluate(
      '../../runtime/kitchen/composables/workspace/menu/menus/useMenuSectionItemCreation.ts',
      deps,
      'useMenuSectionItemCreation'
    )
  }
  let source = readFileSync(new URL(relative, import.meta.url), 'utf8')
  if (vue)
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
function setup() {
  const currentUser = ref({ uid: 'u' }),
    kitchenId = ref('k'),
    itemId = ref('dish'),
    notices = [],
    unmount = []
  const useItemEditorScope = evaluate(
    '../../runtime/kitchen/composables/items/useItemEditorScope.ts',
    {
      watch,
      onBeforeUnmount: (fn) => unmount.push(fn),
      useAuth: () => ({ currentUser }),
    },
    'useItemEditorScope'
  )
  const deps = {
    ref,
    computed,
    watch,
    watchEffect,
    useWorkspacePageState: () => ({ publish() {} }),
    itemCatalogueReturn: () => '',
    useItemEditorScope,
    useKitchenWorkspace: () => ({
      id: kitchenId,
      outcome: ref('ready'),
      data: ref({ id: 'k' }),
    }),
    useRouteParam: () => itemId,
    useItemCatalogueContext: () => ({
      catalogue: { singular: 'dish', path: '/items' },
    }),
    onBeforeUnmount: (fn) => unmount.push(fn),
    useToastify: () => ({ add: (value) => notices.push(value) }),
    URL: { revokeObjectURL() {}, createObjectURL: () => 'blob' },
  }
  return { currentUser, kitchenId, itemId, notices, deps, unmount }
}
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const component = (name) =>
  `../../runtime/kitchen/components/Workspace/${name}.vue`
const specification = evaluate(
  '../../runtime/kitchen/utils/item-specification.ts',
  { isFirestoreDocumentId },
  '({emptyItemSpecification,validateItemSpecification})'
)
test('create does not upload or show stale outcomes after Kitchen/account round trips', async () => {
  for (const scope of ['kitchen', 'account'])
    for (const outcome of ['success', 'error']) {
      const h = setup(),
        pending = deferred(),
        uploads = []
      const api = evaluate(
        component('Menu/Items/Create/Index'),
        {
          ...h.deps,
          defineProps: () => ({
            get kitchenId() {
              return h.kitchenId.value
            },
            itemKind: 'food',
          }),
          defineEmits: () => () => {},
          useItemActions: () => ({ createItem: () => pending.promise }),
          useItemImageUpload: () => ({
            uploadItemImage: (x) => uploads.push(x),
          }),
        },
        '({addItem,name,imageFile,message,saving})',
        true
      )
      api.name.value = 'Pizza'
      api.imageFile.value = { name: 'image' }
      const result = api.addItem()
      if (scope === 'kitchen') {
        h.kitchenId.value = 'other'
        h.kitchenId.value = 'k'
      } else {
        h.currentUser.value = null
        h.currentUser.value = { uid: 'u' }
      }
      if (outcome === 'success') pending.resolve({ id: 'pizza' })
      else pending.reject(Error('Old failure'))
      await result
      assert.equal(uploads.length, 0)
      assert.equal(h.notices.length, 0)
      assert.equal(api.message.value, '')
      assert.equal(api.saving.value, false)
    }
})
test('create captures original upload and reports saved Item with failed image honestly', async () => {
  const h = setup(),
    pending = deferred(),
    uploads = [],
    original = { name: 'original' }
  const api = evaluate(
    component('Menu/Items/Create/Index'),
    {
      ...h.deps,
      defineProps: () => ({
        get kitchenId() {
          return h.kitchenId.value
        },
        itemKind: 'food',
      }),
      defineEmits: () => () => {},
      useItemActions: () => ({ createItem: () => pending.promise }),
      useItemImageUpload: () => ({
        uploadItemImage: async (x) => {
          uploads.push(x)
          throw Error('upload failed')
        },
      }),
    },
    '({addItem,name,imageFile,message})',
    true
  )
  api.name.value = 'Pizza'
  api.imageFile.value = original
  const result = api.addItem()
  pending.resolve({ id: 'pizza' })
  await result
  assert.equal(uploads[0].file.name, 'original')
  assert.match(api.message.value, /Created Pizza, but its image was not saved/)
})
test('Menu name flow stops before placement on destination change; failed placement retains saved Item truth', async () => {
  for (const changed of [true, false]) {
    const h = setup(),
      pending = deferred(),
      menuId = ref('menu'),
      sectionId = ref('section'),
      placements = []
    const api = evaluate(
      component('Menu/Menus/Items/Add/ByName'),
      {
        ...h.deps,
        useMenuSection: () => ({
          kitchenId: h.kitchenId,
          menuId,
          sectionId,
          itemSource: {
            dishes: ref([]),
            outcome: ref('empty'),
            error: ref(null),
          },
          activeItemRows: ref([]),
          canWrite: ref(true),
          createItem: async (input) => {
            placements.push(input)
            throw Error('placement failed')
          },
        }),
        useItemActions: () => ({ createItem: () => pending.promise }),
      },
      '({addNames,names,prices,error,busy})',
      true
    )
    api.prices.value = { Pizza: 13 }
    api.names.value = 'Pizza'
    const result = api.addNames()
    if (changed) {
      sectionId.value = 'other'
      sectionId.value = 'section'
    }
    pending.resolve({ id: 'pizza' })
    await result
    assert.equal(placements.length, changed ? 0 : 1)
    if (changed) assert.equal(api.error.value, '')
    else {
      assert.match(api.error.value, /exists, but adding it to this Menu failed/)
      assert.equal(placements[0].sectionId, 'section')
    }
  }
})
for (const changed of [false, true]) {
  test(`Item delete ${changed ? 'rejects stale record scope' : 'returns to Items when the live document disappears before the response'}`, async () => {
    const h = setup()
    const pending = deferred()
    const calls = []
    const navigations = []
    const destination = { path: '/workspace/kitchen/menu/items' }
    const item = ref({ name: 'Pizza' })
    const canWrite = ref(true)
    const { action, removeItem } = evaluate(
      component('Menu/Items/Detail/WorkspaceItemEdit'),
      {
        ...h.deps,
        navigateTo: (target) => navigations.push(target),
        itemCatalogueReturn: () => destination,
        useKitchenItemContext: () => ({
          kitchenId: h.kitchenId,
          itemId: h.itemId,
          item,
          canWrite,
        }),
        useItemActions: () => ({
          deleteItem: (...args) => {
            calls.push(args)
            return pending.promise
          },
        }),
      },
      '({action,removeItem})',
      true
    )
    action.value = 'remove'
    const result = removeItem()
    assert.deepEqual(calls, [['dish', { kitchenId: 'k' }]])
    item.value = null
    canWrite.value = false
    assert.equal(action.value, null)
    if (changed) {
      h.itemId.value = 'other'
      h.itemId.value = 'dish'
    }
    pending.resolve({ id: 'dish' })
    await result
    assert.deepEqual(navigations, changed ? [] : [destination])
  })
}

test('record edit ignores old failures and spec saves a detached payload', async () => {
  const h = setup(),
    pending = deferred()
  const identity = {
    storageKitchenId: ref('k'),
    rootCollection: ref('kitchens'),
    databaseId: ref('db'),
    kitchenId: h.kitchenId,
    itemId: h.itemId,
    item: ref({ name: 'Pizza' }),
    canWrite: ref(true),
    catalogue: { singular: 'dish' },
  }
  const edit = evaluate(
    component('Menu/Items/Edit/Index'),
    {
      ...h.deps,
      useAuth: () => ({ currentUser: h.currentUser }),
      useKitchenItemContext: () => identity,
      useItemActions: () => ({ updateItem: () => pending.promise }),
      useItemImageUpload: () => ({ uploadItemImage: async () => {} }),
    },
    '({updateItemField})',
    true
  )
  const result = edit.updateItemField({ name: 'New' }, 'Saved', 'Failed')
  h.itemId.value = 'other'
  h.itemId.value = 'dish'
  pending.reject(Error('Stale'))
  await result
  assert.deepEqual(h.notices, [])
})
for (const state of ['loading', 'error', 'referenced']) {
  test(`Item removal does not dispatch while usage is ${state}`, async () => {
    const h = setup()
    let removed = 0
    const api = evaluate(
      component('Menu/Items/Delete'),
      {
        ...h.deps,
        defineProps: () => ({
          remove: async () => {
            removed++
          },
        }),
        useItemUsage: () => ({
          usages: ref(
            state === 'referenced'
              ? [{ kind: 'menu', id: 'm', name: 'Food' }]
              : []
          ),
          ready: ref(state === 'referenced'),
          error: ref(state === 'error' ? Error('Unavailable') : null),
        }),
        useKitchenItemContext: () => ({
          kitchenId: h.kitchenId,
          itemId: h.itemId,
          item: ref({ name: 'Pizza' }),
          canWrite: ref(true),
          catalogue: { singular: 'dish' },
        }),
      },
      '({deleteSelectedItem})',
      true
    )
    await api.deleteSelectedItem()
    assert.equal(removed, 0)
  })
}

test('Menu entry removal captures scope and suppresses obsolete completion', async () => {
  const h = setup(),
    pending = deferred(),
    menuId = ref('menu'),
    sectionId = ref('section')
  let intent
  const api = evaluate(
    '../../runtime/kitchen/composables/workspace/menu/menus/useMenuSectionItemsEditor.ts',
    {
      ...h.deps,
      window: { confirm: () => true },
      useMenuRecordNavigation: () => ({ rememberView() {} }),
      useMenuSection: () => ({
        kitchenId: h.kitchenId,
        menuId,
        sectionId,
        canWrite: ref(true),
        removeItem: (...args) => {
          intent = args
          return pending.promise
        },
      }),
    },
    'useMenuSectionItemsEditor()'
  )
  const saved = api.removeFromMenu({ id: 'i', label: 'Pizza' })
  assert.deepEqual(intent.slice(0, 4), [
    h.kitchenId.value,
    'menu',
    'section',
    'i',
  ])
  sectionId.value = 'other'
  sectionId.value = 'section'
  assert.equal(intent[4](), false)
  pending.resolve()
  await saved
  assert.deepEqual(h.notices, [])
  assert.equal(api.removing.value, '')
})

test('item moves disable list boundaries and discard obsolete completion', async () => {
  const h = setup(),
    pending = deferred(),
    menuId = ref('menu'),
    sectionId = ref('section'),
    itemRows = ref([{ id: 'a' }, { id: 'b' }])
  let intent
  const api = evaluate(
    '../../runtime/kitchen/composables/workspace/menu/menus/useMenuSectionItemsEditor.ts',
    {
      ...h.deps,
      useMenuRecordNavigation: () => ({ rememberView() {} }),
      useMenuSection: () => ({
        kitchenId: h.kitchenId,
        menuId,
        sectionId,
        itemRows,
        canWrite: ref(true),
        moveItem: (...args) => {
          intent = args
          return pending.promise
        },
      }),
    },
    'useMenuSectionItemsEditor()'
  )
  assert.equal(api.canMove(itemRows.value[0], 'up'), false)
  assert.equal(api.canMove(itemRows.value[1], 'down'), false)
  const request = api.move(itemRows.value[1], 'up')
  assert.equal(api.moving.value, 'b')
  assert.deepEqual(intent.slice(0, 5), [
    h.kitchenId.value,
    'menu',
    'section',
    'b',
    'up',
  ])
  assert.equal(api.canMove(itemRows.value[0], 'down'), false)
  sectionId.value = 'other'
  sectionId.value = 'section'
  assert.equal(intent[5](), false)
  pending.reject(Error('Obsolete failure'))
  await request
  assert.deepEqual(h.notices, [])
  assert.equal(api.moving.value, '')
})

test('catalogue creation sends only the name, or a name and optional description', async () => {
  for (const description of ['', '  Fresh basil  ']) {
    const h = setup(),
      drafts = []
    const api = evaluate(
      component('Menu/Items/Create/Index'),
      {
        ...h.deps,
        defineProps: () => ({ kitchenId: h.kitchenId.value }),
        defineEmits: () => () => {},
        useItemActions: () => ({
          createItem: async (draft, target) => {
            drafts.push({ draft, target })
            return { id: 'item' }
          },
        }),
        useItemImageUpload: () => ({ uploadItemImage() {} }),
      },
      '({addItem,name,description})',
      true
    )
    await api.addItem()
    assert.equal(drafts.length, 0)
    api.name.value = '  Item  '
    api.description.value = description
    await api.addItem()
    assert.deepEqual(drafts, [
      {
        draft: description
          ? { name: 'Item', description: 'Fresh basil' }
          : { name: 'Item' },
        target: { kitchenId: h.kitchenId.value },
      },
    ])
  }
})

test('Menu new-name creation asks for each price and preserves an explicit zero', async () => {
  const h = setup(),
    drafts = [],
    placements = []
  const api = evaluate(
    component('Menu/Menus/Items/Add/ByName'),
    {
      ...h.deps,
      useMenuSection: () => ({
        kitchenId: h.kitchenId,
        menuId: ref('menu'),
        sectionId: ref('section'),
        itemSource: {
          dishes: ref([]),
          outcome: ref('empty'),
          error: ref(null),
        },
        activeItemRows: ref([]),
        canWrite: ref(true),
        createItem: async (input) => placements.push(input),
      }),
      useItemActions: () => ({
        createItem: async (draft) => {
          drafts.push(draft)
          return { id: draft.name }
        },
      }),
    },
    '({addNames,names,prices,error})',
    true
  )
  api.names.value = 'Bread\nSoup'
  api.prices.value = { Bread: 0 }
  await api.addNames()
  assert.match(api.error.value, /normal price for Soup/)
  assert.equal(drafts.length, 0)
  api.prices.value.Soup = 8
  await api.addNames()
  assert.deepEqual(drafts, [
    { name: 'Bread', price: 0 },
    { name: 'Soup', price: 8 },
  ])
  assert.equal(placements.length, 2)
})
