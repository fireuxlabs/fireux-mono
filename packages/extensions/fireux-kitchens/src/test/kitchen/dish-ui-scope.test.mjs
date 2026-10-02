import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { ref, computed, watch } from 'vue'
function evaluate(relative, deps, result, vue = false) {
  let source = readFileSync(new URL(relative, import.meta.url), 'utf8')
  if (vue) source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source.replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '').replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(source)}; return ${result}`, Object.keys(deps))(...Object.values(deps))
}
function setup() {
  const currentUser = ref({ uid: 'u' }), kitchenId = ref('k'), dishId = ref('dish'), notices = [], unmount = []
  const useDishEditorScope = evaluate('../../runtime/kitchen/composables/dish/useDishEditorScope.ts', { watch, onBeforeUnmount: fn => unmount.push(fn), useAuth: () => ({ currentUser }) }, 'useDishEditorScope')
  const deps = { ref, computed, watch, useDishEditorScope, onBeforeUnmount: fn => unmount.push(fn), useToastify: () => ({ add: value => notices.push(value) }), URL: { revokeObjectURL() {}, createObjectURL: () => 'blob' } }
  return { currentUser, kitchenId, dishId, notices, deps, unmount }
}
function deferred() { let resolve, reject; const promise = new Promise((yes,no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
const component = name => `../../runtime/kitchen/components/Workspace/${name}.vue`
test('create does not upload or show stale outcomes after Kitchen/account round trips', async () => {
  for (const scope of ['kitchen', 'account']) for (const outcome of ['success', 'error']) {
    const h = setup(), pending = deferred(), uploads = []
    const api = evaluate(component('Dishes/Write'), { ...h.deps, useKitchenDishesContext: () => ({ kitchenId: h.kitchenId, readOnly: ref(false), catalogue: { itemKind: 'food' } }), useDishCreate: () => ({ createDish: () => pending.promise }), useDishImageUpload: () => ({ uploadDishImage: x => uploads.push(x) }) }, '({addDish,name,imageFile,message,saving})', true)
    api.name.value = 'Pizza'; api.imageFile.value = { name: 'image' }; const result = api.addDish()
    if (scope === 'kitchen') { h.kitchenId.value = 'other'; h.kitchenId.value = 'k' }
    else { h.currentUser.value = null; h.currentUser.value = { uid: 'u' } }
    if (outcome === 'success') pending.resolve({ id: 'pizza' }); else pending.reject(Error('Old failure'))
    await result
    assert.equal(uploads.length, 0); assert.equal(h.notices.length, 0); assert.equal(api.message.value, ''); assert.equal(api.saving.value, false)
  }
})
test('create captures original upload and reports saved Dish with failed image honestly', async () => {
  const h = setup(), pending = deferred(), uploads = [], original = { name: 'original' }
  const api = evaluate(component('Dishes/Write'), { ...h.deps, useKitchenDishesContext: () => ({ kitchenId: h.kitchenId, readOnly: ref(false), catalogue: { itemKind: 'food' } }), useDishCreate: () => ({ createDish: () => pending.promise }), useDishImageUpload: () => ({ uploadDishImage: async x => { uploads.push(x); throw Error('upload failed') } }) }, '({addDish,name,imageFile,message})', true)
  api.name.value = 'Pizza'; api.imageFile.value = original; const result = api.addDish(); api.imageFile.value = { name: 'new' }; pending.resolve({ id: 'pizza' }); await result
  assert.equal(uploads[0].file.name, 'original'); assert.match(api.message.value, /Created Pizza, but its image was not saved/)
})
test('Menu name flow stops before placement on destination change; failed placement retains saved Dish truth', async () => {
  for (const changed of [true, false]) {
    const h = setup(), pending = deferred(), menuId = ref('menu'), sectionId = ref('section'), placements = []
    const api = evaluate(component('Menus/Items/AddByName'), { ...h.deps, useKitchenWorkspaceMenuSection: () => ({ kitchenId: h.kitchenId, menuId, sectionId, dishes: ref([]), itemRows: ref([]), canWrite: ref(true), createItem: async input => { placements.push(input); throw Error('placement failed') } }), useDishCreate: () => ({ createDish: () => pending.promise }) }, '({addNames,names,error,busy})', true)
    api.names.value = 'Pizza'; const result = api.addNames()
    if (changed) { sectionId.value = 'other'; sectionId.value = 'section' }
    pending.resolve({ id: 'pizza' }); await result
    assert.equal(placements.length, changed ? 0 : 1)
    if (changed) assert.equal(api.error.value, '')
    else { assert.match(api.error.value, /exists, but adding it to this Menu failed/); assert.equal(placements[0].sectionId, 'section') }
  }
})
test('delete does not navigate or toast after record changes, including same-tick round trip', async () => {
  const h = setup(), pending = deferred(), navigations = []
  const api = evaluate(component('Dishes/Delete'), { ...h.deps, navigateTo: x => navigations.push(x), window: { confirm: () => true }, useKitchenWorkspaceDish: () => ({ kitchenId: h.kitchenId, dishId: h.dishId, dish: ref({ name: 'Pizza' }), canWrite: ref(true), catalogue: { singular: 'dish', path: '/dishes' } }), defineProps: () => ({ remove: () => pending.promise }) }, '({deleteSelectedDish,deleting})', true)
  const result = api.deleteSelectedDish(); h.dishId.value = 'other'; h.dishId.value = 'dish'; pending.resolve(); await result
  assert.deepEqual(navigations, []); assert.deepEqual(h.notices, []); assert.equal(api.deleting.value, false)
})

test('description proposal snapshots its body and never dispatches after focus changes during credentials', async () => {
  for (const changed of [false, true]) {
    const h = setup(), pending = deferred(), calls = []
    h.currentUser.value = { uid: 'u', getIdToken: () => pending.promise }
    const api = evaluate(component('Dishes/DescriptionAssistant'), { ...h.deps,
      useAuth: () => ({ currentUser: h.currentUser }), useFireUXConfig: () => ({ appId: 'app' }),
      useKitchenWorkspaceDish: () => ({ kitchenId: h.kitchenId, dishId: h.dishId, canWrite: ref(true), dish: ref({}), catalogue: {} }),
      useDishUpdate: () => ({ updateDish: async () => {} }), $fetch: async (...args) => { calls.push(args); return { proposal: 'Proposed' } },
    }, '({proposeDescription,notes,proposal})', true)
    api.notes.value = 'Original'; const result = api.proposeDescription(); api.notes.value = 'Changed'
    if (changed) { h.dishId.value = 'other'; h.dishId.value = 'dish' }
    pending.resolve('token'); await result
    assert.equal(calls.length, changed ? 0 : 1)
    if (!changed) assert.equal(calls[0][1].body.notes, 'Original')
    else assert.equal(api.proposal.value, '')
  }
})
test('category update ignores stale rejection and releases busy state on Kitchen change', async () => {
  const h = setup(), pending = deferred()
  const api = evaluate(component('Dishes/Categories'), { ...h.deps,
    dishCategories: [], useKitchenDishesContext: () => ({ kitchenId: h.kitchenId, dishes: ref([]), readOnly: ref(false) }),
    useDishUpdate: () => ({ updateDish: () => pending.promise }),
  }, '({save,error,busy,saved})', true)
  const result = api.save('dish','main'); h.kitchenId.value = 'other'; h.kitchenId.value = 'k'; pending.reject(Error('Old error')); await result
  assert.equal(api.error.value, ''); assert.equal(api.saved.value, ''); assert.equal(api.busy.value, false)
})

test('record edit ignores old failures and spec saves a detached payload', async () => {
  const h = setup(), pending = deferred()
  const identity = { kitchenId: h.kitchenId, dishId: h.dishId, dish: ref({ name: 'Pizza' }), canWrite: ref(true), catalogue: { singular: 'dish' } }
  const edit = evaluate(component('Dishes/Edit'), { ...h.deps, useAuth: () => ({ currentUser: h.currentUser }), useKitchenWorkspaceDish: () => identity, useDishUpdate: () => ({ updateDish: () => pending.promise }), useDishImageUpload: () => ({ uploadDishImage: async () => {} }) }, '({updateDishField})', true)
  const result = edit.updateDishField({ name: 'New' }, 'Saved', 'Failed'); h.dishId.value = 'other'; h.dishId.value = 'dish'; pending.reject(Error('Stale')); await result; assert.deepEqual(h.notices, [])
  const second = deferred(), calls = []
  const spec = evaluate(component('Dishes/Spec'), { ...h.deps, useRoute: () => ({ query: {} }), useKitchenWorkspaceDish: () => identity,
    useKitchenIngredients: () => ({ ingredients: ref([]), error: ref(null) }), useKitchenPrepItems: () => ({ prepItems: ref([]), error: ref(null) }), useKitchenRecipeCollection: () => ({ recipes: ref([]), error: ref(null) }),
    useKitchenPrepItemCreate: () => ({ createPrepItem: async () => {} }), useDishUpdate: () => ({ updateDish: (...args) => { calls.push(args); return second.promise } }),
  }, '({save,draft,error,editing,saving})', true)
  const saved = spec.save(); spec.draft.value.portion = 99; assert.equal(calls[0][1].spec.portion, 1)
  h.dishId.value = 'other'; second.reject(Error('Stale')); await saved
  assert.equal(spec.error.value, ''); assert.equal(spec.saving.value, false)
})
test('Menu Dish edit drops stale section success before showing a toast', async () => {
  const h = setup(), pending = deferred(), menuId = ref('menu'), sectionId = ref('section')
  const api = evaluate(component('Menus/Items/Read'), { ...h.deps, useMenuRecordNavigation: () => ({ openMenuRecord() {} }), useAuth: () => ({ currentUser: h.currentUser }),
    useKitchenWorkspaceMenuSection: () => ({ kitchenId: h.kitchenId, menuId, sectionId, updateDish: () => pending.promise }),
  }, '({saveDishPatch})', true)
  const result = api.saveDishPatch({ dishId: 'dish' }, { name: 'Name' }, 'Saved'); sectionId.value = 'other'; sectionId.value = 'section'; pending.resolve(); await result
  assert.deepEqual(h.notices, [])
})
test('Surviving Dish route completes its live removal but rejects external intent', async () => {
  for (const change of ['own-live', 'account', 'kitchen', 'route', 'dispose']) {
    const h = setup(), pending = deferred(), dish = ref({ id: 'dish', name: 'Pizza' }), routePath = ref('/dishes/dish'), navigations = [], disposed = []
    const useDishEditorScope = evaluate(new URL('../../runtime/kitchen/composables/dish/useDishEditorScope.ts', import.meta.url), { watch, onBeforeUnmount: fn => disposed.push(fn), useAuth: () => ({ currentUser: h.currentUser }) }, 'useDishEditorScope')
    const api = evaluate(component('Dishes/Dish'), { ...h.deps, useDishEditorScope,
      useRoute: () => ({ query: {}, get fullPath() { return routePath.value } }), navigateTo: async x => navigations.push(x),
      useKitchenWorkspaceDish: () => ({ dish, dishId: h.dishId, kitchenId: h.kitchenId, pending: ref(false), canWrite: ref(true), catalogue: { singular: 'dish', path: '/dishes' } }),
      useDishDelete: () => ({ deleteDish: () => pending.promise }),
    }, '({removeDish})', true)
    const result = api.removeDish(); dish.value = null
    if (change === 'account') { h.currentUser.value = null; h.currentUser.value = { uid: 'user' } }
    else if (change === 'kitchen') { h.kitchenId.value = 'other'; h.kitchenId.value = 'k' }
    else if (change === 'route') { routePath.value = '/other'; routePath.value = '/dishes/dish' }
    else if (change === 'dispose') disposed.forEach(fn => fn())
    pending.resolve(); await result
    assert.deepEqual(navigations, change === 'own-live' ? ['/dishes'] : [])
    assert.equal(h.notices.length, change === 'own-live' ? 1 : 0)
  }
})
