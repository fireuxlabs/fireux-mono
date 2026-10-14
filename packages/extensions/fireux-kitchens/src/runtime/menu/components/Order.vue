<template>
  <UContainer class="py-8">
    <p v-if="menu.pending.value">Loading menu…</p>
    <UAlert v-else-if="menu.failure.value || !manifest" color="error" description="This menu is unavailable for ordering." />
    <UAlert v-else-if="!submission && !serviceAvailable" color="neutral" title="This service is unavailable" description="Choose another service from the menus page." />
    <div v-else class="space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div><p class="text-sm text-muted">{{ manifest.presentation.kitchenName }}</p><h1 class="text-2xl font-bold">{{ title }} · {{ manifest.content.name }}</h1></div>
        <UButton v-if="cart.length && !submission" to="#menu-order-cart" :label="`Your order · ${cart.reduce((sum,line)=>sum+line.quantity,0)}`" variant="soft" />
      </header>
      <template v-if="submission">
        <UCard aria-live="polite">
          <h2 class="text-xl font-semibold">{{ responseTitle }}</h2>
          <p class="mt-2">{{ responseMessage }}</p>
          <p v-if="submission.message && !['ready', 'completed'].includes(submission.state)" class="mt-2">{{ submission.message }}</p>
          <p v-if="submission.estimate_minutes && ['accepted','preparing'].includes(submission.state)" class="mt-2">Estimated time: {{ submission.estimate_minutes }} minutes.</p>
          <p v-if="submission.pricing" class="mt-3 font-semibold">Items total {{ submission.pricing.currency }} {{ submission.pricing.total.toFixed(2) }}</p>
        </UCard>
        <Ticket :order="submission.order" :editable="false" class="max-w-lg" />
        <UButton label="New order" :disabled="pending" variant="outline" @click="reset" />
      </template>
      <div v-else class="menu-order-layout">
        <fieldset :disabled="pending" class="space-y-6">
          <UFormField v-if="context === 'table'" label="Table / location"><UInput v-model="location" :maxlength="200" placeholder="Your table number" /></UFormField>
          <section v-for="section in manifest.content.sections" :key="section.id" class="space-y-3">
            <h2 class="text-xl font-semibold">{{ section.label }}</h2>
            <article v-for="item in section.items" :key="item.id" class="rounded-xl border border-default p-4">
              <h3 class="font-semibold">{{ item.name }}</h3>
              <p v-if="item.description" class="mt-1 text-sm text-muted">{{ item.description }}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <UButton v-if="!item.priceOptions.length" :label="`Add · ${money(item.price)}`" size="lg" variant="soft" @click="add(section.id,item)" />
                <UButton v-for="option in item.priceOptions" :key="option.id" :label="`${option.label} · ${money(option.price)}`" size="lg" variant="soft" @click="add(section.id,item,option)" />
              </div>
            </article>
          </section>
        </fieldset>
        <aside id="menu-order-cart" class="space-y-4">
          <UCard>
            <h2 class="text-xl font-semibold">Your order</h2>
            <p v-if="!cart.length" class="mt-3 text-muted">Choose items from the menu.</p>
            <ul class="divide-y divide-default">
              <li v-for="line in cart" :key="line.key" class="space-y-2 py-3">
                <p class="font-medium">{{ line.quantity }} × {{ line.name }}</p>
                <div class="flex items-center justify-between gap-2"><span>{{ money(line.unitPrice*line.quantity) }}</span><div class="flex gap-1"><UButton icon="i-lucide-minus" :aria-label="`Remove one ${line.name}`" color="neutral" variant="soft" :disabled="pending" @click="adjust(line.key,-1)" /><UButton icon="i-lucide-plus" :aria-label="`Add one ${line.name}`" color="neutral" variant="soft" :disabled="pending || line.quantity >= 99" @click="adjust(line.key,1)" /></div></div>
              </li>
            </ul>
            <p v-if="cart.length" class="mt-3 text-lg font-bold">Items total {{ money(total) }}</p>
          </UCard>
          <fieldset v-if="cart.length" :disabled="pending" class="space-y-3">
            <UFormField :label="context === 'table' ? 'Name (optional)' : 'Your name'"><UInput v-model="name" :maxlength="200" class="w-full" /></UFormField>
            <UFormField v-if="context !== 'table'" label="Contact phone"><UInput v-model="phone" type="tel" :maxlength="64" class="w-full" /></UFormField>
            <UFormField v-if="context === 'delivery'" label="Delivery address"><UTextarea v-model="address" :maxlength="500" class="w-full" /></UFormField>
            <p v-if="context === 'delivery'" class="text-sm text-muted">The kitchen will confirm delivery availability and any delivery fee.</p>
            <p v-for="issue in issues" :key="issue" class="text-sm text-muted">{{ issue }}</p>
            <UButton label="Submit order" block size="lg" :disabled="issues.length > 0 || !currentUser" :loading="pending" @click="submit" />
          </fieldset>
        </aside>
      </div>
      <UAlert v-if="error" color="error" :description="error" />
    </div>
  </UContainer>
</template>
<script setup lang="ts">
import { computed,ref,watch,onMounted,onUnmounted } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useMenu } from '../composables/useMenu'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useOrderExchange } from '../../kitchen/composables/useOrderExchange'
import { orderSubmissionIssues } from '../../kitchen/utils/order-submission'
import Ticket from '../../kitchen/components/Orders/Ticket.vue'
import type { MenuRouteScope } from '../../kitchen/utils/kitchen-menu-route'
import type { MenuManifestItem,MenuManifestPriceOption } from '../models/menu-detail.model'
import type { Order } from '../../kitchen/models/order.model'
import type { OrderSubmission } from '../../kitchen/models/order-submission.model'
import type { MenuOrderSelection } from '../models/menu-order-selection.model'
const props=defineProps<{menuId:string;context:'collection'|'delivery'|'table';routeScope:MenuRouteScope}>()
const menu=useMenu(computed(()=>props.menuId),{routeScope:computed(()=>props.routeScope),menuContext:'generic'})
const websiteOrdering = useRuntimeConfig().public.ordering?.channels?.includes('website')
const manifest=menu.manifest
const serviceAvailable = computed(() => Boolean(websiteOrdering && manifest.value?.behaviour.availableOrderTypes.includes(props.context === 'table' ? 'dine_in' : props.context)))
const kitchenId=computed(()=>manifest.value?.source.kitchenId || '')
const {currentUser}=useAuth(),config=useFireUXConfig()
const {request,pending,error,version}=useOrderExchange(kitchenId,computed(()=>JSON.stringify([props.menuId,props.context,props.routeScope])))
type CartLine=MenuOrderSelection & {key:string;name:string;unitPrice:number}
const cart=ref<CartLine[]>([]),name=ref(''),phone=ref(''),address=ref(''),location=ref(''),id=ref('')
const submission=ref<OrderSubmission|null>(null)
const title=computed(()=>({collection:'Collection',delivery:'Delivery',table:'Table ordering'}[props.context]))
const money=(amount:number)=>`${manifest.value?.presentation.currencyCode || ''} ${amount.toFixed(2)}`
const total=computed(()=>cart.value.reduce((sum,line)=>sum+Math.round(line.unitPrice*100)*line.quantity,0)/100)
function add(sectionId:string,item:MenuManifestItem,option?:MenuManifestPriceOption) {
 const key=JSON.stringify([sectionId,item.id,option?.id]),existing=cart.value.find(line=>line.key===key)
 if(existing){if(existing.quantity<99)existing.quantity++;return}
 if(cart.value.length>=50)return
 cart.value.push({key,sectionId,itemId:item.id,...(option?{optionId:option.id}:{}),quantity:1,name:item.name+(option?` — ${option.label}`:''),unitPrice:option?.price ?? item.price})
}
function adjust(key:string,delta:number){const line=cart.value.find(line=>line.key===key);if(!line)return;line.quantity+=delta;if(line.quantity<1)cart.value=cart.value.filter(line=>line.key!==key)}
const order=computed<Order>(()=>({id:id.value||'pending',number:'',channel:'website',fulfilment:props.context==='table'?'on_site':props.context,lines:cart.value.map((line,index)=>({id:`line-${index+1}`,item:{id:line.itemId,name:line.name},quantity:line.quantity,unit_code:'C62'})),...(name.value.trim()||phone.value.trim()?{customer:{...(name.value.trim()?{name:name.value.trim()}:{}),...(phone.value.trim()?{phone:phone.value.trim()}:{})}}:{}),...(address.value.trim()?{delivery_address:address.value.trim()}:{}),...(location.value.trim()?{location:{name:location.value.trim()}}:{})}))
const issues=computed(()=>[...orderSubmissionIssues(order.value), ...(!serviceAvailable.value ? ['This service is unavailable.'] : [])])
const storageKey=()=>`order:${config.appId}:${kitchenId.value}:${props.menuId}:${props.context}:${currentUser.value?.uid||''}`
function clear(){submission.value=null;cart.value=[];name.value='';phone.value='';address.value='';location.value='';id.value=crypto.randomUUID()}
function reset(){sessionStorage.removeItem(storageKey());clear()}
async function resume(){const selected=storageKey(),saved=sessionStorage.getItem(selected);if(!saved||!currentUser.value)return;const result=await request('/api/ordering/response',{orderId:saved});if(result&&!Array.isArray(result)&&selected===storageKey())submission.value=result}
async function submit(){
 if(issues.value.length||pending.value)return
 const result=await request('/api/ordering/menu-submit',{menuId:props.menuId,...(props.routeScope.kind==='directory'?{kitchenSlug:props.routeScope.kitchenSlug}:{}),selections:cart.value.map(({sectionId,itemId,optionId,quantity})=>({sectionId,itemId,...(optionId?{optionId}:{}),quantity})),order:JSON.parse(JSON.stringify(order.value)),expectedTotal:total.value})
 if(result&&!Array.isArray(result)){submission.value=result;sessionStorage.setItem(storageKey(),result.order.id)}
}
async function refresh(){const selected=submission.value?.order.id;if(!selected||pending.value)return;const result=await request('/api/ordering/response',{orderId:selected});if(result&&!Array.isArray(result)&&submission.value?.order.id===selected)submission.value=result}
watch([version,()=>props.menuId,()=>props.context],()=>{clear();void resume()})
let timer:ReturnType<typeof setInterval>|undefined
onMounted(()=>{clear();void resume();timer=setInterval(()=>{if(submission.value&&!['completed','declined'].includes(submission.value.state))void refresh()},4000)})
onUnmounted(()=>{if(timer)clearInterval(timer)})
const responseTitle=computed(()=>({received:'Order received',accepted:'Order accepted',declined:'Order declined',preparing:'Your order is being prepared',ready:'Your order is ready',completed:'Order completed'}[submission.value?.state||'received']))
const responseMessage=computed(()=>{const saved=submission.value;if(!saved)return '';if(saved.state==='received')return 'The kitchen is reviewing your order. Please wait for confirmation.';if(saved.state==='declined')return 'The kitchen could not accept your order.';if(saved.state==='ready')return props.context==='delivery'?'Your order is ready for the driver.':props.context==='table'?`Your order is ready for ${/^\d+$/.test(saved.order.location?.name || '') ? 'table ' : ''}${saved.order.location?.name}.`:'Please go to the counter to collect your order.';if(saved.state==='completed')return 'Thank you. Your order has been completed.';return 'The kitchen has your order. Updates will appear here.'})
</script>
<style scoped>
.menu-order-layout{display:grid;gap:32px;align-items:start}
@media(min-width:900px){.menu-order-layout{grid-template-columns:minmax(0,1fr) 360px}.menu-order-layout>aside{position:sticky;top:24px}}
</style>
