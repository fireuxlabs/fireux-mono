import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { RecipeStorage } from '../utils/recipe.ts'

export const RecipeEntity = defineFireuxEntity({ kind: 'entity', name: 'Recipe', family: ['kitchen'], identity: 'parent-scoped', authority: 'parent', appSupport: 'none', workspace: false, parent: 'Kitchen', scoped: RecipeStorage.path })
