import test from 'node:test'
import assert from 'node:assert/strict'
import * as Vue from 'vue'
import { load } from './kitchen/offering-test-helpers.mjs'
const model = load('../../runtime/kitchen/models/order.model.ts','OrderChannels')
const ordering = load('../../runtime/kitchen/utils/ordering.ts','readOrder',model)
const validation = load('../../runtime/kitchen/utils/order-submission.ts','orderSubmissionIssues')
const item={id:'pizza',name:'Pizza Margherita',price:13,priceOptions:[]}
for (const context of ['collection','delivery','table']) {
 test(`composed ${context} flow preserves submission, serving hours, response polling and receipt recovery`, async () => {
  const scope=Vue.effectScope(),mounted=[],disposed=[],storage=new Map(),calls=[]
  let poll, saved, open=true
  const manifest=Vue.ref({source:{kitchenId:'kitchen'},presentation:{currencyCode:'CHF'},behaviour:{availableOrderTypes:['collection','delivery','dine_in'],ordering:{}}})
  const request=async(path,body)=>{
   calls.push({path,body})
   if(path.endsWith('menu-submit')) {
    assert.deepEqual(validation.orderSubmissionIssues(body.order),[])
    saved={order:{...body.order,number:'1'},state:context==='table'?'accepted':'received',revision:1,message:'',estimate_minutes:null}
   }
   return structuredClone(saved)
  }
  const deps={...Vue,...validation,onMounted:fn=>mounted.push(fn),onUnmounted:fn=>disposed.push(fn),useRuntimeConfig:()=>({public:{ordering:{channels:['website']}}}),useMenu:(_id,options)=>{assert.equal(Vue.toValue(options.menuContext),context);return {manifest,pending:Vue.ref(false),failure:Vue.ref(null)}},useAuth:()=>({currentUser:Vue.ref({uid:'customer'})}),useFireUXConfig:()=>({appId:'app'}),useOrderExchange:()=>({request,pending:Vue.ref(false),error:Vue.ref(''),version:Vue.ref(0)}),publicMenuServiceOpen:()=>open,sessionStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},setInterval:fn=>{poll=fn;return 1},clearInterval:()=>{poll=null}}
  const {useMenuOrderFlow}=load('../../runtime/menu/composables/useMenuOrderFlow.ts','useMenuOrderFlow',deps)
  const flow=scope.run(()=>useMenuOrderFlow(Vue.reactive({menuId:'food',context,routeScope:{kind:'directory',kitchenSlug:'baren'}})))
  mounted.forEach(fn=>fn())
  await flow.submit()
  assert.equal(calls.length,0)
  flow.add('pizzas',item)
  flow.name.value='Alex'
  flow.phone.value='0000000000'
  flow.address.value='Hauptstrasse 128, Ringgenberg'
  flow.location.value='18'
  assert.deepEqual(flow.issues.value,[])
  open=false;manifest.value={...manifest.value}
  await flow.submit()
  assert.equal(calls.length,0)
  assert.match(flow.issues.value.join(' '),/closed/)
  open=true;manifest.value={...manifest.value}
  await flow.submit()
  assert.equal(calls.length,1)
  assert.equal(calls[0].body.expectedTotal,13)
  assert.equal(flow.submission.value.state,context==='table'?'accepted':'received')
  for(const state of ['accepted','preparing','ready','completed']) {
   saved={...saved,state,revision:saved.revision+1}
   poll();await Promise.resolve();await Promise.resolve()
   assert.equal(flow.submission.value.state,state)
   if(state==='ready')assert.match(flow.responseMessage.value,context==='delivery'?/driver/:context==='table'?/table 18/:/counter/)
  }
  // A remount recovers the exact saved receipt without submitting again.
  mounted.length=0
  const reopened=scope.run(()=>useMenuOrderFlow(Vue.reactive({menuId:'food',context,routeScope:{kind:'directory',kitchenSlug:'baren'}})))
  mounted.forEach(fn=>fn());await Promise.resolve();await Promise.resolve()
  assert.equal(reopened.submission.value.state,'completed')
  assert.equal(calls.filter(call=>call.path.endsWith('menu-submit')).length,1)
  disposed.forEach(fn=>fn());scope.stop()
 })
}
