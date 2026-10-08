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
  serverAppUsersTarget: app => `apps/${app}/users`, serverKitchenAccessTarget: app => 'kitchen_access',
  FIRESTORE_MUTATION_TARGETS: { kitchens: 'kitchens', places: 'places' }, readKitchenAccessIds,
  isAppUserSubscription: value => ['free', 'premium', 'business'].includes(value), createError,
}, 'requireKitchenMutationAuthority')
const kitchenWasteEventRecordTool=load('../../runtime/kitchen/tools/waste/record-event.ts',{},'kitchenWasteEventRecordTool')
function harness(){
 const at={seconds:1,nanoseconds:0},writes=[],records=new Map([['kitchens/k',{}],['places/k',{}],['apps/app/users/u',{role:'user',subscription:'free',created:{at}}],['kitchen_access/u',{ apps: { 'app': {ids:['k'],membership_created_at:at} } }]])
 let before=()=>{}
 const record=load('../../runtime/kitchen/server/waste/record.ts',{createError,requireFirestoreDocumentId,requireKitchenMutationAuthority,kitchenWasteEventRecordTool,randomUUID:()=> 'event',defineFirestoreMutationTarget:x=>{assert.deepEqual(x.verbs,['create']);return x.collectionPath},readKitchenMutationActor:async()=>({uid:'u',runtimeAppId:'app'}),serverAuditStamp:x=>({...x,at:'server-time'}),runGuardedServerTransaction:async(_,run)=>{before();return run({read:async(t,id)=>({exists:records.has(`${t}/${id}`),data:records.get(`${t}/${id}`)}),create:(...args)=>writes.push(args)})}},'recordKitchenWaste')
 return {record,writes,records,before:fn=>{before=fn}}
}
const observation={item_name:' Bread ',quantity:2,unit:'pieces',reason:'spoilage',source:'storage',notes:' Old '}
test('Waste command creates only a server-stamped observation with existing values',async()=>{
 const h=harness();assert.deepEqual(await h.record({}, {kitchenId:'k',observation}),{id:'event'})
 const [target,id,data]=h.writes[0];assert.equal(target,'kitchens/k/waste-events');assert.equal(id,'event');assert.equal(data.item_name,'Bread');assert.equal(data.notes,'Old');assert.equal(data.occurred_at,'server-time');assert.deepEqual(data.created,{by:'u',appId:'app',at:'server-time'})
})
test('Waste rejects revoked/recreated membership and unrelated Kitchen access in transaction',async()=>{
 for(const change of [h=>h.records.delete('apps/app/users/u'),h=>{h.records.get('apps/app/users/u').created.at={seconds:2,nanoseconds:0}},h=>{h.records.get('kitchen_access/u').apps.app.ids=['other']}]){
  const h=harness();h.before(()=>change(h));await assert.rejects(h.record({}, {kitchenId:'k',observation}));assert.equal(h.writes.length,0)
 }
})
test('Waste enforces existing tool bounds/enums and prevents caller-owned identity/time/stamps',async()=>{
 for(const patch of [{item_name:''},{item_name:'a'.repeat(301)},{quantity:0},{quantity:1000001},{quantity:Infinity},{unit:'a'.repeat(81)},{reason:'invented'},{source:'invented'},{notes:'a'.repeat(5001)},{occurred_at:'yesterday'},{created:{}},{kitchen_id:'other'}]){
  const h=harness();await assert.rejects(h.record({}, {kitchenId:'k',observation:{...observation,...patch}}),{statusCode:400});assert.equal(h.writes.length,0)
 }
 const h=harness();await h.record({}, {kitchenId:'k',observation:{...observation,quantity:1000000,item_name:'a'.repeat(300),unit:'a'.repeat(80),notes:'a'.repeat(5000)}});assert.equal(h.writes.length,1)
})
