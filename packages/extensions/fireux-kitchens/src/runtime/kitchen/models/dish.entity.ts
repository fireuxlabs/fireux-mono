import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { DishStorage } from '../utils/dish.ts'

export const DishEntity = defineFireuxEntity({ kind: 'entity', name: 'Dish', family: ['kitchen', 'menu'], identity: 'parent-scoped', authority: 'parent', appSupport: 'none', workspace: false, parent: 'Kitchen', scoped: DishStorage.path })
