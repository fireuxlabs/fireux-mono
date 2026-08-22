import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { KitchenStationStorage } from '../utils/station.ts'
export const KitchenStationRecord = defineFireuxEntity({ kind: 'record', name: 'KitchenStation', family: ['kitchen', 'support'], identity: 'parent-scoped', authority: 'parent', appSupport: 'none', workspace: false, parent: 'Kitchen', scoped: KitchenStationStorage.path })
