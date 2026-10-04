import { ref, watch, onScopeDispose } from 'vue'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useRoute } from '#imports'
import { useStorage, StorageSerializers } from '@vueuse/core'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import type { ProductCreateInput as CanonicalProductCreateInput, StripePriceInput } from '../../../utils/product'

export type ProductCreateInput = { payload: Partial<CanonicalProductCreateInput>; priceInputs: StripePriceInput[] }
export type ProductCreateResult = { success: boolean; id?: string; error?: string }
export const ProductCreatePlan = defineFireuxCreatePlan({ family: 'with_provision' })
export function useProductCreate() {
  const config=useFireUXConfig(),{currentUser}=useAuth(),route=useRoute(),scopeEpoch=ref(0)
  const {appUser,appPending,appError,appOutcome}=useUserSession()
  const attempts=useStorage<Record<string,{key:string;requestId:string}>>('productCreateRequests',{},undefined,{serializer:StorageSerializers.object})
  const invalidate=()=>{scopeEpoch.value+=1}
  watch([()=>currentUser.value?.uid,()=>config.appId,()=>route.fullPath,appUser,appPending,appError,appOutcome],invalidate,{flush:'sync'})
  let disposed=false
  onScopeDispose(()=>{disposed=true;invalidate()})
  const captureIntent=()=>{const expected=scopeEpoch.value;return()=>!disposed&&scopeEpoch.value===expected}
  async function createProductFromInput(input:ProductCreateInput):Promise<ProductCreateResult> {
    const uid=currentUser.value?.uid,appId=config.appId,isCurrent=captureIntent()
    const payload={...input.payload,source_app_id:appId} as Record<string,unknown>
    // Draft identity/audit fields are not editable command input.
    delete payload.id;delete payload.created;delete payload.updated
    const snapshot=JSON.parse(JSON.stringify({payload,priceInputs:input.priceInputs}))
    const key=JSON.stringify({uid,appId,...snapshot})
    const attemptKey=JSON.stringify([uid,appId,snapshot.payload.slug])
    if(!attempts.value[attemptKey])attempts.value={...attempts.value,[attemptKey]:{key,requestId:crypto.randomUUID()}}
    const requestId=attempts.value[attemptKey]!.requestId
    if(attempts.value[attemptKey]!.key!==key)return{success:false,error:'This slug has an unfinished creation request. Restore its unchanged draft to retry; changing it requires reconciliation.'}
    const assertCurrent=()=>{if(!uid||currentUser.value?.uid!==uid||!isCurrent())throw new Error('The account, App or page changed. Reopen Product creation.')}
    try {
      const user=await useRequireUser();assertCurrent()
      if(user.uid!==uid)throw new Error('The account changed. Reopen Product creation.')
      const token=await user.getIdToken();assertCurrent()
      const result=await $fetch<{success:true;id:string}>('/api/products/create',{method:'POST',headers:{Authorization:`Bearer ${token}`},body:{...snapshot,requestId}})
      if(result?.success!==true||result.id!==snapshot.payload.slug)throw new Error('Product response did not match the requested Product.')
      if(attempts.value[attemptKey]?.requestId===requestId){const next={...attempts.value};delete next[attemptKey];attempts.value=next}
      return result
    } catch(error) {
      return{success:false,error:`Creation is not confirmed. Retry the unchanged draft to resume its reserved Product. ${error instanceof Error?error.message:String(error)}`}
    }
  }
  return{createPlan:ProductCreatePlan,createProduct:createProductFromInput,createProductFromInput,captureIntent,scopeEpoch}
}
