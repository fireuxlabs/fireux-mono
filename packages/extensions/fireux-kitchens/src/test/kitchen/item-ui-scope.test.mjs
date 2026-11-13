import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import { commandScopeDeps } from '../command-scope-fixture.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { ref, computed, watch } from 'vue'
function evaluate(relative, deps, result, vue = false) {
  deps = commandScopeDeps({
    useRoute: () => ({ fullPath: '/dishes/dish' }),
    ...deps,
  })
  if (vue) deps = { ...specification, ...deps }
  if (relative === component('Menu/Menus/Items/Add/ByName')) {
    deps.useMenuSectionItemCreation = evaluate(
      '../../runtime/kitchen/composables/workspace/menus/useMenuSectionItemCreation.ts',
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
    dishId = ref('dish'),
    notices = [],
    unmount = []
  const useItemEditorScope = evaluate(
    '../../runtime/kitchen/composables/item/useItemEditorScope.ts',
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
    useItemEditorScope,
    useKitchenWorkspace: () => ({
      id: kitchenId,
      outcome: ref('ready'),
      data: ref({ id: 'k' }),
    }),
    useRouteParam: () => dishId,
    useKitchenItemsContext: () => ({
      catalogue: { singular: 'dish', path: '/dishes' },
    }),
    onBeforeUnmount: (fn) => unmount.push(fn),
    useToastify: () => ({ add: (value) => notices.push(value) }),
    URL: { revokeObjectURL() {}, createObjectURL: () => 'blob' },
  }
  return { currentUser, kitchenId, dishId, notices, deps, unmount }
}
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const component = (name) => `../../runtime/kitchen/components/${name}.vue`
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
          defineProps: () => ({}),
          defineEmits: () => () => {},
          useKitchenItemsContext: () => ({
            kitchenId: h.kitchenId,
            readOnly: ref(false),
            catalogue: { itemKind: 'food' },
          }),
          useItemCreate: () => ({ createItem: () => pending.promise }),
          useItemImageUpload: () => ({
            uploadItemImage: (x) => uploads.push(x),
          }),
        },
        '({addItem,price,name,imageFile,message,saving})',
        true
      )
      api.price.value = 13
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
      defineProps: () => ({}),
      defineEmits: () => () => {},
      useKitchenItemsContext: () => ({
        kitchenId: h.kitchenId,
        readOnly: ref(false),
        catalogue: { itemKind: 'food' },
      }),
      useItemCreate: () => ({ createItem: () => pending.promise }),
      useItemImageUpload: () => ({
        uploadItemImage: async (x) => {
          uploads.push(x)
          throw Error('upload failed')
        },
      }),
    },
    '({addItem,price,name,imageFile,message})',
    true
  )
  api.price.value = 13
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
        useItemCreate: () => ({ createItem: () => pending.promise }),
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
test('delete does not navigate or toast after record changes, including same-tick round trip', async () => {
  const h = setup(),
    pending = deferred(),
    navigations = []
  const api = evaluate(
    component('Menu/Items/Delete'),
    {
      ...h.deps,
      navigateTo: (x) => navigations.push(x),
      window: { confirm: () => true },
      useItemUsage: () => ({
        usages: ref([]),
        ready: ref(true),
        error: ref(null),
      }),
      useKitchenItemContext: () => ({
        kitchenId: h.kitchenId,
        itemId: h.dishId,
        item: ref({ name: 'Pizza' }),
        canWrite: ref(true),
        catalogue: { singular: 'dish', path: '/dishes' },
      }),
      defineProps: () => ({ remove: () => pending.promise }),
    },
    '({deleteSelectedItem,deleting})',
    true
  )
  const result = api.deleteSelectedItem()
  h.dishId.value = 'other'
  h.dishId.value = 'dish'
  pending.resolve()
  await result
  assert.deepEqual(navigations, [])
  assert.deepEqual(h.notices, [])
  assert.equal(api.deleting.value, false)
})

test('description proposal snapshots its body and never dispatches after focus changes during credentials', async () => {
  for (const changed of [false, true]) {
    const h = setup(),
      pending = deferred(),
      calls = []
    h.currentUser.value = { uid: 'u', getIdToken: () => pending.promise }
    const api = evaluate(
      component('Menu/Items/DescriptionAssistant'),
      {
        ...h.deps,
        useAuth: () => ({ currentUser: h.currentUser }),
        useFireUXConfig: () => ({ appId: 'app' }),
        useKitchenItemContext: () => ({
          kitchenId: h.kitchenId,
          itemId: h.dishId,
          canWrite: ref(true),
          item: ref({}),
          catalogue: {},
        }),
        useItemUpdate: () => ({ updateItem: async () => {} }),
        $fetch: async (...args) => {
          calls.push(args)
          return { proposal: 'Proposed' }
        },
      },
      '({proposeDescription,notes,proposal})',
      true
    )
    api.notes.value = 'Original'
    const result = api.proposeDescription()
    api.notes.value = 'Changed'
    if (changed) {
      h.dishId.value = 'other'
      h.dishId.value = 'dish'
    }
    pending.resolve('token')
    await result
    assert.equal(calls.length, 0)
    assert.equal(api.notes.value, changed ? '' : 'Changed')
    assert.equal(api.proposal.value, '')
  }
})
test('category update ignores stale rejection and releases busy state on Kitchen change', async () => {
  const h = setup(),
    pending = deferred()
  const api = evaluate(
    component('Menu/Items/Categories'),
    {
      ...h.deps,
      defineProps: () => ({}),
      defineEmits: () => () => {},
      useKitchenItemsContext: () => ({
        kitchenId: h.kitchenId,
        dishes: ref([]),
        readOnly: ref(false),
        catalogue: { itemKind: 'food' },
      }),
      useItemUpdate: () => ({ updateItem: () => pending.promise }),
    },
    '({save,error,busy,saved})',
    true
  )
  const result = api.save('dish', 'main')
  h.kitchenId.value = 'other'
  h.kitchenId.value = 'k'
  pending.reject(Error('Old error'))
  await result
  assert.equal(api.error.value, '')
  assert.equal(api.saved.value, '')
  assert.equal(api.busy.value, false)
})

test('record edit ignores old failures and spec saves a detached payload', async () => {
  const h = setup(),
    pending = deferred()
  const identity = {
    storageKitchenId: ref('k'),
    rootCollection: ref('kitchens'),
    databaseId: ref('db'),
    kitchenId: h.kitchenId,
    itemId: h.dishId,
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
      useItemUpdate: () => ({ updateItem: () => pending.promise }),
      useItemImageUpload: () => ({ uploadItemImage: async () => {} }),
    },
    '({updateItemField})',
    true
  )
  const result = edit.updateItemField({ name: 'New' }, 'Saved', 'Failed')
  h.dishId.value = 'other'
  h.dishId.value = 'dish'
  pending.reject(Error('Stale'))
  await result
  assert.deepEqual(h.notices, [])
})
test('Surviving Item route completes its live removal but rejects external intent', async () => {
  for (const change of ['own-live', 'account', 'kitchen', 'route', 'dispose']) {
    const h = setup(),
      pending = deferred(),
      dish = ref({ id: 'dish', name: 'Pizza' }),
      routePath = ref('/dishes/dish'),
      routeView = ref('preparation'),
      navigations = [],
      disposed = []
    const useItemEditorScope = evaluate(
      new URL(
        '../../runtime/kitchen/composables/item/useItemEditorScope.ts',
        import.meta.url
      ),
      {
        watch,
        onBeforeUnmount: (fn) => disposed.push(fn),
        useAuth: () => ({ currentUser: h.currentUser }),
      },
      'useItemEditorScope'
    )
    const api = evaluate(
      component('Menu/Items/Detail/Index'),
      {
        ...h.deps,
        useItemEditorScope,
        useRoute: () => ({
          get query() {
            return { view: routeView.value }
          },
          get fullPath() {
            return routePath.value
          },
        }),
        navigateTo: async (x) => navigations.push(x),
        provideKitchenItemContext: (detail) => detail,
        useKitchenItemRead: () => ({
          item: dish,
          itemId: h.dishId,
          kitchenId: h.kitchenId,
          pending: ref(false),
          canWrite: ref(true),
          catalogue: { singular: 'dish', path: '/dishes' },
        }),
        useItemDelete: () => ({ deleteItem: () => pending.promise }),
      },
      '({removeItem,views,view})',
      true
    )
    assert.deepEqual(
      api.views.map((view) => view.id),
      ['details', 'menus']
    )
    for (const legacy of ['preparation', 'spec', 'pricing']) {
      routeView.value = legacy
      assert.equal(api.view.value, 'details')
    }
    routeView.value = 'menus'
    assert.equal(api.view.value, 'menus')

    const result = api.removeItem()
    dish.value = null
    if (change === 'account') {
      h.currentUser.value = null
      h.currentUser.value = { uid: 'user' }
    } else if (change === 'kitchen') {
      h.kitchenId.value = 'other'
      h.kitchenId.value = 'k'
    } else if (change === 'route') {
      routePath.value = '/other'
      routePath.value = '/dishes/dish'
    } else if (change === 'dispose') disposed.forEach((fn) => fn())
    pending.resolve()
    await result
    assert.deepEqual(navigations, change === 'own-live' ? ['/dishes'] : [])
    assert.equal(h.notices.length, change === 'own-live' ? 1 : 0)
  }
})

for (const state of ['loading', 'error', 'referenced']) {
  test(`Item removal does not dispatch while usage is ${state}`, async () => {
    const h = setup()
    let removed = 0
    let confirmed = 0
    const api = evaluate(
      component('Menu/Items/Delete'),
      {
        ...h.deps,
        window: {
          confirm: () => {
            confirmed++
            return true
          },
        },
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
          itemId: h.dishId,
          item: ref({ name: 'Pizza' }),
          canWrite: ref(true),
          catalogue: { singular: 'dish' },
        }),
        defineProps: () => ({
          remove: async () => {
            removed++
          },
        }),
      },
      '({deleteSelectedItem})',
      true
    )
    await api.deleteSelectedItem()
    assert.equal(removed, 0)
    assert.equal(confirmed, 0)
  })
}

test('Menu entry removal captures scope and suppresses obsolete completion', async () => {
  const h = setup(),
    pending = deferred(),
    menuId = ref('menu'),
    sectionId = ref('section')
  let intent
  const api = evaluate(
    '../../runtime/kitchen/composables/workspace/menus/useMenuSectionItemsEditor.ts',
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
    '../../runtime/kitchen/composables/workspace/menus/useMenuSectionItemsEditor.ts',
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

test('item creation requires a price and submits explicit zero without a fixed type', async () => {
  for (const itemKind of ['food', 'drink']) {
    const h = setup(),
      drafts = []
    const api = evaluate(
      component('Menu/Items/Create/Index'),
      {
        ...h.deps,
        defineProps: () => ({ itemKind }),
        defineEmits: () => () => {},
        useKitchenItemsContext: () => ({
          kitchenId: h.kitchenId,
          readOnly: ref(false),
          catalogue: { itemKind },
        }),
        useItemCreate: () => ({
          createItem: async (draft) => {
            drafts.push(draft)
            return { id: 'item' }
          },
        }),
        useItemImageUpload: () => ({ uploadItemImage() {} }),
      },
      '({addItem,name,price,validPrice})',
      true
    )
    api.name.value = 'Item'
    assert.equal(api.validPrice.value, false)
    await api.addItem()
    assert.equal(drafts.length, 0)
    api.price.value = 0
    assert.equal(api.validPrice.value, true)
    await api.addItem()
    assert.equal(drafts[0].price, 0)
    assert.equal(drafts[0].item_kind, undefined)
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
      useItemCreate: () => ({
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
