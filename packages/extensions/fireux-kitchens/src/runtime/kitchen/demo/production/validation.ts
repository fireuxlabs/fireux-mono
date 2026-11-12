import { deanosKitchenDemoMenuItemComponentDeltas } from './deltas'
import { deanosKitchenDemoPrepItems } from './prep-items'
import { deanosKitchenDemoRecipes } from './recipes'
import { deanosKitchenDemoSpecs } from './specs'
import type { KitchenDemoItemComponent } from './types'

const deanosKitchenDemoItemIds = [
  'deanos-classic',
  'double-trouble',
  'swiss-melt',
  'hot-honey-chicken',
  'ranch-chicken',
  'crispy-cauliflower',
  'skin-on-fries',
  'dirty-deanos-fries',
  'onion-rings',
  'salted-caramel-shake',
  'cherry-vanilla-shake',
  'house-lemonade',
  'classic-smash-slider-platter',
  'hot-honey-chicken-slider-platter',
  'cauliflower-slider-platter',
  'party-fries-tray',
  'party-onion-ring-platter',
  'party-lemonade',
  'party-strawberry-lime-cooler',
  'party-cucumber-mint-cooler',
  'deanos-christmas-stack',
  'turkey-dinner-burger',
  'pigs-in-blankets-waffle-fries',
  'fried-brie-bites',
  'stuffed-mini-yorkshires',
  'gingerbread-caramel-shake',
] as const

const assertUniqueIds = (values: Array<{ id: string }>, label: string) => {
  const ids = values.map((value) => value.id)
  if (new Set(ids).size !== ids.length) {
    throw new Error(`Deanos Demo ${label} ids must be unique.`)
  }
}

const validateComponentReferences = (
  components: KitchenDemoItemComponent[],
  prepItemIds: Set<string>,
  recipeIds: Set<string>,
  context: string
) => {
  for (const component of components) {
    if (component.quantity <= 0) {
      throw new Error(
        `Deanos Demo ${context} has a non-positive component amount.`
      )
    }
    if (
      component.source === 'prep_item' &&
      !prepItemIds.has(component.prepItemId)
    ) {
      throw new Error(
        `Deanos Demo ${context} is missing Prep item ${component.prepItemId}.`
      )
    }
    if (component.source === 'recipe' && !recipeIds.has(component.recipeId)) {
      throw new Error(
        `Deanos Demo ${context} is missing Recipe ${component.recipeId}.`
      )
    }
  }
}

export const validateDeanosKitchenDemoProduction = () => {
  assertUniqueIds(deanosKitchenDemoPrepItems, 'Prep item')
  assertUniqueIds(deanosKitchenDemoRecipes, 'Recipe')
  assertUniqueIds(deanosKitchenDemoSpecs, 'Item Spec')
  assertUniqueIds(deanosKitchenDemoMenuItemComponentDeltas, 'Menu item delta')

  const expectedItemIds = new Set<string>(deanosKitchenDemoItemIds)
  const specItemIds = deanosKitchenDemoSpecs.map((spec) => spec.dishId)
  if (
    specItemIds.length !== expectedItemIds.size ||
    specItemIds.some((dishId) => !expectedItemIds.has(dishId)) ||
    expectedItemIds.size !== new Set(specItemIds).size
  ) {
    throw new Error(
      'Deanos Demo must have exactly one Item Spec for each of its 26 Items.'
    )
  }

  const prepItemIds = new Set(deanosKitchenDemoPrepItems.map((item) => item.id))
  const recipeIds = new Set(deanosKitchenDemoRecipes.map((recipe) => recipe.id))

  for (const spec of deanosKitchenDemoSpecs) {
    validateComponentReferences(
      spec.components,
      prepItemIds,
      recipeIds,
      `Item Spec ${spec.id}`
    )
  }
  for (const delta of deanosKitchenDemoMenuItemComponentDeltas) {
    validateComponentReferences(
      delta.components,
      prepItemIds,
      recipeIds,
      `Menu item delta ${delta.id}`
    )
  }
}
