// @fireux-script
// last_used: 2026-08-09
// usage_note: run through pnpm guard; locks Recipe, Prep Item, Dish, and Menu Item ownership and capability boundaries.

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')

export async function run({ repoRoot = process.cwd() } = {}) {
  const recipeModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/recipe.model.ts'
  )
  const dishModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/dish.model.ts'
  )
  const menuItemModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-item.model.ts'
  )
  const stationModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/station.model.ts'
  )
  const miseModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/mise.model.ts'
  )
  const prepItemModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/prep-item.model.ts'
  )
  const menuItemWriter = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/composables/firestore/mutations/useMenuItemMutations.ts'
  )
  const flagshipCommand = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/dishes/[dishId]/flagship.patch.ts'
  )
  const rules = [
    'packages/ecosystem/fireux-misebox/src/config/firebase/rules/identity-validation.rules',
    'packages/ecosystem/fireux-misebox/src/config/firebase/rules/kitchen-operations.rules',
    'packages/ecosystem/fireux-misebox/src/config/firebase/rules/kitchen-workflow.rules',
  ].map(relativePath => read(repoRoot, relativePath)).join('\n')

  assert.match(recipeModel, /export const RecipeEntity\s*=\s*defineFireuxEntity/)
  assert.match(recipeModel, /identity:\s*'parent-scoped'/)
  assert.match(recipeModel, /parent:\s*'Kitchen'/)
  assert.match(recipeModel, /export const RecipeDefaults\b/)
  assert.match(dishModel, /export const DishEntity\s*=\s*defineFireuxEntity/)
  assert.match(dishModel, /identity:\s*'parent-scoped'/)
  assert.match(dishModel, /parent:\s*'Kitchen'/)
  assert.match(dishModel, /export const DishDefaults\b/)
  assert.match(dishModel, /is_flagship:\s*false/)
  assert.match(dishModel, /normalizeDishFlagshipFlag/)
  assert.match(rules, /data\.is_flagship is bool/)
  assert.match(flagshipCommand, /runTransaction/)
  assert.match(flagshipCommand, /where\('is_flagship', '==', true\)/)
  assert.match(flagshipCommand, /is_flagship:\s*false/)
  assert.match(menuItemModel, /export const MenuItemDefaults\b/)
  assert.match(menuItemModel, /parent:\s*'MenuSection'/)
  assert.match(stationModel, /export const KitchenStationRecord\s*=\s*defineFireuxEntity/)
  assert.match(stationModel, /kind:\s*'record'/)
  assert.match(stationModel, /parent:\s*'Kitchen'/)
  assert.match(stationModel, /export const KitchenStationDefaults\b/)
  assert.match(
    stationModel,
    /path:\s*'apps\/\{appId\}\/kitchens\/\{kitchenId\}\/stations\/\{stationId\}'/
  )
  assert.match(miseModel, /export const KitchenMiseTaskRecord\s*=\s*defineFireuxEntity/)
  assert.match(miseModel, /kind:\s*'record'/)
  assert.match(miseModel, /parent:\s*'Kitchen'/)
  assert.match(miseModel, /export const KitchenMiseTaskDefaults\b/)
  assert.match(
    miseModel,
    /path:\s*'apps\/\{appId\}\/kitchens\/\{kitchenId\}\/mise-tasks\/\{taskId\}'/
  )
  assert.match(prepItemModel, /export const KitchenPrepItemEntity\s*=\s*defineFireuxEntity/)
  assert.match(prepItemModel, /kind:\s*'entity'/)
  assert.match(prepItemModel, /parent:\s*'Kitchen'/)
  assert.match(prepItemModel, /export const KitchenPrepItemDefaults\b/)
  assert.match(
    prepItemModel,
    /path:\s*'apps\/\{appId\}\/kitchens\/\{kitchenId\}\/prep-items\/\{prepItemId\}'/
  )
  assert.match(menuItemWriter, /Select a Dish from this Kitchen/)
  assert.match(menuItemWriter, /Menu Item identity and relationships cannot be changed/)
  assert.match(rules, /match \/dishes\/\{dishId\}/)
  assert.match(rules, /match \/recipes\/\{recipeId\}/)
  assert.match(rules, /match \/stations\/\{stationId\}/)
  assert.match(rules, /function isValidKitchenStation\(data, kitchenId\)/)
  assert.match(rules, /match \/mise-tasks\/\{taskId\}/)
  assert.match(rules, /function isValidKitchenMiseTask\(data\)/)
  assert.match(rules, /match \/prep-items\/\{prepItemId\}/)
  assert.match(rules, /function isValidKitchenPrepItem\(data\)/)
  assert.match(
    rules,
    /request\.resource\.data\.diff\(resource\.data\)\.affectedKeys\(\)\.hasOnly\(\[[\s\S]*'sort_order'[\s\S]*'updated'/
  )
  assert.match(rules, /match \/items\/\{itemId\}/)
  assert.match(rules, /exists\([\s\S]*\/dishes\/\$\(data\.dish_id\)/)

  for (const retiredUmbrella of [
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/firestore/recipe/useRecipe.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/firestore/dish/useDish.ts',
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, retiredUmbrella)),
      false,
      `${retiredUmbrella} must not restore an all-in-one entity composable.`
    )
  }
}
