import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { KitchenSaleStorage } from '../utils/sale.ts'
export const KitchenSaleRecord = defineFireuxEntity({ kind: 'record', name: 'KitchenSale', family: ['kitchen', 'commerce'], identity: 'parent-scoped', authority: 'parent', appSupport: 'none', workspace: false, parent: 'KitchenOrder', scoped: KitchenSaleStorage.path })
