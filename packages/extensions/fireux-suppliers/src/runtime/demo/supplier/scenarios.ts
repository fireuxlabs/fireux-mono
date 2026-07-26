// Concurrent edit — 2026-07-22 15:10 CEST — Demo Console shape pass: model Supplier roots and child Operations as coherent per-target scenarios.
// Concurrent edit — 2026-07-25 — Deanos supply pass: provide deterministic SupplierIngredient coverage and priced foodservice offers.
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import {
  SupplierCatalogueModel,
  SupplierIngredientModel,
  SupplierItemModel,
  SupplierModel,
  type Supplier,
  type SupplierCatalogue,
  type SupplierIngredient,
  type SupplierItem,
} from '../../models/supplier/Supplier.model'

const timestamp: FirebaseTimestamp = {
  seconds: 1_720_000_000,
  nanoseconds: 0,
}

const created = {
  at: timestamp,
  by: 'demo',
  app_id: 'misebox-app',
}

const updated = {
  at: timestamp,
  by: 'demo',
}

export type SupplierDemoScenario = {
  appId: string
  supplier: Supplier
  ingredients: SupplierIngredient[]
  items: SupplierItem[]
  catalogues: SupplierCatalogue[]
}

type SupplierDemoOfferSeed = {
  ingredientId: string
  name: string
  sku: string
  pack: string
  unit: string
  quantity: number
  costMinor: number
  sectionId: string
  itemId?: string
  productId?: string
}

type SupplierDemoCatalogueSectionSeed = {
  id: string
  label: string
  description: string
}

type SupplierDemoScenarioSeed = {
  id: string
  name: string
  headline: string
  categories: string[]
  state: Supplier['state']
  catalogueState: Supplier['catalogue_state']
  offers: SupplierDemoOfferSeed[]
  catalogue?: {
    id: string
    name: string
    description: string
    sections: SupplierDemoCatalogueSectionSeed[]
  }
}

const supplierItem = (
  supplierId: string,
  input: SupplierDemoOfferSeed
): SupplierItem => ({
  ...SupplierItemModel,
  id: input.itemId || `${supplierId}-${input.ingredientId}`,
  supplier_id: supplierId,
  product_id: input.productId || `${input.ingredientId}-foodservice`,
  ingredient_id: input.ingredientId,
  name_override: input.name,
  pack_size_label: input.pack,
  supplier_sku: input.sku,
  unit: input.unit,
  quantity_per_pack: input.quantity,
  order_unit: 'pack',
  pack_cost_minor: input.costMinor,
  currency_code: 'CHF',
  availability_state: 'available',
  lead_time_days: 1,
  min_order_quantity: 1,
  active: true,
  created,
  updated,
})

const supplierIngredient = (
  supplierId: string,
  supplierOffer: SupplierItem
): SupplierIngredient => ({
  ...SupplierIngredientModel,
  id: String(supplierOffer.ingredient_id || '').trim(),
  supplier_id: supplierId,
  ingredient_id: String(supplierOffer.ingredient_id || '').trim(),
  status: 'available',
  preferred_product_id: supplierOffer.product_id,
  active: true,
  created,
  updated,
})

const supplierRoot = (
  input: SupplierDemoScenarioSeed,
  ingredients: SupplierIngredient[]
): Supplier => ({
  ...SupplierModel,
  id: input.id,
  app_scope_state: 'root_only',
  app_scope_app_id: '',
  company_id: '',
  slug: input.id,
  supplier_organization_name: input.name,
  supplier_headline: input.headline,
  summary: `${input.name} is a deterministic read-only Supplier Console example.`,
  supplier_item_categories: [...input.categories],
  supplier_delivery_areas: ['Switzerland'],
  state: input.state,
  catalogue_state: input.catalogueState,
  linked_ingredient_ids: ingredients.map(ingredient => ingredient.ingredient_id),
  created,
  updated,
})

const supplierCatalogue = (
  supplierId: string,
  input: NonNullable<SupplierDemoScenarioSeed['catalogue']>,
  offers: SupplierDemoOfferSeed[],
  items: SupplierItem[]
): SupplierCatalogue => ({
  ...SupplierCatalogueModel,
  id: input.id,
  supplier_id: supplierId,
  name: input.name,
  description: input.description,
  sections: input.sections.map((section, sectionIndex) => ({
    id: section.id,
    label: section.label,
    description: section.description,
    items: offers
      .filter(offer => offer.sectionId === section.id)
      .map((offer, itemIndex) => {
        const item = items.find(
          candidate => candidate.ingredient_id === offer.ingredientId
        )
        if (!item) {
          throw new Error(
            `Supplier Demo catalogue ${input.id} is missing ${offer.ingredientId}.`
          )
        }

        return {
          id: `${supplierId}-catalogue-${item.id}`,
          supplier_item_id: item.id,
          product_id: item.product_id,
          label: item.name_override,
          active: true,
          sort_order: itemIndex + 1,
        }
      }),
    sort_order: sectionIndex + 1,
  })),
  sort_order: 1,
  created,
  updated,
})

const sameStringSet = (left: string[], right: string[]) => {
  const normalizedLeft = [...new Set(left)].sort()
  const normalizedRight = [...new Set(right)].sort()
  return (
    normalizedLeft.length === normalizedRight.length
    && normalizedLeft.every((value, index) => value === normalizedRight[index])
  )
}

const validateSupplierDemoScenario = (scenario: SupplierDemoScenario) => {
  const supplierId = scenario.supplier.id
  const ingredientIds = scenario.ingredients.map(
    ingredient => ingredient.ingredient_id
  )

  if (
    !sameStringSet(
      scenario.supplier.linked_ingredient_ids,
      ingredientIds
    )
  ) {
    throw new Error(
      `Supplier Demo ${supplierId} root ingredient index is inconsistent.`
    )
  }

  if (new Set(ingredientIds).size !== ingredientIds.length) {
    throw new Error(
      `Supplier Demo ${supplierId} repeats a SupplierIngredient.`
    )
  }

  for (const ingredient of scenario.ingredients) {
    if (
      ingredient.id !== ingredient.ingredient_id
      || ingredient.supplier_id !== supplierId
      || ingredient.active !== true
    ) {
      throw new Error(
        `Supplier Demo ${supplierId}/${ingredient.id} has invalid coverage authority.`
      )
    }

    const matchingOffers = scenario.items.filter(item =>
      item.active === true
      && item.supplier_id === supplierId
      && item.ingredient_id === ingredient.ingredient_id
      && item.product_id === ingredient.preferred_product_id
    )
    if (matchingOffers.length !== 1) {
      throw new Error(
        `Supplier Demo ${supplierId}/${ingredient.id} must resolve exactly one active preferred offer.`
      )
    }

    const [matchingOffer] = matchingOffers
    if (
      !matchingOffer
      || !Number.isFinite(matchingOffer.quantity_per_pack)
      || Number(matchingOffer.quantity_per_pack) <= 0
      || !Number.isSafeInteger(matchingOffer.pack_cost_minor)
      || Number(matchingOffer.pack_cost_minor) <= 0
      || matchingOffer.currency_code !== 'CHF'
    ) {
      throw new Error(
        `Supplier Demo ${supplierId}/${ingredient.id} has invalid pack terms.`
      )
    }
  }

  const itemIds = new Set(scenario.items.map(item => item.id))
  const catalogueItemIds: string[] = []
  for (const catalogue of scenario.catalogues) {
    for (const section of catalogue.sections) {
      for (const catalogueItem of section.items) {
        if (!itemIds.has(catalogueItem.supplier_item_id)) {
          throw new Error(
            `Supplier Demo catalogue ${catalogue.id} references a missing SupplierItem.`
          )
        }
        catalogueItemIds.push(catalogueItem.supplier_item_id)
      }
    }
  }

  if (
    scenario.supplier.catalogue_state === 'integrated'
    && !sameStringSet([...itemIds], catalogueItemIds)
  ) {
    throw new Error(
      `Supplier Demo ${supplierId} catalogue must contain every SupplierItem exactly once.`
    )
  }
}

const buildSupplierDemoScenario = (
  input: SupplierDemoScenarioSeed
): SupplierDemoScenario => {
  const items = input.offers.map(offer => supplierItem(input.id, offer))
  const ingredients = items.map(item => supplierIngredient(input.id, item))
  const scenario: SupplierDemoScenario = {
    appId: 'misebox-app',
    supplier: supplierRoot(input, ingredients),
    ingredients,
    items,
    catalogues: input.catalogue
      ? [supplierCatalogue(input.id, input.catalogue, input.offers, items)]
      : [],
  }

  validateSupplierDemoScenario(scenario)
  return scenario
}

const cityButchers = buildSupplierDemoScenario({
  id: 'city-butchers',
  name: 'City Butchers',
  headline: 'Whole cuts and daily meat deliveries',
  categories: ['Meat', 'Poultry'],
  state: 'official',
  catalogueState: 'integrated',
  catalogue: {
    id: 'city-butchers-core-range',
    name: 'Core kitchen range',
    description: 'The everyday meat range available to connected kitchens.',
    sections: [
      {
        id: 'fresh-meat',
        label: 'Fresh meat',
        description: 'Chilled meat and poultry for daily kitchen service.',
      },
    ],
  },
  offers: [
    {
      ingredientId: 'beef-mince',
      name: 'Beef mince 80/20',
      sku: 'CB-BEEF-5',
      pack: '5 kg case',
      unit: 'kg',
      quantity: 5,
      costMinor: 8250,
      sectionId: 'fresh-meat',
      itemId: 'city-butchers-beef-mince-5kg',
      productId: 'beef-mince-80-20',
    },
    {
      ingredientId: 'chicken-breast',
      name: 'Fresh chicken breast',
      sku: 'CB-CHICKEN-5',
      pack: '5 kg case',
      unit: 'kg',
      quantity: 5,
      costMinor: 6950,
      sectionId: 'fresh-meat',
      itemId: 'city-butchers-chicken-breast-5kg',
      productId: 'chicken-breast-fresh',
    },
    {
      ingredientId: 'turkey-breast',
      name: 'Roasting turkey breast',
      sku: 'CB-TURKEY-5',
      pack: '5 kg case',
      unit: 'kg',
      quantity: 5,
      costMinor: 7600,
      sectionId: 'fresh-meat',
    },
    {
      ingredientId: 'smoked-bacon',
      name: 'Smoked streaky bacon',
      sku: 'CB-BACON-3',
      pack: '3 kg case',
      unit: 'kg',
      quantity: 3,
      costMinor: 5400,
      sectionId: 'fresh-meat',
    },
    {
      ingredientId: 'pigs-in-blankets',
      name: 'Pigs in blankets',
      sku: 'CB-PIB-3',
      pack: '3 kg case',
      unit: 'kg',
      quantity: 3,
      costMinor: 4900,
      sectionId: 'fresh-meat',
    },
  ],
})

const alpineFoodservice = buildSupplierDemoScenario({
  id: 'alpine-foodservice',
  name: 'Alpine Foodservice',
  headline: 'Dairy, bakery and frozen kitchen essentials',
  categories: ['Dairy', 'Bakery', 'Frozen'],
  state: 'official',
  catalogueState: 'integrated',
  catalogue: {
    id: 'alpine-foodservice-core-range',
    name: 'Foodservice essentials',
    description: 'Chilled, bakery and frozen lines for everyday service.',
    sections: [
      {
        id: 'dairy',
        label: 'Dairy',
        description: 'Cheese, cultured dairy and dessert bases.',
      },
      {
        id: 'bakery',
        label: 'Bakery',
        description: 'Burger and slider buns packed for service.',
      },
      {
        id: 'frozen',
        label: 'Frozen',
        description: 'Ready-to-cook sides and frozen service essentials.',
      },
    ],
  },
  offers: [
    {
      ingredientId: 'american-cheese',
      name: 'American cheese slices',
      sku: 'AF-CHEESE-AM-120',
      pack: '120 slices',
      unit: 'each',
      quantity: 120,
      costMinor: 3890,
      sectionId: 'dairy',
    },
    {
      ingredientId: 'swiss-cheese',
      name: 'Swiss cheese',
      sku: 'AF-CHEESE-CH-25',
      pack: '2.5 kg block',
      unit: 'kg',
      quantity: 2.5,
      costMinor: 4650,
      sectionId: 'dairy',
    },
    {
      ingredientId: 'cheddar',
      name: 'Mature cheddar',
      sku: 'AF-CHEDDAR-25',
      pack: '2.5 kg block',
      unit: 'kg',
      quantity: 2.5,
      costMinor: 3425,
      sectionId: 'dairy',
    },
    {
      ingredientId: 'camembert',
      name: 'Whole Camembert',
      sku: 'AF-CAMEMBERT-12',
      pack: '12 × 250 g',
      unit: 'kg',
      quantity: 3,
      costMinor: 4200,
      sectionId: 'dairy',
    },
    {
      ingredientId: 'brie',
      name: 'Brie',
      sku: 'AF-BRIE-2',
      pack: '2 kg wheel',
      unit: 'kg',
      quantity: 2,
      costMinor: 3760,
      sectionId: 'dairy',
    },
    {
      ingredientId: 'butter',
      name: 'Unsalted butter',
      sku: 'AF-BUTTER-25',
      pack: '10 × 250 g',
      unit: 'kg',
      quantity: 2.5,
      costMinor: 3150,
      sectionId: 'dairy',
    },
    {
      ingredientId: 'milk',
      name: 'Whole milk',
      sku: 'AF-MILK-12',
      pack: '12 × 1 litre',
      unit: 'l',
      quantity: 12,
      costMinor: 2460,
      sectionId: 'dairy',
    },
    {
      ingredientId: 'buttermilk',
      name: 'Cultured buttermilk',
      sku: 'AF-BUTTERMILK-6',
      pack: '6 × 1 litre',
      unit: 'l',
      quantity: 6,
      costMinor: 1980,
      sectionId: 'dairy',
    },
    {
      ingredientId: 'cream',
      name: 'Whipping cream',
      sku: 'AF-CREAM-6',
      pack: '6 × 1 litre',
      unit: 'l',
      quantity: 6,
      costMinor: 4320,
      sectionId: 'dairy',
    },
    {
      ingredientId: 'vanilla-soft-serve',
      name: 'Vanilla soft-serve mix',
      sku: 'AF-SOFTSERVE-10',
      pack: '10 litre bag-in-box',
      unit: 'l',
      quantity: 10,
      costMinor: 5200,
      sectionId: 'dairy',
    },
    {
      ingredientId: 'burger-buns',
      name: 'Brioche burger buns',
      sku: 'AF-BUN-48',
      pack: '48 buns',
      unit: 'each',
      quantity: 48,
      costMinor: 4320,
      sectionId: 'bakery',
    },
    {
      ingredientId: 'slider-buns',
      name: 'Brioche slider buns',
      sku: 'AF-SLIDER-70',
      pack: '70 buns',
      unit: 'each',
      quantity: 70,
      costMinor: 4550,
      sectionId: 'bakery',
    },
    {
      ingredientId: 'skin-on-fries',
      name: 'Frozen skin-on fries',
      sku: 'AF-FRIES-10',
      pack: '10 kg case',
      unit: 'kg',
      quantity: 10,
      costMinor: 2850,
      sectionId: 'frozen',
    },
    {
      ingredientId: 'waffle-fries',
      name: 'Frozen waffle fries',
      sku: 'AF-WAFFLE-10',
      pack: '10 kg case',
      unit: 'kg',
      quantity: 10,
      costMinor: 3500,
      sectionId: 'frozen',
    },
    {
      ingredientId: 'ice',
      name: 'Bagged ice',
      sku: 'AF-ICE-10',
      pack: '5 × 2 kg bags',
      unit: 'kg',
      quantity: 10,
      costMinor: 1250,
      sectionId: 'frozen',
    },
    {
      ingredientId: 'mini-yorkshire-puddings',
      name: 'Frozen mini Yorkshire puddings',
      sku: 'AF-YORKSHIRE-60',
      pack: '60 pieces',
      unit: 'each',
      quantity: 60,
      costMinor: 1680,
      sectionId: 'frozen',
    },
  ],
})

const pantryHouse = buildSupplierDemoScenario({
  id: 'pantry-house',
  name: 'Pantry House',
  headline: 'Dry goods, condiments and drinks for busy kitchens',
  categories: ['Dry goods', 'Condiments', 'Drinks'],
  state: 'official',
  catalogueState: 'integrated',
  catalogue: {
    id: 'pantry-house-core-range',
    name: 'Pantry and drinks range',
    description: 'Foodservice packs for preparation, service and soft drinks.',
    sections: [
      {
        id: 'condiments',
        label: 'Condiments',
        description: 'Sauces, pickles and prepared accompaniments.',
      },
      {
        id: 'dry-goods',
        label: 'Dry goods',
        description: 'Baking, seasoning and preparation essentials.',
      },
      {
        id: 'drinks',
        label: 'Drinks',
        description: 'Still and sparkling water for service.',
      },
    ],
  },
  offers: [
    {
      ingredientId: 'mayonnaise',
      name: 'Foodservice mayonnaise',
      sku: 'PH-MAYO-5',
      pack: '5 litre tub',
      unit: 'l',
      quantity: 5,
      costMinor: 2250,
      sectionId: 'condiments',
    },
    {
      ingredientId: 'vegan-mayonnaise',
      name: 'Vegan mayonnaise',
      sku: 'PH-VMAYO-5',
      pack: '5 litre tub',
      unit: 'l',
      quantity: 5,
      costMinor: 2650,
      sectionId: 'condiments',
    },
    {
      ingredientId: 'ketchup',
      name: 'Tomato ketchup',
      sku: 'PH-KETCHUP-5',
      pack: '5 litre tub',
      unit: 'l',
      quantity: 5,
      costMinor: 1380,
      sectionId: 'condiments',
    },
    {
      ingredientId: 'american-mustard',
      name: 'American mustard',
      sku: 'PH-AMUSTARD-4',
      pack: '4 litre tub',
      unit: 'l',
      quantity: 4,
      costMinor: 1560,
      sectionId: 'condiments',
    },
    {
      ingredientId: 'mustard',
      name: 'Dijon mustard',
      sku: 'PH-MUSTARD-2',
      pack: '2 kg tub',
      unit: 'kg',
      quantity: 2,
      costMinor: 1750,
      sectionId: 'condiments',
    },
    {
      ingredientId: 'pickles',
      name: 'Sliced burger pickles',
      sku: 'PH-PICKLE-24',
      pack: '6 × 400 g jars',
      unit: 'kg',
      quantity: 2.4,
      costMinor: 1380,
      sectionId: 'condiments',
    },
    {
      ingredientId: 'jalapenos',
      name: 'Sliced jalapeños',
      sku: 'PH-JALAPENO-24',
      pack: '6 × 400 g jars',
      unit: 'kg',
      quantity: 2.4,
      costMinor: 1490,
      sectionId: 'condiments',
    },
    {
      ingredientId: 'cider-vinegar',
      name: 'Cider vinegar',
      sku: 'PH-VINEGAR-5',
      pack: '5 litre bottle',
      unit: 'l',
      quantity: 5,
      costMinor: 820,
      sectionId: 'condiments',
    },
    {
      ingredientId: 'honey',
      name: 'Clear honey',
      sku: 'PH-HONEY-3',
      pack: '3 kg tub',
      unit: 'kg',
      quantity: 3,
      costMinor: 2850,
      sectionId: 'condiments',
    },
    {
      ingredientId: 'chilli-sauce',
      name: 'Fermented chilli sauce',
      sku: 'PH-CHILLI-3',
      pack: '3 litre case',
      unit: 'l',
      quantity: 3,
      costMinor: 1960,
      sectionId: 'condiments',
    },
    {
      ingredientId: 'cranberry-relish',
      name: 'Cranberry relish',
      sku: 'PH-CRANBERRY-3',
      pack: '3 kg tub',
      unit: 'kg',
      quantity: 3,
      costMinor: 2490,
      sectionId: 'condiments',
    },
    {
      ingredientId: 'gravy',
      name: 'Prepared rich gravy',
      sku: 'PH-GRAVY-5',
      pack: '5 litre bag-in-box',
      unit: 'l',
      quantity: 5,
      costMinor: 1690,
      sectionId: 'condiments',
    },
    {
      ingredientId: 'smoked-paprika',
      name: 'Smoked paprika',
      sku: 'PH-PAPRIKA-05',
      pack: '500 g tub',
      unit: 'kg',
      quantity: 0.5,
      costMinor: 890,
      sectionId: 'dry-goods',
    },
    {
      ingredientId: 'black-pepper',
      name: 'Ground black pepper',
      sku: 'PH-PEPPER-05',
      pack: '500 g tub',
      unit: 'kg',
      quantity: 0.5,
      costMinor: 790,
      sectionId: 'dry-goods',
    },
    {
      ingredientId: 'brown-sugar',
      name: 'Soft brown sugar',
      sku: 'PH-BSUGAR-5',
      pack: '5 kg sack',
      unit: 'kg',
      quantity: 5,
      costMinor: 1125,
      sectionId: 'dry-goods',
    },
    {
      ingredientId: 'flour',
      name: 'Plain flour',
      sku: 'PH-FLOUR-10',
      pack: '10 kg sack',
      unit: 'kg',
      quantity: 10,
      costMinor: 1650,
      sectionId: 'dry-goods',
    },
    {
      ingredientId: 'cornflour',
      name: 'Cornflour',
      sku: 'PH-CORNFLOUR-5',
      pack: '5 kg sack',
      unit: 'kg',
      quantity: 5,
      costMinor: 1275,
      sectionId: 'dry-goods',
    },
    {
      ingredientId: 'baking-powder',
      name: 'Baking powder',
      sku: 'PH-BAKING-1',
      pack: '1 kg tub',
      unit: 'kg',
      quantity: 1,
      costMinor: 680,
      sectionId: 'dry-goods',
    },
    {
      ingredientId: 'fine-salt',
      name: 'Fine salt',
      sku: 'PH-FSALT-5',
      pack: '5 kg sack',
      unit: 'kg',
      quantity: 5,
      costMinor: 490,
      sectionId: 'dry-goods',
    },
    {
      ingredientId: 'sea-salt',
      name: 'Flaky sea salt',
      sku: 'PH-SSALT-2',
      pack: '2 kg case',
      unit: 'kg',
      quantity: 2,
      costMinor: 940,
      sectionId: 'dry-goods',
    },
    {
      ingredientId: 'sugar',
      name: 'Granulated sugar',
      sku: 'PH-SUGAR-10',
      pack: '10 kg sack',
      unit: 'kg',
      quantity: 10,
      costMinor: 1390,
      sectionId: 'dry-goods',
    },
    {
      ingredientId: 'vanilla',
      name: 'Vanilla extract',
      sku: 'PH-VANILLA-1',
      pack: '1 litre bottle',
      unit: 'l',
      quantity: 1,
      costMinor: 2150,
      sectionId: 'dry-goods',
    },
    {
      ingredientId: 'sage-onion-stuffing',
      name: 'Sage and onion stuffing mix',
      sku: 'PH-STUFFING-5',
      pack: '5 kg case',
      unit: 'kg',
      quantity: 5,
      costMinor: 2180,
      sectionId: 'dry-goods',
    },
    {
      ingredientId: 'crispy-onions',
      name: 'Crispy fried onions',
      sku: 'PH-CRISPYONION-2',
      pack: '2 kg case',
      unit: 'kg',
      quantity: 2,
      costMinor: 1740,
      sectionId: 'dry-goods',
    },
    {
      ingredientId: 'breadcrumbs',
      name: 'Golden breadcrumbs',
      sku: 'PH-CRUMB-5',
      pack: '5 kg sack',
      unit: 'kg',
      quantity: 5,
      costMinor: 1325,
      sectionId: 'dry-goods',
    },
    {
      ingredientId: 'gingerbread-spice',
      name: 'Gingerbread spice',
      sku: 'PH-GINGERSPICE-05',
      pack: '500 g tub',
      unit: 'kg',
      quantity: 0.5,
      costMinor: 1150,
      sectionId: 'dry-goods',
    },
    {
      ingredientId: 'gingerbread-biscuits',
      name: 'Gingerbread biscuits',
      sku: 'PH-GINGERBISCUIT-2',
      pack: '2 kg case',
      unit: 'kg',
      quantity: 2,
      costMinor: 1450,
      sectionId: 'dry-goods',
    },
    {
      ingredientId: 'sparkling-water',
      name: 'Sparkling mineral water',
      sku: 'PH-SPARKLING-12',
      pack: '12 × 1 litre',
      unit: 'l',
      quantity: 12,
      costMinor: 1180,
      sectionId: 'drinks',
    },
    {
      ingredientId: 'still-water',
      name: 'Still mineral water',
      sku: 'PH-STILL-12',
      pack: '12 × 1 litre',
      unit: 'l',
      quantity: 12,
      costMinor: 780,
      sectionId: 'drinks',
    },
  ],
})

const bernMarketGarden = buildSupplierDemoScenario({
  id: 'bern-market-garden',
  name: 'Bern Market Garden',
  headline: 'Fresh produce, fruit and herbs from the region',
  categories: ['Produce', 'Fruit', 'Herbs'],
  state: 'official',
  catalogueState: 'integrated',
  catalogue: {
    id: 'bern-market-garden-core-range',
    name: 'Market produce',
    description: 'Fresh produce and herbs prepared for foodservice kitchens.',
    sections: [
      {
        id: 'vegetables',
        label: 'Vegetables',
        description: 'Everyday vegetables and salad produce.',
      },
      {
        id: 'fruit',
        label: 'Fruit',
        description: 'Fresh fruit for drinks, sauces and desserts.',
      },
      {
        id: 'herbs',
        label: 'Herbs',
        description: 'Fresh cut herbs for preparation and garnish.',
      },
    ],
  },
  offers: [
    {
      ingredientId: 'onions',
      name: 'Brown onions',
      sku: 'BMG-ONION-10',
      pack: '10 kg sack',
      unit: 'kg',
      quantity: 10,
      costMinor: 1690,
      sectionId: 'vegetables',
    },
    {
      ingredientId: 'lettuce',
      name: 'Crisp lettuce',
      sku: 'BMG-LETTUCE-12',
      pack: '4.8 kg case · approximately 12 heads',
      unit: 'kg',
      quantity: 4.8,
      costMinor: 2550,
      sectionId: 'vegetables',
    },
    {
      ingredientId: 'brown-mushrooms',
      name: 'Brown mushrooms',
      sku: 'BMG-MUSHROOM-3',
      pack: '3 kg case',
      unit: 'kg',
      quantity: 3,
      costMinor: 2190,
      sectionId: 'vegetables',
    },
    {
      ingredientId: 'tomato',
      name: 'Vine tomatoes',
      sku: 'BMG-TOMATO-5',
      pack: '5 kg case',
      unit: 'kg',
      quantity: 5,
      costMinor: 2450,
      sectionId: 'vegetables',
    },
    {
      ingredientId: 'cauliflower',
      name: 'Whole cauliflower',
      sku: 'BMG-CAULI-8',
      pack: '6.4 kg case · approximately 8 heads',
      unit: 'kg',
      quantity: 6.4,
      costMinor: 2360,
      sectionId: 'vegetables',
    },
    {
      ingredientId: 'red-cabbage',
      name: 'Red cabbage',
      sku: 'BMG-CABBAGE-6',
      pack: '6 kg case · approximately 6 heads',
      unit: 'kg',
      quantity: 6,
      costMinor: 1980,
      sectionId: 'vegetables',
    },
    {
      ingredientId: 'spring-onion',
      name: 'Spring onions',
      sku: 'BMG-SPRING-2',
      pack: '2 kg case',
      unit: 'kg',
      quantity: 2,
      costMinor: 2380,
      sectionId: 'vegetables',
    },
    {
      ingredientId: 'garlic',
      name: 'Fresh garlic',
      sku: 'BMG-GARLIC-2',
      pack: '2 kg case',
      unit: 'kg',
      quantity: 2,
      costMinor: 1750,
      sectionId: 'vegetables',
    },
    {
      ingredientId: 'cucumber',
      name: 'Cucumbers',
      sku: 'BMG-CUCUMBER-12',
      pack: '4.2 kg case · approximately 12 cucumbers',
      unit: 'kg',
      quantity: 4.2,
      costMinor: 1860,
      sectionId: 'vegetables',
    },
    {
      ingredientId: 'rocket',
      name: 'Wild rocket',
      sku: 'BMG-ROCKET-1',
      pack: '1 kg case',
      unit: 'kg',
      quantity: 1,
      costMinor: 1790,
      sectionId: 'vegetables',
    },
    {
      ingredientId: 'lemon',
      name: 'Fresh lemons',
      sku: 'BMG-LEMON-5',
      pack: '5 kg case',
      unit: 'kg',
      quantity: 5,
      costMinor: 2190,
      sectionId: 'fruit',
    },
    {
      ingredientId: 'cherries',
      name: 'Dark cherries',
      sku: 'BMG-CHERRY-25',
      pack: '2.5 kg case',
      unit: 'kg',
      quantity: 2.5,
      costMinor: 3250,
      sectionId: 'fruit',
    },
    {
      ingredientId: 'strawberries',
      name: 'Fresh strawberries',
      sku: 'BMG-STRAWBERRY-25',
      pack: '2.5 kg case',
      unit: 'kg',
      quantity: 2.5,
      costMinor: 3850,
      sectionId: 'fruit',
    },
    {
      ingredientId: 'lime',
      name: 'Fresh limes',
      sku: 'BMG-LIME-4',
      pack: '4 kg case',
      unit: 'kg',
      quantity: 4,
      costMinor: 2950,
      sectionId: 'fruit',
    },
    {
      ingredientId: 'chives',
      name: 'Fresh chives',
      sku: 'BMG-CHIVES-05',
      pack: '500 g case',
      unit: 'kg',
      quantity: 0.5,
      costMinor: 1290,
      sectionId: 'herbs',
    },
    {
      ingredientId: 'dill',
      name: 'Fresh dill',
      sku: 'BMG-DILL-05',
      pack: '500 g case',
      unit: 'kg',
      quantity: 0.5,
      costMinor: 1390,
      sectionId: 'herbs',
    },
    {
      ingredientId: 'mint',
      name: 'Fresh mint',
      sku: 'BMG-MINT-05',
      pack: '500 g case',
      unit: 'kg',
      quantity: 0.5,
      costMinor: 890,
      sectionId: 'herbs',
    },
    {
      ingredientId: 'basil',
      name: 'Fresh basil',
      sku: 'BMG-BASIL-05',
      pack: '500 g case',
      unit: 'kg',
      quantity: 0.5,
      costMinor: 1190,
      sectionId: 'herbs',
    },
  ],
})

const greenLarder = buildSupplierDemoScenario({
  id: 'green-larder',
  name: 'Green Larder',
  headline: 'Seasonal produce and kitchen herbs',
  categories: ['Produce', 'Herbs'],
  state: 'public',
  catalogueState: 'public_only',
  offers: [],
})

export const supplierDemoScenarios: SupplierDemoScenario[] = [
  cityButchers,
  alpineFoodservice,
  pantryHouse,
  bernMarketGarden,
  greenLarder,
]

const coveredIngredientIds = supplierDemoScenarios
  .flatMap(scenario => scenario.ingredients)
  .map(ingredient => ingredient.ingredient_id)
if (new Set(coveredIngredientIds).size !== coveredIngredientIds.length) {
  throw new Error('Supplier Demo ingredients must resolve through one supplier only.')
}

export const supplierDemoRecords: Supplier[] = supplierDemoScenarios.map(
  scenario => scenario.supplier
)
