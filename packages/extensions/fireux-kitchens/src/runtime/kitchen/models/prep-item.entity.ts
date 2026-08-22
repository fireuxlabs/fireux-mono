import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { KitchenPrepItemStorage } from '../utils/prep-item.ts'

export const KitchenPrepItemEntity = defineFireuxEntity({ kind: 'entity', name: 'KitchenPrepItem', family: ['kitchen'], identity: 'parent-scoped', authority: 'parent', appSupport: 'none', workspace: false, parent: 'Kitchen', scoped: KitchenPrepItemStorage.path })
