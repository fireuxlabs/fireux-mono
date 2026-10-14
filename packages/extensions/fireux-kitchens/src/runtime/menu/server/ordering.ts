import { readKitchenOfferingsInTransaction } from '../../kitchen/server/offerings/read'
import { kitchenMenuOrdering, publicMenuOrderTypes } from '../utils/menu-ordering'
import { createError } from 'h3'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverKitchenMenusTarget, serverKitchenMenuSectionsTarget, serverKitchenMenuItemsTarget, serverKitchenDishesTarget, FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import { projectSellable, sellableFulfilment } from '../../kitchen/utils/sellable'
import { serverKitchenSellablesTarget } from '../../kitchen/server/sellables/target'
import type { OrderLine, Order } from '../../kitchen/models/order.model'
import type { MenuOrderSelection, MenuOrderPricing } from '../models/menu-order-selection.model'
const fail = (message: string): never => { throw createError({statusCode:409,statusMessage:message}) }
export function readMenuOrderSelections(value: unknown): MenuOrderSelection[] {
 if (!Array.isArray(value) || !value.length || value.length > 50) return fail('Choose between 1 and 50 menu items.')
 const seen = new Set<string>()
 return value.map(raw => {
  if (!raw || typeof raw !== 'object' || Object.keys(raw).some(key=>!['sectionId','itemId','optionId','quantity'].includes(key))) return fail('Menu selection is invalid.')
  const sectionId=requireFirestoreDocumentId(raw.sectionId,'Section id'),itemId=requireFirestoreDocumentId(raw.itemId,'Item id')
  const optionId=raw.optionId === undefined ? undefined : requireFirestoreDocumentId(raw.optionId,'Option id')
  if (!Number.isInteger(raw.quantity) || raw.quantity<1 || raw.quantity>99) return fail('Choose a whole quantity from 1 to 99.')
  const key=JSON.stringify([sectionId,itemId,optionId]);if(seen.has(key))return fail('Combine repeated menu items.');seen.add(key)
  return {sectionId,itemId,...(optionId?{optionId}:{}),quantity:raw.quantity}
 })
}
export async function resolveMenuOrderLines(tx: GuardedServerTransaction, input: {kitchenId:string;menuId:string;selections:MenuOrderSelection[];fulfilment:Order['fulfilment'];expectedTotal:number}) {
 const menu=await tx.read(serverKitchenMenusTarget(input.kitchenId),input.menuId)
 const place=await tx.read(FIRESTORE_MUTATION_TARGETS.places,input.kitchenId)
 if(!menu.exists || menu.data?.status!=='published' || menu.data?.doc?.url) return fail('This menu is no longer available for ordering.')
 const offerings = await readKitchenOfferingsInTransaction(tx, input.kitchenId)
 const orderType = input.fulfilment === 'on_site' ? 'dine_in' : input.fulfilment
 if (!publicMenuOrderTypes(kitchenMenuOrdering(offerings, input.menuId)).some(config => config.type === orderType)) return fail('This menu does not currently offer this service.')
 const currency=readPlaceCurrencyCode(place.data || {})
 if(!currency) return fail('Menu currency is unavailable.')
 const lines:OrderLine[]=[],pricing:MenuOrderPricing={currency,total:0,lines:[]}
 for(const [index,selection] of input.selections.entries()) {
  const section=await tx.read(serverKitchenMenuSectionsTarget(input.kitchenId,input.menuId),selection.sectionId)
  const item=await tx.read(serverKitchenMenuItemsTarget(input.kitchenId,input.menuId,selection.sectionId),selection.itemId)
  if(!section.exists || section.data?.status==='archived' || !item.exists || item.data?.status==='archived') return fail('A selected menu item is no longer available.')
  const data=item.data!,dishId=requireFirestoreDocumentId(data.dish_id,'Dish id')
  const dish=await tx.read(serverKitchenDishesTarget(input.kitchenId),dishId)
  if(!dish.exists || typeof dish.data?.name!=='string' || !dish.data.name.trim() || dish.data.status==='archived') return fail('A selected dish is unavailable.')
  let price:unknown=data.price,label='',options:Array<{id:string;label:string;price:number}>=[]
  if(data.sellable_id) {
   const sellable=await tx.read(serverKitchenSellablesTarget(input.kitchenId),requireFirestoreDocumentId(data.sellable_id,'Sellable id'))
   if(!sellable.exists)return fail('Item prices are unavailable.')
   const terms=projectSellable(data.sellable_id,sellable.data,dishId)
   if(terms.sellable_currency!==currency)return fail('Item currency changed.')
   const type=input.fulfilment==='on_site'?'dine_in':input.fulfilment==='takeaway'?'takeaway':input.fulfilment==='delivery'?'delivery':'collection'
   const allowed=terms.sellable_fulfilment?.[selection.optionId || terms.sellable_variants[0]!.id]
   if(allowed && !allowed.includes(sellableFulfilment(type)))return fail('A selected item is unavailable for this service.')
   options=terms.priceOptions;price=terms.price
  } else if(Array.isArray(data.price_options)) {
   options=data.price_options.map((option:any,index:number)=>({id:option.label?.toLowerCase().replace(/[^a-z0-9]+/g,'-') || `option-${index+1}`,label:option.label,price:option.price}))
  }
  if(options.length) {
   const option=options.find(option=>option.id===selection.optionId)
   if(!option)return fail('Choose an available size for each item.')
   price=option.price;label=option.label
  } else if(selection.optionId) return fail('An item option has changed. Review your order.')
  if(typeof price!=='number'||!Number.isFinite(price)||price<0)return fail('A selected item has no valid price.')
  const unitPrice=Math.round(price*100),total=unitPrice*selection.quantity,lineId=`line-${index+1}`
  if(!Number.isSafeInteger(total))return fail('Order total is invalid.')
  lines.push({id:lineId,item:{id:selection.itemId,name:dish.data.name.trim()+(label?` — ${label}`:'')},quantity:selection.quantity,unit_code:'C62'})
  pricing.lines.push({line_id:lineId,unit_price:unitPrice/100,total:total/100});pricing.total+=total
 }
 pricing.total/=100
 if(Math.round(pricing.total*100)!==Math.round(input.expectedTotal*100))return fail('Menu prices changed. Refresh the menu and review your order.')
 return {lines,pricing}
}
