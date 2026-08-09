// @fireux-script
// last_used: 2026-08-09
// usage_note: run through pnpm guard; locks Recipe, Dish, and Menu Item ownership and capability boundaries.

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')

export async function run({ repoRoot = process.cwd() } = {}) {
  const recipeModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/models/kitchen/recipe.model.ts'
  )
  const dishModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/models/kitchen/dish.model.ts'
  )
  const menuItemModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/models/kitchen/menu/menu-item.model.ts'
  )
  const menuItemWriter = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/menu/mutations/useMenuItemMutations.ts'
  )
  const rules = read(
    repoRoot,
    'packages/ecosystem/fireux-misebox/src/config/firebase/rules/kitchen-operations.rules'
  )

  assert.match(recipeModel, /export const RecipeEntity\s*=\s*defineFireuxEntity/)
  assert.match(recipeModel, /identity:\s*'parent-scoped'/)
  assert.match(recipeModel, /parent:\s*'Kitchen'/)
  assert.match(recipeModel, /export const RecipeDefaults\b/)
  assert.match(dishModel, /export const DishEntity\s*=\s*defineFireuxEntity/)
  assert.match(dishModel, /identity:\s*'parent-scoped'/)
  assert.match(dishModel, /parent:\s*'Kitchen'/)
  assert.match(dishModel, /export const DishDefaults\b/)
  assert.match(menuItemModel, /export const MenuItemDefaults\b/)
  assert.match(menuItemModel, /parent:\s*'MenuSection'/)
  assert.match(menuItemWriter, /Select a Dish from this Kitchen/)
  assert.match(menuItemWriter, /Menu Item identity and relationships cannot be changed/)
  assert.match(rules, /match \/dishes\/\{dishId\}/)
  assert.match(rules, /match \/recipes\/\{recipeId\}/)
  assert.match(rules, /match \/items\/\{itemId\}/)
  assert.match(rules, /exists\([\s\S]*\/dishes\/\$\(data\.dish_id\)/)

  for (const retiredUmbrella of [
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/recipe/useRecipe.ts',
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/dish/useDish.ts',
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, retiredUmbrella)),
      false,
      `${retiredUmbrella} must not restore an all-in-one entity composable.`
    )
  }
}
