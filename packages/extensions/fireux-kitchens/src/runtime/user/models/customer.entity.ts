import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { CustomerStorage } from '../utils/customer.ts'
export const CustomerProfileRecord = defineFireuxEntity({ kind: 'record', name: 'CustomerProfile', family: ['identity', 'commerce'], identity: 'parent-scoped', authority: 'parent', appSupport: 'none', workspace: false, parent: 'User', scoped: CustomerStorage.path })
