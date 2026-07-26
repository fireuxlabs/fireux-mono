/**
 * Root Ingredient identities and Kitchen-owned usage links for Deanos.
 *
 * Supplier identity, coverage, packs, and prices remain owned by the Supplier
 * Demo World. These records only state which shared Ingredients Deanos uses
 * and which Supplier it has selected for each one.
 */
import {
  IngredientModel,
  type Ingredient,
} from '../../models/ingredient.model'
import {
  KitchenIngredientModel,
  type KitchenIngredient,
} from '../../models/kitchen/ingredient.model'
import {
  KitchenSupplierIngredientModel,
  type KitchenSupplierIngredient,
} from '../../models/kitchen/supplier-ingredient.model'
import {
  deanosKitchenDemoIdentity,
  kitchenDemoCreated,
  kitchenDemoUpdated,
} from './fixtures'

type DeanosIngredientDefinition = {
  id: string
  name: string
  supplierId: string
}

const deanosIngredientDefinitions: DeanosIngredientDefinition[] = [
  { id: 'beef-mince', name: 'Beef mince', supplierId: 'city-butchers' },
  { id: 'chicken-breast', name: 'Chicken breast', supplierId: 'city-butchers' },
  { id: 'turkey-breast', name: 'Turkey breast', supplierId: 'city-butchers' },
  { id: 'smoked-bacon', name: 'Smoked bacon', supplierId: 'city-butchers' },
  { id: 'pigs-in-blankets', name: 'Pigs in blankets', supplierId: 'city-butchers' },

  { id: 'american-cheese', name: 'American cheese', supplierId: 'alpine-foodservice' },
  { id: 'swiss-cheese', name: 'Swiss cheese', supplierId: 'alpine-foodservice' },
  { id: 'cheddar', name: 'Cheddar', supplierId: 'alpine-foodservice' },
  { id: 'camembert', name: 'Camembert', supplierId: 'alpine-foodservice' },
  { id: 'brie', name: 'Brie', supplierId: 'alpine-foodservice' },
  { id: 'butter', name: 'Butter', supplierId: 'alpine-foodservice' },
  { id: 'milk', name: 'Milk', supplierId: 'alpine-foodservice' },
  { id: 'buttermilk', name: 'Buttermilk', supplierId: 'alpine-foodservice' },
  { id: 'cream', name: 'Cream', supplierId: 'alpine-foodservice' },
  { id: 'vanilla-soft-serve', name: 'Vanilla soft serve', supplierId: 'alpine-foodservice' },
  { id: 'burger-buns', name: 'Burger buns', supplierId: 'alpine-foodservice' },
  { id: 'slider-buns', name: 'Slider buns', supplierId: 'alpine-foodservice' },
  { id: 'skin-on-fries', name: 'Skin-on fries', supplierId: 'alpine-foodservice' },
  { id: 'waffle-fries', name: 'Waffle fries', supplierId: 'alpine-foodservice' },
  { id: 'ice', name: 'Ice', supplierId: 'alpine-foodservice' },
  { id: 'mini-yorkshire-puddings', name: 'Mini Yorkshire puddings', supplierId: 'alpine-foodservice' },

  { id: 'mayonnaise', name: 'Mayonnaise', supplierId: 'pantry-house' },
  { id: 'vegan-mayonnaise', name: 'Vegan mayonnaise', supplierId: 'pantry-house' },
  { id: 'ketchup', name: 'Ketchup', supplierId: 'pantry-house' },
  { id: 'american-mustard', name: 'American mustard', supplierId: 'pantry-house' },
  { id: 'mustard', name: 'Mustard', supplierId: 'pantry-house' },
  { id: 'pickles', name: 'Pickles', supplierId: 'pantry-house' },
  { id: 'jalapenos', name: 'Jalapeños', supplierId: 'pantry-house' },
  { id: 'smoked-paprika', name: 'Smoked paprika', supplierId: 'pantry-house' },
  { id: 'black-pepper', name: 'Black pepper', supplierId: 'pantry-house' },
  { id: 'brown-sugar', name: 'Brown sugar', supplierId: 'pantry-house' },
  { id: 'cider-vinegar', name: 'Cider vinegar', supplierId: 'pantry-house' },
  { id: 'honey', name: 'Honey', supplierId: 'pantry-house' },
  { id: 'chilli-sauce', name: 'Chilli sauce', supplierId: 'pantry-house' },
  { id: 'flour', name: 'Plain flour', supplierId: 'pantry-house' },
  { id: 'cornflour', name: 'Cornflour', supplierId: 'pantry-house' },
  { id: 'baking-powder', name: 'Baking powder', supplierId: 'pantry-house' },
  { id: 'fine-salt', name: 'Fine salt', supplierId: 'pantry-house' },
  { id: 'sea-salt', name: 'Sea salt', supplierId: 'pantry-house' },
  { id: 'sugar', name: 'Sugar', supplierId: 'pantry-house' },
  { id: 'vanilla', name: 'Vanilla extract', supplierId: 'pantry-house' },
  { id: 'cranberry-relish', name: 'Cranberry relish', supplierId: 'pantry-house' },
  { id: 'gravy', name: 'Gravy', supplierId: 'pantry-house' },
  { id: 'sage-onion-stuffing', name: 'Sage and onion stuffing', supplierId: 'pantry-house' },
  { id: 'crispy-onions', name: 'Crispy onions', supplierId: 'pantry-house' },
  { id: 'breadcrumbs', name: 'Breadcrumbs', supplierId: 'pantry-house' },
  { id: 'gingerbread-spice', name: 'Gingerbread spice', supplierId: 'pantry-house' },
  { id: 'gingerbread-biscuits', name: 'Gingerbread biscuits', supplierId: 'pantry-house' },
  { id: 'sparkling-water', name: 'Sparkling water', supplierId: 'pantry-house' },
  { id: 'still-water', name: 'Still water', supplierId: 'pantry-house' },

  { id: 'onions', name: 'Onions', supplierId: 'bern-market-garden' },
  { id: 'lettuce', name: 'Lettuce', supplierId: 'bern-market-garden' },
  { id: 'brown-mushrooms', name: 'Brown mushrooms', supplierId: 'bern-market-garden' },
  { id: 'tomato', name: 'Tomato', supplierId: 'bern-market-garden' },
  { id: 'cauliflower', name: 'Cauliflower', supplierId: 'bern-market-garden' },
  { id: 'red-cabbage', name: 'Red cabbage', supplierId: 'bern-market-garden' },
  { id: 'spring-onion', name: 'Spring onion', supplierId: 'bern-market-garden' },
  { id: 'chives', name: 'Chives', supplierId: 'bern-market-garden' },
  { id: 'dill', name: 'Dill', supplierId: 'bern-market-garden' },
  { id: 'garlic', name: 'Garlic', supplierId: 'bern-market-garden' },
  { id: 'lemon', name: 'Lemon', supplierId: 'bern-market-garden' },
  { id: 'cherries', name: 'Cherries', supplierId: 'bern-market-garden' },
  { id: 'mint', name: 'Mint', supplierId: 'bern-market-garden' },
  { id: 'strawberries', name: 'Strawberries', supplierId: 'bern-market-garden' },
  { id: 'lime', name: 'Lime', supplierId: 'bern-market-garden' },
  { id: 'basil', name: 'Basil', supplierId: 'bern-market-garden' },
  { id: 'cucumber', name: 'Cucumber', supplierId: 'bern-market-garden' },
  { id: 'rocket', name: 'Rocket', supplierId: 'bern-market-garden' },
]

export const deanosKitchenDemoIngredients: Ingredient[] =
  deanosIngredientDefinitions.map(definition => ({
    ...IngredientModel,
    id: definition.id,
    name: definition.name,
    source_language: 'en',
    names: { en: definition.name },
    slug: definition.id,
    app_id: '',
    created: kitchenDemoCreated(deanosKitchenDemoIdentity),
    updated: kitchenDemoUpdated(),
  }))

export const deanosKitchenDemoIngredientLinks: KitchenIngredient[] =
  deanosIngredientDefinitions.map(definition => ({
    ...KitchenIngredientModel,
    id: definition.id,
    ingredient_id: definition.id,
    created: kitchenDemoCreated(deanosKitchenDemoIdentity),
    updated: kitchenDemoUpdated(),
  }))

export const deanosKitchenDemoSupplierIngredientLinks:
  KitchenSupplierIngredient[] = deanosIngredientDefinitions.map(definition => ({
    ...KitchenSupplierIngredientModel,
    id: `${definition.supplierId}:${definition.id}`,
    kitchen_id: deanosKitchenDemoIdentity.kitchenId,
    supplier_id: definition.supplierId,
    ingredient_id: definition.id,
    created: kitchenDemoCreated(deanosKitchenDemoIdentity),
    updated: kitchenDemoUpdated(),
  }))
