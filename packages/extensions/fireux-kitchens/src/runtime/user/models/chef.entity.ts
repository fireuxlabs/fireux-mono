import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { ChefStorage } from '../utils/chef.ts'
export const ChefProfileRecord = defineFireuxEntity({ kind: 'record', name: 'ChefProfile', family: ['identity', 'profile', 'kitchen'], identity: 'parent-scoped', authority: 'parent', appSupport: 'none', workspace: false, parent: 'User', scoped: ChefStorage.path })
