import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { IngredientStorage } from '../utils/ingredient.ts'

export const IngredientEntity = defineFireuxEntity({ kind: 'entity', name: 'Ingredient', family: ['kitchen', 'supplier'], identity: 'root', authority: 'domain-database', appSupport: 'none', workspace: false, root: IngredientStorage.path })
