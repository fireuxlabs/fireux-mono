import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, watch } from 'vue'
function load(path, dependencies, name) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '').replace(/^export type \{[\s\S]*?\} from[^\n]*\n/gm, '').replace(/^export type \* from[^\n]*\n/gm, '').replace(/^export /gm, '')
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


const readRecordString=(v,k)=>typeof v?.[k]==='string'?v[k]:''
const ensureKitchenMenuRootEntry=load('../../runtime/menu/server/directory/root-entry.ts',{FieldValue:{delete:()=>null},readRecordString,FIRESTORE_MUTATION_TARGETS:{menus:'menus',kitchens:'kitchens'},normalizeSlug:x=>String(x).toLowerCase(),publicKitchenMenuId:(k,m)=>`${k}--${m}`},'ensureKitchenMenuRootEntry')
const project=load('../../runtime/menu/server/index/projection.ts',{readRecordString,menuSourceFromData:x=>x.source||{}},'projectMenuDirectoryEntry')
function harness(tier='premium'){
 const at={seconds:1,nanoseconds:0},records=new Map([['kitchens/k',{slug:'venue'}],['places/k',{}],['apps/app/users/u',{role:'user',subscription:tier,created:{at}}],['kitchen_access/app/users/u',{ids:['k'],membership_created_at:at}],['kitchens/k/menus/m',{name:'Food',slug:'food',description:'Old',status:'published'}],['menus/stable',{name:'Food',status:'published',created:{at:'original'},source:{app_id:'original-app',kitchen_id:'k',menu_id:'m'}}],['menus/duplicate',{status:'published',source:{kitchen_id:'k',menu_id:'m'}}],['menus/foreign',{status:'published',source:{kitchen_id:'k',menu_id:'other'}}],['kitchens/k/menus/m/sections/s',{label:'Section'}]])
 let fail=false,before=()=>{},collision=false
 const deps={createError,requireFirestoreDocumentId,requireKitchenMutationAuthority,ensureKitchenMenuRootEntry,FIRESTORE_MUTATION_TARGETS:{menus:'menus'},serverKitchenMenusTarget:k=>`kitchens/${k}/menus`,menuNameAndSlug:(_,name)=>{if(typeof name!=='string'||!name.trim())throw createError({statusCode:400});return{name:name.trim(),slug:name.toLowerCase().replaceAll(' ','-')}},requireAvailableMenuSlug:async()=>{if(collision)throw createError({statusCode:409})},readKitchenMutationActor:async()=>({uid:'u',runtimeAppId:'app'}),serverAuditStamp:x=>({...x,at:'now'}),runGuardedServerTransaction:async(_,run)=>{
 before();let writing=false;const pending=[]
 const tx={read:async(t,id)=>{assert.equal(writing,false,'read after write');return {exists:records.has(`${t}/${id}`),data:records.get(`${t}/${id}`)}},query:async(t,q)=>{assert.equal(writing,false,'query after write');return [...records].filter(([p,v])=>p.startsWith(t+'/')&&v.source?.kitchen_id===q.value).map(([p,data])=>({id:p.slice(t.length+1),data}))},update:(t,id,p)=>{writing=true;pending.push(()=>records.set(`${t}/${id}`,{...records.get(`${t}/${id}`),...p}))},create:(t,id,p)=>{writing=true;pending.push(()=>records.set(`${t}/${id}`,p))},delete:(t,id)=>{writing=true;pending.push(()=>records.delete(`${t}/${id}`))}}
 const result=await run(tx);if(fail)throw Error('Commit failed');pending.forEach(fn=>fn());return result
 }}
 const commands=load('../../runtime/menu/server/workspace-commands.ts',deps,'({updateKitchenMenu,renameKitchenMenu,deleteKitchenMenu})')
 return {...commands,records,setFailure:()=>{fail=true},before:fn=>{before=fn},collision:()=>{collision=true}}
}
test('Metadata and public projection share one atomic transaction with stable source identity',async()=>{
 const h=harness();await h.updateKitchenMenu({},{kitchenId:'k',menuId:'m',changes:{name:'Dinner',description:'New',sort_order:3}})
 assert.equal(h.records.get('kitchens/k/menus/m').slug,'dinner');const root=h.records.get('menus/stable');assert.equal(root.name,'Dinner');assert.equal(root.description,'New');assert.equal(root.source.app_id,'original-app');assert.equal(root.created.at,'original');assert.equal(h.records.get('menus/duplicate').status,'archived');assert.equal(h.records.get('menus/foreign').status,'published');assert.equal(h.records.get('kitchens/k/menus/m').status,'published')
 const failed=harness();const snapshot=structuredClone([...failed.records]);failed.setFailure();await assert.rejects(failed.updateKitchenMenu({},{kitchenId:'k',menuId:'m',changes:{name:'Dinner'}}),/Commit failed/);assert.deepEqual([...failed.records],snapshot)
})
test('Free may edit operational metadata but only Plus may rename; strict field grammar',async()=>{
 const h=harness('free');await h.updateKitchenMenu({},{kitchenId:'k',menuId:'m',changes:{description:'',sort_order:-2}});assert.equal(h.records.get('kitchens/k/menus/m').sort_order,-2)
 await assert.rejects(h.renameKitchenMenu({},{kitchenId:'k',menuId:'m',name:'Dinner'}),{statusCode:403})
 for(const changes of [{status:'draft'},{slug:'x'},{schedule:'daily'},{source:{}},{created:{}},{sort_order:1.5},{description:4},{doc:{url:'x'}},{}])await assert.rejects(h.updateKitchenMenu({},{kitchenId:'k',menuId:'m',changes}),{statusCode:400})
 const conflict=harness();conflict.collision();const snapshot=structuredClone([...conflict.records]);await assert.rejects(conflict.renameKitchenMenu({},{kitchenId:'k',menuId:'m',name:'Dinner'}),{statusCode:409});assert.deepEqual([...conflict.records],snapshot)
})
test('Metadata/Delete recheck revoked or replaced membership before writing',async()=>{
 for(const operation of ['update','delete'])for(const change of [h=>h.records.delete('apps/app/users/u'),h=>h.records.get('apps/app/users/u').created.at={seconds:2,nanoseconds:0},h=>h.records.get('kitchen_access/app/users/u').ids=[]]){const h=harness();h.before(()=>change(h));await assert.rejects(operation==='update'?h.updateKitchenMenu({},{kitchenId:'k',menuId:'m',changes:{description:'New'}}):h.deleteKitchenMenu({},{kitchenId:'k',menuId:'m'}));assert.equal(h.records.get('menus/stable').status,'published');assert.equal(h.records.has('kitchens/k/menus/m'),true)}
})
test('Delete archives only matching public projections and removes scoped document without cascade, atomically',async()=>{
 const h=harness();await h.deleteKitchenMenu({},{kitchenId:'k',menuId:'m'});assert.equal(h.records.has('kitchens/k/menus/m'),false);assert.equal(h.records.has('kitchens/k/menus/m/sections/s'),true);assert.equal(h.records.get('menus/stable').status,'archived');assert.equal(h.records.get('menus/duplicate').status,'archived');assert.equal(h.records.get('menus/foreign').status,'published')
 assert.equal(project({id:'stable',data:h.records.get('menus/stable')}),null)
 assert.equal(project({id:'old',data:{status:'published',source:{app_id:'app',kitchen_id:'k',menu_id:'m'}}},null,{}),null)
 const failed=harness();const before=structuredClone([...failed.records]);failed.setFailure();await assert.rejects(failed.deleteKitchenMenu({},{kitchenId:'k',menuId:'m'}),/Commit failed/);assert.deepEqual([...failed.records],before)
})
