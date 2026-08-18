import type { KitchenOrderType } from '../../../../models/kitchen/order.model.ts'
import type { MenuOrderTypeStrategy } from '../order-type.ts'
import { collectionOrderType } from './collection.ts'
import { eatInOrderType, takeawayOrderType } from './counter.ts'
import { deliveryOrderType } from './delivery.ts'
import { dineInOrderType } from './dine-in.ts'
import { preOrderOrderType } from './pre-order.ts'
import { roomServiceOrderType } from './room-service.ts'

const menuOrderTypeStrategies = {
  dine_in: dineInOrderType,
  eat_in: eatInOrderType,
  takeaway: takeawayOrderType,
  collection: collectionOrderType,
  delivery: deliveryOrderType,
  pre_order: preOrderOrderType,
  room_service: roomServiceOrderType,
} satisfies Record<KitchenOrderType, MenuOrderTypeStrategy>

export const menuOrderTypeStrategy = (
  type: KitchenOrderType
): MenuOrderTypeStrategy => menuOrderTypeStrategies[type]

export const menuOrderTypeStrategiesList = () =>
  Object.values(menuOrderTypeStrategies)
