import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { KitchenMenuStorage } from '../utils/kitchen-menu.ts'
export const KitchenMenuEntity = defineFireuxEntity({ kind: 'entity', name: 'KitchenMenu', family: ['menu', 'kitchen'], identity: 'parent-scoped', authority: 'parent', appSupport: 'none', parent: 'Kitchen', scoped: KitchenMenuStorage.path })
