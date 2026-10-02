import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, watch } from 'vue'
function load(path, dependencies, name) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '').replace(/^export type \{[\s\S]*?\} from[^\n]*\n/gm, '').replace(/^export /gm, '')
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
const normalizeKitchenPrepItemTranslatedText=load('../../runtime/kitchen/utils/prep-item.ts',{},'normalizeKitchenPrepItemTranslatedText')
function harness(){
 const at={seconds:1,nanoseconds:0},writes=[],records=new Map([['kitchens/k',{}],['places/k',{}],['apps/app/users/u',{role:'user',subscription:'free',created:{at}}],['kitchen_access/app/users/u',{ids:['k'],membership_created_at:at}]])
 let before=()=>{}
 const create=load('../../runtime/kitchen/server/prep-items/create.ts',{createError,requireFirestoreDocumentId,requireKitchenMutationAuthority,normalizeKitchenPrepItemTranslatedText,normalizeSlug:value=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-'),defineFirestoreMutationTarget:x=>x.collectionPath,readKitchenMutationActor:async()=>({uid:'u',runtimeAppId:'app'}),serverAuditStamp:x=>x,runGuardedServerTransaction:async(_,run)=>{before();return run({read:async(t,id)=>({exists:records.has(`${t}/${id}`),data:records.get(`${t}/${id}`)}),create:(t,id,data)=>{writes.push({t,id,data});records.set(`${t}/${id}`,data)}})}},'createKitchenPrepItem')
 return {create,writes,records,before:fn=>{before=fn}}
}
const draft={name:'Sauce',source_language:'en',names:{en:'Sauce',de:'Sosse'},yield:{quantity:1,unit:'portion'},inputs:[],method:[' Mix ']}
test('Prep creation is atomic no-overwrite, scoped/stamped and preserves supported defaults',async()=>{
 const h=harness();assert.deepEqual(await h.create({}, {kitchenId:'k',draft}),{id:'sauce'})
 const data=h.writes[0].data;assert.equal(data.kitchen_id,'k');assert.equal(data.names.de,'Sosse');assert.equal(data.station,'');assert.deepEqual(data.method,['Mix']);assert.deepEqual(data.created,{by:'u',appId:'app'})
 await assert.rejects(h.create({}, {kitchenId:'k',draft}),{statusCode:409});assert.equal(h.writes.length,1)
})
test('Prep denies revoked or recreated membership and wrong Kitchen association inside transaction',async()=>{
 for(const change of [h=>h.records.delete('apps/app/users/u'),h=>{h.records.get('apps/app/users/u').created.at={seconds:2,nanoseconds:0}},h=>{h.records.get('kitchen_access/app/users/u').ids=['other']}]){
  const h=harness();h.before(()=>change(h));await assert.rejects(h.create({}, {kitchenId:'k',draft}));assert.equal(h.writes.length,0)
 }
})
test('Prep validates supplied shape, units, quantities and reference ids without new capacity limits',async()=>{
 for(const patch of [{name:''},{kitchen_id:'other'},{names:{en:3}},{yield:{quantity:-1,unit:'g'}},{yield:{quantity:1,unit:'litres'}},{inputs:[{ingredient_id:'a/b',quantity:1,unit:'g'}]},{inputs:'bad'},{method:[3]},{recipe_id:'a/b'}]){
  const h=harness();await assert.rejects(h.create({}, {kitchenId:'k',draft:{...draft,...patch}}));assert.equal(h.writes.length,0)
 }
 const h=harness();await h.create({}, {kitchenId:'k',draft:{name:'Default',source_language:'en'}});assert.deepEqual(h.writes[0].data.yield,{quantity:0,unit:''})
})
