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
  serverKitchenAccessTarget: () => 'kitchen-access',
  serverKitchenMenusTarget: id => `${id}/menus`,
  serverKitchenMenuSectionsTarget: (id,menu) => `${id}/menus/${menu}/sections`,
  serverKitchenMenuItemsTarget: (id,menu,section) => `${id}/menus/${menu}/sections/${section}/items`,
  FIRESTORE_MUTATION_TARGETS: { kitchens:'kitchens', places:'places' },
}
const {requireKitchenMutationAuthority} = load('../runtime/kitchen/server/core/mutation-authority.ts', {
  ...targets, readKitchenAccessIds: data => data?.ids || [], createError:error, isAppUserSubscription: x=>['free','premium','business'].includes(x),
}, ['requireKitchenMutationAuthority'])
const normalizers = load('../runtime/menu/utils/menu-item.ts', {}, ['normalizeMenuItemPriceOptions','normalizeMenuItemAddOns'])
const {normalizeMenuItemPatch} = load('../runtime/menu/utils/menu-item-patch.ts', {...normalizers, normalizeSlug:slug}, ['normalizeMenuItemPatch'])
const capacity = load('../../../../core/fireux-core/src/runtime/app/utils/app-subscription-capacity.ts', {}, ['appSubscriptionCapacity','hasAppSubscriptionCapacity'])
const {kitchenMenuCapacity} = load('../runtime/menu/utils/menu-capacity.ts', {}, ['kitchenMenuCapacity'])
function harness({subscription='free', count=0, associated=true, role='user', menuStatus='published', missingItem=false, menuName='Food', menuSlug='food', occupiedSlug=''}={}) {
  const calls=[]
  const menu = { name: menuName, slug: menuSlug, status: menuStatus }
  const actor={uid:'cook',runtimeAppId:'misebox-app'}
  const tx={
    async read(target,id) {
      if(target==='app-users') return {exists:!!role,data:{role,subscription}}
      if(target==='kitchen-access') return {exists:true,data:{ids:associated?['pizza']:[]}}
      if(target==='kitchens'||target==='places') return {exists:true,data:{currency:'CHF'}}
      if(target==='pizza/menus') return {exists:id==='food',data:menu}
      return {exists:!missingItem,data:{dish_id:'margherita'}}
    },
    async readAll(_target,limit){return Array.from({length:Math.min(count,limit)},(_,i)=>({id:String(i),data:{}}))},
    async query(target, query) { if(query.value === occupiedSlug) return [{id:'other',data:{slug:occupiedSlug}}]; return target === 'pizza/menus' && query.value === menu.slug ? [{ id: 'food', data: menu }] : [] },
    update:(...args)=>{ calls.push(['update',...args]); if(args[0]==='pizza/menus') Object.assign(menu,args[2]) },
    create:(...args)=>calls.push(['create',...args]),
  }
  const nameHelpers = load('../runtime/menu/server/name.ts', {
    ...targets, createError:error, normalizeSlug:slug, useFireUXConfig:()=>({isTenant:false}), useRuntimeConfig:()=>({}),
    validatePublicSlug:value=>({isValid:!!value,slug:value}),
  }, ['menuNameAndSlug','requireAvailableMenuSlug'])
  const payload = load('../runtime/menu/utils/menu-create-input.ts', {compactMenuServiceHoursDelta:value=>value}, ['buildMenuPayload'])
  const commands=load('../runtime/menu/server/workspace-commands.ts', {
    ...targets, ...capacity, ...nameHelpers, ...payload, kitchenMenuCapacity, randomUUID:()=> 'generated-stable-id',
    normalizeSlug:slug, createError:error, requireFirestoreDocumentId:segment,
    readKitchenMutationActor:async()=>actor, requireKitchenMutationAuthority,
    runGuardedServerTransaction:async(_,work)=>work(tx),
    serverAuditStamp:()=>({by:'cook'}), normalizeMenuItemPatch,
    getRuntimeFirestore:()=>({}), syncKitchenMenuDirectory:async()=>calls.push(['sync']),
    readKitchenCurrency:kitchen=>kitchen.currency,
  }, ['createKitchenMenu','updateKitchenMenuItem','unpublishKitchenMenu','requireMenuCreationCapacity','renameKitchenMenu'])
  return {...commands,calls,menu}
}
const item={kitchenId:'pizza',menuId:'food',sectionId:'pizza',itemId:'margherita'}

test('Free creation allows the second menu and blocks a third without deleting retained menus', async()=>{
  const allowed=harness({count:1}); await allowed.createKitchenMenu({}, {kitchenId:'pizza',name:'drinks'}); assert.equal(allowed.calls[0][0],'create')
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


test('Menu creation stores a generated stable identity with its separate slug and canonical Free name', async () => {
  const h = harness({ count: 1 })
  const result = await h.createKitchenMenu({}, { kitchenId: 'pizza', name: 'DRINKS' })
  assert.deepEqual(result, { created: true, id: 'generated-stable-id', slug: 'drinks' })
  const write = h.calls[0]
  assert.equal(write[2], result.id)
  assert.equal(write[3].slug, 'drinks')
  assert.equal(write[3].name, 'Drinks')
  assert.equal(Object.hasOwn(write[3], 'id'), false)
  assert.equal(Object.hasOwn(write[3], 'kitchen_id'), false)
  assert.equal(write[3].ordering.enabled, false)
  const custom = harness({ count: 0 })
  await assert.rejects(custom.createKitchenMenu({}, { kitchenId: 'pizza', name: 'Lunch' }), /Plus/)
  assert.deepEqual(custom.calls, [])
})
test('trusted rename writes name and slug together without changing record identity', async () => {
  for (const subscription of ['premium', 'business']) {
    const h = harness({ subscription })
    const result = await h.renameKitchenMenu({}, { kitchenId: 'pizza', menuId: 'food', name: 'Dinner Menu' })
    assert.deepEqual(result, { id: 'food', slug: 'dinner-menu' })
    assert.deepEqual(h.calls[0], ['update', 'pizza/menus', 'food', { name: 'Dinner Menu', slug: 'dinner-menu', updated: { by: 'cook' } }])
    assert.equal(h.calls.filter(call => call[0] === 'create').length, 0)
  }
})
test('Free downgrade preserves custom names; duplicate slug rename writes nothing', async () => {
  const free = harness({ menuName: 'Dinner Menu', menuSlug: 'dinner-menu' })
  await assert.rejects(free.renameKitchenMenu({}, { kitchenId: 'pizza', menuId: 'food', name: 'Food' }), /Plus/)
  assert.equal(free.menu.name, 'Dinner Menu')
  assert.equal(free.menu.slug, 'dinner-menu')
  assert.deepEqual(free.calls, [])
  const collision = harness({ subscription: 'premium', occupiedSlug: 'dinner' })
  await assert.rejects(collision.renameKitchenMenu({}, { kitchenId: 'pizza', menuId: 'food', name: 'Dinner' }), /already exists/)
  assert.deepEqual(collision.calls, [])
})

test('Kitchen onboarding creates two generated Menu identities with stable Food and Drinks slugs', () => {
  const { buildKitchenSystemMenu, KitchenSystemMenuKinds } = load('../runtime/menu/utils/kitchen-system-menus.ts', {}, ['buildKitchenSystemMenu','KitchenSystemMenuKinds'])
  let sequence = 0
  const { createKitchenSystemMenus } = load('../runtime/kitchen/server/index/onboarding/system-menus.ts', {
    randomUUID: () => `stable-${++sequence}`, buildKitchenSystemMenu, KitchenSystemMenuKinds,
  }, ['createKitchenSystemMenus'])
  const writes = []
  const input = { mutations: { create: (...args) => writes.push(args) }, target: 'k/menus', kitchenId: 'k', menus: [], created: { by: 'u' } }
  createKitchenSystemMenus(input)
  assert.deepEqual(writes.map(([target, id, menu]) => [target, id, menu.slug, menu.name]), [
    ['k/menus', 'stable-1', 'food', 'Food'], ['k/menus', 'stable-2', 'drinks', 'Drinks'],
  ])
  assert.ok(writes.every(([, , menu]) => !Object.hasOwn(menu, 'id') && !Object.hasOwn(menu, 'kitchen_id')))
  assert.throws(() => createKitchenSystemMenus({ ...input, menus: [{ id: 'orphan' }] }), /without its Kitchen/)
  assert.equal(writes.length, 2)
})
