import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { CustomerOrderLinkStorage } from '../utils/customer-order-link.ts'
export const CustomerOrderLinkRecord = defineFireuxEntity({ kind: 'record', name: 'CustomerOrderLink', family: ['identity', 'commerce'], identity: 'parent-scoped', authority: 'parent', appSupport: 'none', workspace: false, parent: 'User', scoped: CustomerOrderLinkStorage.path })
