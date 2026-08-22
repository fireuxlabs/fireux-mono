import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { DriverAppStateStorage, DriverStorage } from '../utils/driver.ts'
export const DriverProfileRecord = defineFireuxEntity({ kind: 'record', name: 'DriverProfile', family: ['identity', 'profile', 'kitchen'], identity: 'parent-scoped', authority: 'parent', appSupport: 'none', workspace: false, parent: 'User', scoped: DriverStorage.profile })
export const DriverAppStateRecord = defineFireuxEntity({ kind: 'record', name: 'DriverAppState', family: ['identity', 'profile', 'kitchen'], identity: 'parent-scoped', authority: 'parent', appSupport: 'none', workspace: false, parent: 'User', scoped: DriverAppStateStorage.path })
