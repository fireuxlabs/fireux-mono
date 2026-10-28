import { createHash } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import { runGuardedServerTransaction, type GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readProductCreateInput } from './input'
import { productProvisionProvider } from './provider'

type Provisioning = { request_id:string; fingerprint:string; actor_uid:string; app_id:string; product_id:string; price_ids:string[]; attempted_at:Record<string,number>; complete:boolean }
const products=defineFirestoreMutationTarget({key:'products',lane:'server',verbs:['create','update'],database:{kind:'runtime'},collectionPath:'products'})
// Stripe may prune keys after >=24h: https://docs.stripe.com/api/idempotent_requests
const RETRY_WINDOW_MS=24*60*60*1000
export async function createInteractiveProduct(event:H3Event,input:unknown) {
  const appId=requireFirestoreDocumentId(useFireUXConfig(event).appId,'App id'), {uid}=await requireFirebaseBearerUser(event)
  const {requestId,payload,prices}=readProductCreateInput(input,appId)
  const fingerprint=createHash('sha256').update(JSON.stringify({uid,appId,requestId,payload,prices})).digest('hex')
  const id=payload.slug
  const authority=async(tx:GuardedServerTransaction)=>{const member=await tx.read(serverAppUsersTarget(appId),uid);if(!member.exists||!(['admin','dev'].includes(String(member.data?.role))||member.data?.canManageProducts===true))throw createError({statusCode:403,statusMessage:'Product management access is required.'})}
  const owned=async(tx:GuardedServerTransaction)=>{await authority(tx);const record=await tx.read(products,id);const state=record.data?.provisioning as Provisioning|undefined;if(!record.exists||!state||state.fingerprint!==fingerprint||state.actor_uid!==uid||state.app_id!==appId||state.request_id!==requestId)throw createError({statusCode:409,statusMessage:'This Product slug belongs to another request. Resume the original request or choose another slug.'});return state}
  const initial=await runGuardedServerTransaction({kind:'runtime'},async tx=>{
    await authority(tx);const record=await tx.read(products,id)
    if(record.exists){const state=record.data?.provisioning as Provisioning|undefined;if(!state||state.fingerprint!==fingerprint)throw createError({statusCode:409,statusMessage:'This Product slug belongs to another request.'});return state}
    const state:Provisioning={request_id:requestId,fingerprint,actor_uid:uid,app_id:appId,product_id:'',price_ids:[],attempted_at:{},complete:false},stamp=serverAuditStamp({by:uid,appId})
    tx.create(products,id,{...payload,active:false,visibility:'app',provisioning:state,created:stamp,updated:stamp});return state
  })
  if(initial.complete)return{success:true as const,id}
  const provider=productProvisionProvider()
  const step=async(key:string,run:(existingId?:string)=>Promise<string>)=>{
    const existingId=await runGuardedServerTransaction({kind:'runtime'},async tx=>{
      const state=await owned(tx),saved=key==='product'?state.product_id:state.price_ids[Number(key)]
      if(saved)return saved
      const attempted=state.attempted_at[key]
      if(attempted!==undefined && Date.now()-attempted>=RETRY_WINDOW_MS)throw createError({statusCode:409,statusMessage:'Provider outcome is uncertain and its retry window has expired. Reconcile this reserved Product before continuing.'})
      if(attempted===undefined)tx.update(products,id,{provisioning:{...state,attempted_at:{...state.attempted_at,[key]:Date.now()}}})
      return undefined
    })
    const providerId=await run(existingId)
    await runGuardedServerTransaction({kind:'runtime'},async tx=>{
      const state=await owned(tx),priceIds=[...state.price_ids]
      if(key!=='product')priceIds[Number(key)]=providerId
      tx.update(products,id,{provisioning:{...state,product_id:key==='product'?providerId:state.product_id,price_ids:priceIds}})
    })
    return providerId
  }
  const productId=await step('product',existing=>provider.product(payload,fingerprint,`fireux-product:${fingerprint}`,existing))
  const priceIds:string[]=[]
  for(let index=0;index<prices.length;index++)priceIds.push(await step(String(index),existing=>provider.price(productId,prices[index]!,fingerprint,`fireux-price:${fingerprint}:${index}`,existing)))
  await runGuardedServerTransaction({kind:'runtime'},async tx=>{
    const state=await owned(tx);if(state.complete)return
    const priceTarget=defineFirestoreMutationTarget({key:'product.prices',lane:'server',verbs:['create'],database:{kind:'runtime'},collectionPath:`products/${id}/prices`})
    const stamp=serverAuditStamp({by:uid,appId}),monthly=prices.findIndex(price=>price.type==='recurring'&&price.interval==='month'),defaultIndex=monthly>=0?monthly:0
    prices.forEach((price,index)=>tx.create(priceTarget,priceIds[index]!,{...price,product_id:id,label:String(price.metadata?.label??''),active:true,default:index===defaultIndex,provider:'stripe',provider_price_id:priceIds[index],created:stamp,updated:stamp}))
    tx.update(products,id,{...payload,provisioning:{...state,complete:true},updated:stamp})
  })
  return{success:true as const,id}
}
