import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, watch } from 'vue'
function load(path, dependencies, name) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '').replace(/^export type[^\n]*from[^\n]*\n/gm, '').replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(source)}; return ${name}`, Object.keys(dependencies))(...Object.values(dependencies))
}
const createError = x => Object.assign(new Error(x.statusMessage), x)
const requireFirestoreDocumentId = value => {
  if (typeof value !== 'string' || !value || value.includes('/')) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  return value
}
const readMembershipAccessIds = load('../../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts', {}, 'readMembershipAccessIds')
const readKitchenAccessIds = load('../../runtime/kitchen/utils/kitchen-access.ts', { readMembershipAccessIds, KITCHEN_USER_LIMIT: 500 }, 'readKitchenAccessIds')
const requireKitchenMutationAuthority = load('../../runtime/kitchen/server/core/mutation-authority.ts', {
  serverAppUsersTarget: app => `apps/${app}/users`, serverKitchenAccessTarget: app => `kitchen_access/${app}/users`,
  FIRESTORE_MUTATION_TARGETS: { kitchens: 'kitchens', places: 'places' }, readKitchenAccessIds,
  isAppUserSubscription: value => ['free', 'premium', 'business'].includes(value), createError,
}, 'requireKitchenMutationAuthority')
const preparation = load('../../runtime/kitchen/models/recipe-preparation.ts', {}, '({validateRecipePreparation,normalizeRecipePreparation})')
const { normalizeTranslatedText } = load('../../runtime/kitchen/utils/recipe.ts', preparation, '({normalizeTranslatedText})')
const readRecipeUpdate = load('../../runtime/kitchen/utils/recipe-update-input.ts', { ...preparation, normalizeTranslatedText }, 'readRecipeUpdate')
function harness() {
  const at = { seconds: 1, nanoseconds: 0 }, writes = []
  const records = new Map([
    ['kitchens/k', {}], ['places/k', {}],
    ['apps/app/users/u', { role: 'user', subscription: 'free', created: { at } }],
    ['kitchen_access/app/users/u', { ids: ['k'], membership_created_at: at }],
    ['kitchens/k/recipes/existing', { name: 'Existing' }],
  ])
  let before = () => {}
  const commands = load('../../runtime/kitchen/server/recipes/commands.ts', {
    createError, requireFirestoreDocumentId, requireKitchenMutationAuthority, readRecipeUpdate, normalizeTranslatedText, ...preparation,
    normalizeSlug: value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-'), defineFirestoreMutationTarget: value => value.collectionPath,
    readKitchenMutationActor: async () => ({ uid: 'u', runtimeAppId: 'app' }), serverAuditStamp: x => x,
    runGuardedServerTransaction: async (_, run) => { before(); return run({
      read: async (target, id) => ({ exists: records.has(`${target}/${id}`), data: records.get(`${target}/${id}`) }),
      create: (target, id, data) => { writes.push(['create', target, id, data]); records.set(`${target}/${id}`, data) },
      update: (...args) => writes.push(['update', ...args]), delete: (...args) => writes.push(['delete', ...args]),
    }) },
  }, '({createRecipe, updateRecipe, deleteRecipe})')
  return { ...commands, records, writes, before: fn => { before = fn } }
}
const draft = { name: 'Dough', source_language: 'en', names: { en: 'Dough', de: 'Teig' }, descriptions: {}, preparation: { status: 'draft' } }
test('Recipe create is no-overwrite, retains language seed and server ownership', async () => {
  const h = harness(); assert.deepEqual(await h.createRecipe({}, { kitchenId: 'k', draft }), { id: 'dough' })
  const data = h.writes[0][3]; assert.equal(data.slug,'dough'); assert.equal(data.kitchen_id,'k'); assert.equal(data.names.de,'Teig')
  assert.deepEqual(data.created,{by:'u',appId:'app'})
  await assert.rejects(h.createRecipe({}, { kitchenId:'k', draft }),{statusCode:409}); assert.equal(h.writes.length,1)
})
test('Recipe supported update fields and document-only delete retain existing semantics', async () => {
  const h=harness(); await h.updateRecipe({}, {kitchenId:'k',recipeId:'existing',changes:{description:' Note ',names:{en:'New'},preparation:{status:'draft'}}})
  assert.equal(h.writes[0][3].description,'Note'); assert.equal('slug' in h.writes[0][3],false)
  await h.deleteRecipe({}, {kitchenId:'k',recipeId:'existing'});assert.deepEqual(h.writes[1],['delete','kitchens/k/recipes','existing'])
})
test('all Recipe commands reread revoked/recreated membership and exact access',async()=>{
  for(const action of ['createRecipe','updateRecipe','deleteRecipe'])for(const change of [h=>h.records.delete('apps/app/users/u'),h=>{h.records.get('apps/app/users/u').created.at={seconds:2,nanoseconds:0}},h=>{h.records.get('kitchen_access/app/users/u').ids=['other']}]){
    const h=harness();h.before(()=>change(h));const input=action==='createRecipe'?{kitchenId:'k',draft}:action==='updateRecipe'?{kitchenId:'k',recipeId:'existing',changes:{name:'New'}}:{kitchenId:'k',recipeId:'existing'}
    await assert.rejects(h[action]({},input));assert.equal(h.writes.length,0)
  }
})
test('Recipe strict envelopes and existing field/preparation validation reject unsafe writes',async()=>{
  for(const changes of [{slug:'new'},{kitchen_id:'other'},{updated:{}},{name:''},{names:{en:1}},{preparation:{yield:{quantity:-1}}}]){
    const h=harness();await assert.rejects(h.updateRecipe({}, {kitchenId:'k',recipeId:'existing',changes}),{statusCode:400});assert.equal(h.writes.length,0)
  }
  const h=harness();await assert.rejects(h.createRecipe({}, {kitchenId:'k',draft:{...draft,id:'caller-id'}}),{statusCode:400})
  await assert.rejects(h.updateRecipe({}, {kitchenId:'k',recipeId:'absent',changes:{name:'New'}}),{statusCode:404})
})

test('Recipe language delta merges transaction snapshot and explicit empty text clears only that language',async()=>{
 const h=harness();h.records.set('kitchens/k/recipes/existing',{names:{en:'Old',de:'Concurrent German'},descriptions:{en:'Old description',de:'German notes'}})
 await h.updateRecipe({}, {kitchenId:'k',recipeId:'existing',changes:{name:'New',description:'',names:{en:'New'},descriptions:{en:''}}})
 assert.deepEqual(h.writes[0][3].names,{en:'New',de:'Concurrent German'})
 assert.deepEqual(h.writes[0][3].descriptions,{de:'German notes'})
 assert.equal(h.writes[0][3].name,'New');assert.equal(h.writes[0][3].description,'')
})
