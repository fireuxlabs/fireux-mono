import { markRaw, type Component } from 'vue'
import Basket from 'fireux-kitchens/runtime/components/Menu/Detail/Funnel/Basket.vue'
import Allergen from 'fireux-kitchens/runtime/components/Menu/Detail/Funnel/Allergen.vue'
import DeliveryZone from 'fireux-kitchens/runtime/components/Menu/Detail/Funnel/Delivery/Zone.vue'
import DeliveryFulfilment from 'fireux-kitchens/runtime/components/Menu/Detail/Funnel/Delivery/Fulfilment.vue'
import CollectionRendezvous from 'fireux-kitchens/runtime/components/Menu/Detail/Funnel/Collection/Rendezvous.vue'
import CollectionKitchen from 'fireux-kitchens/runtime/components/Menu/Detail/Funnel/Collection/Kitchen.vue'
import PreOrderDetails from 'fireux-kitchens/runtime/components/Menu/Detail/Funnel/PreOrder/Details.vue'
import PreOrderKitchen from 'fireux-kitchens/runtime/components/Menu/Detail/Funnel/PreOrder/Kitchen.vue'
import Review from 'fireux-kitchens/runtime/components/Menu/Detail/Funnel/Review.vue'
import Payment from 'fireux-kitchens/runtime/components/Menu/Detail/Funnel/Payment.vue'
import type { OrderingPageScreenKind } from './orderingPages'

export const orderingScreenComponents: Partial<
  Record<OrderingPageScreenKind, Component>
> = {
  basket: markRaw(Basket),
  allergen: markRaw(Allergen),
  'delivery-zone': markRaw(DeliveryZone),
  'delivery-fulfilment': markRaw(DeliveryFulfilment),
  'collection-rendezvous': markRaw(CollectionRendezvous),
  'collection-kitchen': markRaw(CollectionKitchen),
  'pre-order-details': markRaw(PreOrderDetails),
  'pre-order-kitchen': markRaw(PreOrderKitchen),
  review: markRaw(Review),
  payment: markRaw(Payment),
}
