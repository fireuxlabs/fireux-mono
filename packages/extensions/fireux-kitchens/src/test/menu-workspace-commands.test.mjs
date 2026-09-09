import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

function load(relative, deps, names) {
  const source = readFileSync(new URL(relative, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type \*[^\n]*\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(source)}; return {${names.join(',')}}`, Object.keys(deps))(...Object.values(deps))
}
const error = input => Object.assign(new Error(input.statusMessage), input)
const segment = (value) => { if (typeof value !== 'string' || !value || value.includes('/')) throw error({statusCode:400,statusMessage:'Invalid id'}); return value }
const slug = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const targets = {
  serverAppUsersTarget: () => 'app-users',
  serverKitchenMenusTarget: id => `${id}/menus`,
  serverKitchenMenuSectionsTarget: (id,menu) => `${id}/menus/${menu}/sections`,
  serverKitchenMenuItemsTarget: (id,menu,section) => `${id}/menus/${menu}/sections/${section}/items`,
  FIRESTORE_MUTATION_TARGETS: { kitchens:'kitchens', places:'places' },
}
const {requireKitchenMutationAuthority} = load('../runtime/kitchen/server/core/mutation-authority.ts', {
  ...targets, createError:error, isAppUserSubscription: x=>['free','premium','business'].includes(x),
}, ['requireKitchenMutationAuthority'])
const normalizers = load('../runtime/menu/utils/menu-item.ts', {}, ['normalizeMenuItemPriceOptions','normalizeMenuItemAddOns'])
const {normalizeMenuItemPatch} = load('../runtime/menu/utils/menu-item-patch.ts', {...normalizers, normalizeSlug:slug}, ['normalizeMenuItemPatch'])
const capacity = load('../../../../core/fireux-core/src/runtime/app/utils/app-subscription-capacity.ts', {}, ['appSubscriptionCapacity','hasAppSubscriptionCapacity'])
const {kitchenMenuCapacity} = load('../runtime/menu/utils/menu-capacity.ts', {}, ['kitchenMenuCapacity'])
function harness({subscription='free', count=0, associated=true, role='user', menuStatus='published', missingItem=false}={}) {
  const calls=[]
  const actor={uid:'cook',runtimeAppId:'misebox-app'}
  const tx={
    async read(target,id) {
      if(target==='app-users') return {exists:!!role,data:{role,subscription,kitchens:associated?['pizza']:[]}}
      if(target==='kitchens'||target==='places') return {exists:true,data:{currency_code:'CHF'}}
      if(target==='pizza/menus') return {exists:id==='food',data:{status:menuStatus}}
      return {exists:!missingItem,data:{dish_id:'margherita'}}
    },
    async readAll(_target,limit){return Array.from({length:Math.min(count,limit)},(_,i)=>({id:String(i),data:{}}))},
    update:(...args)=>calls.push(['update',...args]),
    create:(...args)=>calls.push(['create',...args]),
  }
  const commands=load('../runtime/menu/server/workspace-commands.ts', {
    ...targets, ...capacity, kitchenMenuCapacity,
    normalizeSlug:slug, createError:error, requireFirestoreDocumentId:segment,
    readKitchenMutationActor:async()=>actor, requireKitchenMutationAuthority,
    runGuardedServerTransaction:async(_,work)=>work(tx),
    serverAuditStamp:()=>({by:'cook'}), normalizeMenuItemPatch,
    getRuntimeFirestore:()=>({}), syncKitchenMenuDirectory:async()=>calls.push(['sync']),
    readPlaceCurrencyCode:place=>place.currency_code,
    buildMenuPayload:(input,name)=>({name,kitchen_id:input.kitchenId,status:'draft'}),
  }, ['createKitchenMenu','updateKitchenMenuItem','unpublishKitchenMenu','requireMenuCreationCapacity'])
  return {...commands,calls}
}
const item={kitchenId:'pizza',menuId:'food',sectionId:'pizza',itemId:'margherita'}

test('Free creation allows the second menu and blocks a third without deleting retained menus', async()=>{
  const allowed=harness({count:1}); await allowed.createKitchenMenu({}, {kitchenId:'pizza',name:'Lunch'}); assert.equal(allowed.calls[0][0],'create')
  for(const count of [2,20]) {const denied=harness({count}); await assert.rejects(denied.createKitchenMenu({}, {kitchenId:'pizza',name:'Lunch'}), /allowance/); assert.deepEqual(denied.calls,[])}
})
test('Premium and Business allow more than twenty menus',async()=>{
  for(const subscription of ['premium','business']) {const h=harness({subscription,count:100});await h.createKitchenMenu({}, {kitchenId:'pizza',name:'Lunch'});assert.equal(h.calls[0][0],'create')}
})
test('Downgraded Free account can correct prices, change availability and unpublish',async()=>{
  const h=harness({count:20});
  await h.updateKitchenMenuItem({}, {...item,changes:{price:12.5}})
  await h.updateKitchenMenuItem({}, {...item,changes:{status:'archived'}})
  await h.updateKitchenMenuItem({}, {...item,changes:{status:'active'}})
  await h.unpublishKitchenMenu({}, {kitchenId:'pizza',menuId:'food'})
  assert.deepEqual(h.calls.filter(x=>x[0]==='update').map(x=>Object.keys(x[3]).filter(k=>k!=='updated')), [['price'],['status'],['status'],['status']])
  assert.equal(h.calls[3][3].status,'draft'); assert.equal(h.calls.at(-1)[0],'sync')
})
test('Membership and Kitchen association, not paid subscription, authorize essential commands',async()=>{
  for(const options of [{associated:false,subscription:'business'},{role:''}]) {
    const h=harness(options)
    await assert.rejects(h.updateKitchenMenuItem({}, {...item,changes:{price:12}}),/association|membership/)
    await assert.rejects(h.unpublishKitchenMenu({}, {kitchenId:'pizza',menuId:'food'}),/association|membership/)
    assert.deepEqual(h.calls,[])
  }
})
test('Invalid prices, unknown fields, identity changes and invalid options are rejected before writes',async()=>{
  for(const changes of [{price:-1},{price:NaN},{price:'12'},{dish_id:'other'},{image:'url'},{status:'sold-out'},{user_id:'other'},null,{price_options:'bad'},{add_ons:null},{price_options:[{label:'Large',price:0}]}]) {
    const h=harness();await assert.rejects(h.updateKitchenMenuItem({}, {...item,changes})); assert.deepEqual(h.calls,[])
  }
})
test('Unknown items, invalid paths and archived-menu unpublish fail safely',async()=>{
  const h=harness({missingItem:true}); await assert.rejects(h.updateKitchenMenuItem({}, {...item,changes:{price:12}}),/not found/); assert.deepEqual(h.calls,[])
  await assert.rejects(h.updateKitchenMenuItem({}, {...item,kitchenId:'pizza/other',changes:{price:12}}),/Invalid id/)
  const archived=harness({menuStatus:'archived'});await assert.rejects(archived.unpublishKitchenMenu({}, {kitchenId:'pizza',menuId:'food'}),/archived/);assert.deepEqual(archived.calls,[])
})
test('Create cannot overwrite Food or publish without validation',async()=>{
  const h=harness({subscription:'premium'});await assert.rejects(h.createKitchenMenu({}, {kitchenId:'pizza',name:'Food'}),/already exists/)
  await assert.rejects(h.createKitchenMenu({}, {kitchenId:'pizza',name:'Lunch',status:'published'}),/drafts/);
  await assert.rejects(h.createKitchenMenu({}, {kitchenId:'pizza',name:{bad:true}}),/name/);
  await assert.rejects(h.createKitchenMenu({}, {kitchenId:'pizza',name:'Lunch',description:{bad:true}}),/description/); assert.deepEqual(h.calls,[])
})
