import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { KitchenOrderStorage } from '../utils/order.ts'

export const KitchenOrderEntity = defineFireuxEntity({ kind: 'entity', name: 'KitchenOrder', family: ['kitchen', 'commerce'], identity: 'parent-scoped', authority: 'parent', appSupport: 'none', workspace: false, parent: 'Kitchen', scoped: KitchenOrderStorage.path })
