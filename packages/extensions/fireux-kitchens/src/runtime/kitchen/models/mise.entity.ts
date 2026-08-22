import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { KitchenMiseTaskStorage } from '../utils/mise.ts'
export const KitchenMiseTaskRecord = defineFireuxEntity({ kind: 'record', name: 'KitchenMiseTask', family: ['kitchen', 'support'], identity: 'parent-scoped', authority: 'parent', appSupport: 'none', workspace: false, parent: 'Kitchen', scoped: KitchenMiseTaskStorage.path })
