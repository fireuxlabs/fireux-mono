import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { load, normalizeKitchenOfferings, kioskService } from './offering-test-helpers.mjs'
const tablePolicy = load('../../runtime/kitchen/utils/table-service.ts', 'tableChannelEnabled')
const menuServices = load('../../runtime/menu/utils/menu-ordering.ts', 'kitchenMenuOrdering,publicMenuOrderTypes', {normalizeKitchenOfferings,...tablePolicy})
const publicOffering = {...kioskService, interactions: ['collection','delivery','dine_in'].map(type=>({type,enabled:true}))}
const model = load('../../runtime/kitchen/models/order.model.ts','OrderChannels')
const ordering = load('../../runtime/kitchen/utils/ordering.ts','readOrder,requireOrderChannel',model)
const submissionModel = load('../../runtime/kitchen/models/order-submission.model.ts','OrderSubmissionStates')
const utils = load('../../runtime/kitchen/utils/order-submission.ts','orderSubmissionIssues,initialOrderSubmissionState,canTransitionOrder,readOrderSubmission',{...ordering,...submissionModel})
const draft = (channel='website') => ({id:'order-a',number:'',channel,fulfilment:channel==='website'?'collection':'takeaway',lines:[{id:'pizza',item:{name:'Margherita pizza'},quantity:1,unit_code:'C62'}],customer:{name:'Sam',phone:'123'},...(channel==='pos'?{placed_by:{kind:'person',id:'caller',name:'Alex'}}:{})})
function harness() {
 const records = new Map()
 let allowed = true, uid = 'caller', tenant = false
 const deps = {...ordering,...utils,resolveMenuOrderLines:async(_tx,input)=>({lines:[{id:'line-1',item:{id:'item',name:'Canonical menu dish'},quantity:input.selections[0].quantity,unit_code:'C62'}],pricing:{currency:'CHF',total:input.expectedTotal,lines:[{line_id:'line-1',unit_price:input.expectedTotal/input.selections[0].quantity,total:input.expectedTotal}]}}),createHash,createError:v=>Object.assign(new Error(v.statusMessage),v),useRuntimeConfig:()=>({public:{ordering:{channels:['pos','kiosk','website']}}}),requireFirestoreDocumentId:v=>{if(typeof v!=='string'||!v||v.includes('/'))throw new Error('Invalid ID');return v},defineFirestoreMutationTarget:v=>v,requireFirebaseBearerUser:async()=>({uid}),useFireUXConfig:()=>({appId:'app',isTenant:tenant}),resolveTenantMenuScope:async()=>({kitchenId:'kitchen'}),readKitchenMutationActor:async()=>({uid,runtimeAppId:'app'}),requireKitchenRecordMutationAuthority:async()=>{if(!allowed)throw new Error('Denied')},FIRESTORE_MUTATION_TARGETS:{runtimeUsers:{collectionPath:'users'},kitchens:{collectionPath:'kitchens'}},serverAuditStamp:()=>({at:'now'}),runGuardedServerTransaction:async(_p,run)=> {
  const staged=[]
  const result=await run({read:async(t,id)=>{if(t.collectionPath==='users')return {exists:true,data:{display_name:'Alex'}};if(t.collectionPath==='kitchens')return {exists:true,data:{management:{mode:'app',app_id:'app'}}};const data=records.get(`${t.collectionPath}/${id}`);return {exists:!!data,data}},create:(t,id,data)=>staged.push([`${t.collectionPath}/${id}`,data]),update:(t,id,data)=>staged.push([`${t.collectionPath}/${id}`,{...records.get(`${t.collectionPath}/${id}`),...data}]),readAll:async(t,limit,after)=>[...records].filter(([key])=>key.startsWith(t.collectionPath+'/')).map(([key,data])=>({id:key.split('/').at(-1),data})).sort((a,b)=>a.id.localeCompare(b.id)).filter(row=>!after||row.id>after).slice(0,limit),query:async(t,q)=>[...records].filter(([key,v])=>key.startsWith(t.collectionPath+'/')&&q.value.includes(v.state)).map(([key,data])=>({id:key.split('/').at(-1),data}))})
  for(const [key,data]of staged)records.set(key,data)
  return result
 }}
 const server=load('../../runtime/kitchen/server/orders/submission.ts','submitKitchenOrder,respondToKitchenOrder,readKitchenOrderResponse,listKitchenSubmittedOrders',deps)
 return {...server,records,setAllowed:v=>allowed=v,setUid:v=>uid=v,setTenant:v=>tenant=v}
}
test('submission completeness and auto acceptance vary by origin',()=>{
 assert.deepEqual(utils.orderSubmissionIssues(draft()),[])
 assert.equal(utils.initialOrderSubmissionState(draft()),'received')
 for(const channel of ['pos','kiosk'])assert.equal(utils.initialOrderSubmissionState(draft(channel)),'accepted')
 assert.ok(utils.orderSubmissionIssues({...draft(),customer:{name:'Sam'}}).length)
 assert.ok(utils.orderSubmissionIssues({...draft(),fulfilment:'delivery'}).includes('Delivery address is required.'))
 assert.ok(utils.orderSubmissionIssues({...draft('pos'),placed_by:undefined}).length)
 assert.ok(utils.orderSubmissionIssues({...draft(),lines:[]}).length)
})
test('numbering and retry preserve exactly one submitted order',async()=>{
 const s=harness(),input={kitchenId:'kitchen',order:draft()}
 const first=await s.submitKitchenOrder({},input)
 const repeat=await s.submitKitchenOrder({},input)
 assert.deepEqual(first,repeat)
 assert.equal(first.submission.order.number,'1')
 assert.equal(s.records.size,2)
 await assert.rejects(s.submitKitchenOrder({},{...input,order:{...draft(),customer:{name:'Other',phone:'123'}}}),/already been used/)
})
test('operator response reaches owner and guards revisions and transitions',async()=>{
 const s=harness()
 await s.submitKitchenOrder({},{kitchenId:'kitchen',order:draft()})
 const respond=(state,expectedRevision,message='')=>s.respondToKitchenOrder({},{kitchenId:'kitchen',orderId:'order-a',state,expectedRevision,message,estimate_minutes:20})
 s.setAllowed(false);await assert.rejects(respond('accepted',1),/Denied/);s.setAllowed(true)
 await assert.rejects(respond('ready',1),/transition/)
 await respond('accepted',1,'Accepted by Alex')
 const customer=await s.readKitchenOrderResponse({},{kitchenId:'kitchen',orderId:'order-a'})
 assert.equal(customer.submission.state,'accepted');assert.equal(customer.submission.estimate_minutes,20)
 await assert.rejects(respond('preparing',1),/changed/)
 await respond('preparing',2);await respond('ready',3);await respond('completed',4)
 assert.equal((await s.listKitchenSubmittedOrders({},'kitchen')).submissions[0].state,'completed')
 s.setUid('other');await assert.rejects(s.readKitchenOrderResponse({},{kitchenId:'kitchen',orderId:'order-a'}),/not found/)
})
test('decline requires reason and remains terminal',async()=>{
 const s=harness();await s.submitKitchenOrder({},{kitchenId:'kitchen',order:draft()})
 const input={kitchenId:'kitchen',orderId:'order-a',state:'declined',expectedRevision:1,message:'',estimate_minutes:null}
 await assert.rejects(s.respondToKitchenOrder({},input),/reason/)
 await s.respondToKitchenOrder({},{...input,message:'Kitchen is at capacity.'})
 const customer=await s.readKitchenOrderResponse({},{kitchenId:'kitchen',orderId:'order-a'})
 assert.equal(customer.submission.message,'Kitchen is at capacity.')
 await assert.rejects(s.respondToKitchenOrder({},{...input,state:'accepted',expectedRevision:2}),/transition/)
})
test('staff impersonation and undeclared origins cannot create orders',async()=>{
 const s=harness()
 await assert.rejects(s.submitKitchenOrder({},{kitchenId:'kitchen',order:{...draft('pos'),placed_by:{kind:'person',id:'other',name:'Alex'}}}),/staff identity/)
 await assert.rejects(s.submitKitchenOrder({},{kitchenId:'kitchen',order:draft('api')}))
 assert.equal(s.records.size,0)
})
test('generic submission requires Kitchen authority and server-assigned numbering',async()=>{
 const s=harness();s.setAllowed(false)
 await assert.rejects(s.submitKitchenOrder({},{kitchenId:'kitchen',order:draft()}),/Denied/);s.setAllowed(true)
 await assert.rejects(s.submitKitchenOrder({},{kitchenId:'kitchen',order:{...draft(),number:'99'}}),/no number/)
 const result=await s.submitKitchenOrder({},{kitchenId:'kitchen',order:draft()})
 assert.equal(result.submission.state,'received')
})

test('submission has no test mode or test metadata',async()=>{
 const s=harness()
 await assert.rejects(s.submitKitchenOrder({},{kitchenId:'kitchen',order:draft(),test:true}),/input is invalid/)
 const result=await s.submitKitchenOrder({},{kitchenId:'kitchen',order:draft()})
 assert.equal('test' in result.submission,false)
 assert.equal([...s.records.values()].some(record=>'test' in record),false)
})
const menuOrdering=load('../../runtime/menu/server/ordering.ts','readMenuOrderSelections,resolveMenuOrderLines',{
 ...menuServices,readKitchenOfferingsInTransaction:async tx => tx.offerings ?? [publicOffering],
 createError:v=>Object.assign(new Error(v.statusMessage),v),requireFirestoreDocumentId:v=>{if(typeof v!=='string'||!v||v.includes('/'))throw new Error('Invalid ID');return v},
 serverKitchenMenusTarget:()=>({path:'menus'}),serverKitchenMenuSectionsTarget:()=>({path:'sections'}),serverKitchenMenuItemsTarget:()=>({path:'items'}),serverKitchenDishesTarget:()=>({path:'dishes'}),serverKitchenSellablesTarget:()=>({path:'sellables'}),FIRESTORE_MUTATION_TARGETS:{places:{path:'places'}},readPlaceCurrencyCode:v=>v.currency,
 projectSellable:()=>({price:12,priceOptions:[],sellable_currency:'CHF',sellable_fulfilment:{default:['collection']},sellable_variants:[{id:'default'}]}),sellableFulfilment:v=>v,
})
const menuCart=[{sectionId:'pizzas',itemId:'margherita',quantity:2}]
function menuTx(overrides={}) {
 const records={menus:{status:'published'},places:{currency:'CHF'},sections:{status:'active'},items:{dish_id:'dish',price:14},dishes:{name:'Real menu pizza'},...overrides}
 return {read:async target=>({exists:!!records[target.path],data:records[target.path]})}
}
test('real menu submission resolves canonical dish and price inside its transaction',async()=>{
 const result=await menuOrdering.resolveMenuOrderLines(menuTx(),{kitchenId:'kitchen',menuId:'food',selections:menuCart,fulfilment:'collection',expectedTotal:28})
 assert.equal(result.lines[0].item.name,'Real menu pizza');assert.equal(result.lines[0].quantity,2)
 assert.deepEqual(result.pricing,{currency:'CHF',total:28,lines:[{line_id:'line-1',unit_price:14,total:28}]})
})
test('changed prices, archived items and unpublished menus cannot submit',async()=>{
 const input={kitchenId:'kitchen',menuId:'food',selections:menuCart,fulfilment:'delivery',expectedTotal:28}
 await assert.rejects(menuOrdering.resolveMenuOrderLines(menuTx({items:{dish_id:'dish',price:15}}),input),/prices changed/)
 await assert.rejects(menuOrdering.resolveMenuOrderLines(menuTx({items:{status:'archived'}}),input),/no longer available/)
 await assert.rejects(menuOrdering.resolveMenuOrderLines(menuTx({menus:{status:'draft'}}),input),/no longer available/)
 await assert.rejects(menuOrdering.resolveMenuOrderLines(menuTx({items:{dish_id:'dish',sellable_id:'sellable'},sellables:{}}),input),/unavailable for this service/)
})
test('menu size choices are explicit and quantities are bounded',async()=>{
 const input={kitchenId:'kitchen',menuId:'food',selections:menuCart,fulfilment:'collection',expectedTotal:32}
 const tx=menuTx({items:{dish_id:'dish',price_options:[{label:'Large',price:16}]}})
 await assert.rejects(menuOrdering.resolveMenuOrderLines(tx,input),/Choose an available size/)
 const result=await menuOrdering.resolveMenuOrderLines(tx,{...input,selections:[{...menuCart[0],optionId:'large'}]})
 assert.equal(result.lines[0].item.name,'Real menu pizza — Large')
 assert.throws(()=>menuOrdering.readMenuOrderSelections([{...menuCart[0],quantity:0}]))
 assert.throws(()=>menuOrdering.readMenuOrderSelections([...menuCart,...menuCart]))
})

test('public Menu submission stores canonical lines and pricing without operator authority',async()=>{
 const s=harness();s.setAllowed(false)
 const result=await s.submitKitchenOrder({},{kitchenId:'kitchen',order:draft()},{target:{sourceMenuId:'food',kitchenSlug:'restaurant'},selections:[{sectionId:'section',itemId:'item',quantity:2}],expectedTotal:26})
 assert.equal(result.submission.order.lines[0].item.name,'Canonical menu dish')
 assert.equal(result.submission.order.lines[0].quantity,2)
 assert.equal(result.submission.pricing.total,26)
 assert.equal((await s.readKitchenOrderResponse({},{kitchenId:'kitchen',orderId:'order-a'})).submission.pricing.total,26)
})

test('public menu services require enabled menu-linked offerings, schedules and unpaused interactions', async () => {
 const input={kitchenId:'kitchen',menuId:'food',selections:menuCart,fulfilment:'collection',expectedTotal:28}
 for (const offerings of [[], [{...publicOffering,enabled:false}], [{...publicOffering,menu_ids:['private']}], [{...publicOffering,hours:undefined}], [{...publicOffering,interactions:[{type:'collection',enabled:false}]}], [{...publicOffering,interactions:[{type:'collection',enabled:true,availability:{paused:true}}]}]]) {
  await assert.rejects(menuOrdering.resolveMenuOrderLines({...menuTx(),offerings},input),/does not currently offer/)
 }
 await menuOrdering.resolveMenuOrderLines({...menuTx(),offerings:[publicOffering]},input)
 await assert.rejects(menuOrdering.resolveMenuOrderLines({...menuTx(),offerings:[{...publicOffering,interactions:[{type:'dine_in',enabled:true,table_channels:{staff_pos:true,table_qr:false}}]}]},{...input,fulfilment:'on_site'}),/does not currently offer/)
 assert.deepEqual(menuServices.publicMenuOrderTypes(menuServices.kitchenMenuOrdering([publicOffering],'food')).map(row=>row.type),['collection','delivery','dine_in'])
})

test('the board reads every submitted order across internal batches without a 100-order cap',async()=>{
 const s=harness()
 const first=await s.submitKitchenOrder({},{kitchenId:'kitchen',order:draft()})
 for(let index=0;index<1005;index++) {
  const id=`history-${String(index).padStart(5,'0')}`
  s.records.set(`kitchens/kitchen/submitted-orders/${id}`,{...first.submission,order:{...first.submission.order,id,number:String(index+2)},state:'completed',kitchen_id:'kitchen'})
 }
 const result=await s.listKitchenSubmittedOrders({},'kitchen')
 assert.equal(result.submissions.length,1006)
 assert.equal(new Set(result.submissions.map(row=>row.order.id)).size,1006)
 s.setAllowed(false)
 await assert.rejects(s.listKitchenSubmittedOrders({},'kitchen'),/Denied/)
})
