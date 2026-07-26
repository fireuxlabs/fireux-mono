// Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: defer and project the featured Kitchens Demo World for public read-only routes.
// Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: present Misebox Restaurant by default and Deanos Smash Burger for service.
// Concurrent edit — 2026-07-22 13:48 CEST — Kiosk Demo selector pass: project both Demo Kitchens into one local Kiosk preview.
// Concurrent edit — 2026-07-22 13:56 CEST — Kiosk theme contrast pass: assign explicit refined and counter-service preview profiles.
// Concurrent edit — 2026-07-22 18:12 CEST — Pizza Demo pass: expose a third reusable pizzeria appearance without Kitchen-specific branching.
import { useAsyncData } from '#imports'
import type { MenuManifest } from 'fireux-kitchens/runtime/models/kitchen/menu/menu-detail.model'
import type { KitchenOrder } from 'fireux-kitchens/runtime/models/kitchen/order.model'

export type MiseboxProductDemoExperience = {
  to: '/demo/menu' | '/demo/kiosk' | '/demo/service'
  eyebrow: string
  title: string
  description: string
  icon: string
  accent: 'primary' | 'warning' | 'success'
  highlights: readonly string[]
}

export type MiseboxProductDemoKioskAppearance =
  | 'refined'
  | 'counter'
  | 'pizzeria'

export type MiseboxProductDemoKiosk = {
  appearance: MiseboxProductDemoKioskAppearance
  id: string
  label: string
  tagline: string
  manifest: MenuManifest
  nextOrderNumber: number
  scopeKey: string
}

export type MiseboxProductDemo = {
  console: {
    dishes: {
      id: string
      imageUrl: string
      kind: string
      name: string
      priceLabel: string
      finance: {
        currencyCode: string
        minorUnitDigits: number
        sellingPriceMinor: number | null
        costOfSalesMinor: number
        grossProfitMinor: number | null
        foodCostPercentage: number | null
        grossMarginPercentage: number | null
      } | null
      prepItems: {
        id: string
        name: string
        station: string
        yield: string
      }[]
      recipes: {
        id: string
        ingredientCount: number
        method: string[]
        name: string
        yield: string
      }[]
      mise: {
        id: string
        quantity: string
        station: string
        title: string
      }[]
      spec: {
        assembly: string[]
        id: string
        recipeIds: string[]
        station: string
        summary: string
      }
    }[]
    mise: {
      id: string
      quantity: string
      recipeId: string
      station: string
      title: string
    }[]
    recipes: {
      id: string
      ingredientCount: number
      method: string[]
      name: string
      yield: string
    }[]
    menus: {
      id: string
      imageAlt: string
      imageUrl: string
      name: string
    }[]
  }
  menu: {
    kitchenName: string
    kitchenTagline: string
    manifest: MenuManifest
    placeLabel: string
  }
  kiosk: {
    defaultId: string
    kitchens: MiseboxProductDemoKiosk[]
  }
  service: {
    kitchenName: string
    orders: KitchenOrder[]
  }
}

const experiences: readonly MiseboxProductDemoExperience[] = [
  {
    to: '/demo/menu',
    eyebrow: 'Guest view',
    title: 'Browse a menu',
    description: 'Browse Misebox Restaurant’s polished seasonal Menu with photographed and image-free dishes.',
    icon: 'i-lucide-book-open',
    accent: 'primary',
    highlights: ['Responsive sections', 'Mixed image coverage', 'Real Menu components'],
  },
  {
    to: '/demo/kiosk',
    eyebrow: 'Self service',
    title: 'Order at a kiosk',
    description: 'Switch between restaurant, burger-counter and pizzeria presentations in the same touch-first Kiosk.',
    icon: 'i-lucide-monitor-smartphone',
    accent: 'warning',
    highlights: ['Three Kitchen themes', 'Local basket', 'No live submission'],
  },
  {
    to: '/demo/service',
    eyebrow: 'Kitchen team',
    title: 'Run a service',
    description: 'Move Deanos Smash Burger tickets from Incoming through Queue and Pass in a resettable board.',
    icon: 'i-lucide-chef-hat',
    accent: 'success',
    highlights: ['Incoming → Queue', 'Queue → Pass', 'Deterministic reset'],
  },
]

async function loadMiseboxProductDemo(): Promise<MiseboxProductDemo> {
  const [
    scenarioModule,
    presentationModule,
    supplierModule,
    financeModule,
  ] = await Promise.all([
    import('fireux-kitchens/runtime/demo/kitchen/scenarios'),
    import('fireux-kitchens/runtime/demo/kitchen/presentation/index'),
    import('fireux-suppliers/runtime/demo/supplier/scenarios'),
    import('fireux-kitchens/runtime/utils/kitchen/dish-finance'),
  ])
  const supplierIngredients = new Set(
    supplierModule.supplierDemoScenarios.flatMap(scenario =>
      scenario.ingredients.map(ingredient =>
        `${scenario.supplier.id}:${ingredient.ingredient_id}`
      )
    )
  )
  const unresolvedSupplierLinks = scenarioModule.kitchenDemoScenarios.flatMap(
    scenario =>
      scenario.supplierIngredientLinks
        .filter(link =>
          !supplierIngredients.has(`${link.supplier_id}:${link.ingredient_id}`)
        )
        .map(link =>
          `${scenario.kitchen.id}:${link.supplier_id}:${link.ingredient_id}`
        )
  )
  if (unresolvedSupplierLinks.length) {
    throw new Error(
      `Kitchen Demo supplier relationships are unresolved: ${unresolvedSupplierLinks.join(', ')}`
    )
  }

  const menuScenario = scenarioModule.featuredMenuDemoScenario
  const kioskScenario = scenarioModule.featuredKioskDemoScenario
  const serviceScenario = scenarioModule.featuredServiceDemoScenario
  const consoleScenario = scenarioModule.deanosKitchenDemoScenario
  const menuManifest = presentationModule.featuredMenuDemoManifest
  const kioskPresentations = [
    {
      appearance: 'refined' as const,
      scenario: scenarioModule.miseboxRestaurantKitchenDemoScenario,
    },
    {
      appearance: 'counter' as const,
      scenario: scenarioModule.deanosKitchenDemoScenario,
    },
    {
      appearance: 'pizzeria' as const,
      scenario: scenarioModule.pizzaTheActionKitchenDemoScenario,
    },
  ]
  const kioskKitchens = kioskPresentations.map(({ appearance, scenario }) => {
    const manifest = presentationModule.kitchenDemoManifest(scenario)
    const highestServiceNumber = scenario.orders.reduce(
      (highest, order) => Math.max(highest, Number(order.service_number || 0)),
      0
    )

    if (
      manifest.source.kitchenId !== scenario.kitchen.id
      || manifest.source.menuId !== scenario.kitchenMenu.id
    ) {
      throw new Error('A Kitchen Demo World is internally inconsistent.')
    }

    return {
      appearance,
      id: scenario.kitchen.id,
      label: scenario.kitchen.identity.display_name || scenario.place.name,
      tagline: String(scenario.kitchen.identity.tagline || '').trim(),
      manifest,
      nextOrderNumber: highestServiceNumber + 1,
      scopeKey: `misebox-product-demo:${scenario.kitchen.id}-demo-kiosk`,
    }
  })

  if (
    menuManifest.source.kitchenId !== menuScenario.kitchen.id
    || menuManifest.source.menuId !== menuScenario.kitchenMenu.id
    || !kioskKitchens.some(kitchen => kitchen.id === kioskScenario.kitchen.id)
  ) {
    throw new Error('The featured Kitchen Demo Worlds are internally inconsistent.')
  }

  const consoleMenus = consoleScenario.menus.map((menu) => {
    const linkedDishIds = menu.menuSections
      .filter(({ section }) => section.status === 'active')
      .sort((left, right) => left.section.sort_order - right.section.sort_order)
      .flatMap(({ items }) =>
        [...items]
          .filter(item => item.status === 'active')
          .sort((left, right) => left.sort_order - right.sort_order)
      )
      .map(item => String(item.dish_id || '').trim())
      .filter(Boolean)
    const previewDish = linkedDishIds
      .map(dishId =>
        menu.dishes.find(dish => dish.id === dishId)
      )
      .find(dish => Boolean(dish?.image))

    return {
      id: menu.kitchenMenu.id,
      imageAlt: previewDish
        ? `${previewDish.name} from ${menu.kitchenMenu.name}`
        : menu.kitchenMenu.name,
      imageUrl: String(previewDish?.image || '').trim(),
      name: menu.kitchenMenu.name,
    }
  })
  const consoleCurrencyCode = String(
    consoleScenario.place.default_currency_code || 'CHF'
  ).trim()
  const consolePriceFormatter = new Intl.NumberFormat('en-CH', {
    style: 'currency',
    currency: consoleCurrencyCode,
    maximumFractionDigits: 2,
  })
  const formatProductionAmount = (
    amount: { quantity: number; unit: string }
  ) => {
    const unit = amount.unit === 'portion' && amount.quantity !== 1
      ? 'portions'
      : amount.unit
    return `${amount.quantity} ${unit}`
  }
  const consoleMenuItems = consoleScenario.menus.flatMap(menu =>
    menu.menuSections.flatMap(({ items }) => items)
  )
  const consoleSupplierScenarioById = new Map(
    supplierModule.supplierDemoScenarios.map(scenario => [
      String(scenario.supplier.id || '').trim(),
      scenario,
    ])
  )
  const consoleIngredientById = new Map(
    consoleScenario.ingredients.map(ingredient => [ingredient.id, ingredient])
  )
  const consoleSupplyLineByIngredientId = new Map(
    consoleScenario.supplierIngredientLinks.flatMap((link) => {
      const ingredientId = String(link.ingredient_id || '').trim()
      const supplierId = String(link.supplier_id || '').trim()
      const ingredient = consoleIngredientById.get(ingredientId)
      const supplierScenario = consoleSupplierScenarioById.get(supplierId)
      const supplierIngredient = supplierScenario?.ingredients.find(item =>
        item.active !== false
        && item.ingredient_id === ingredientId
        && item.supplier_id === supplierId
      )
      const supplierItem = supplierScenario?.items.find(item =>
        item.active !== false
        && item.availability_state !== 'unavailable'
        && item.ingredient_id === ingredientId
        && item.product_id === supplierIngredient?.preferred_product_id
        && item.supplier_id === supplierId
      )
      return ingredient && supplierScenario && supplierItem
        ? [[ingredientId, { ingredient, supplierScenario, supplierItem }] as const]
        : []
    })
  )
  const consoleDishes = consoleScenario.menus
    .flatMap(menu => menu.dishes)
    .map((dish) => {
      const spec = consoleScenario.dishSpecs
        .find(candidate => candidate.dishId === dish.id)
      const prices = consoleMenuItems
        .filter(item => item.dish_id === dish.id)
        .flatMap(item => [
          Number(item.price),
          ...item.price_options.map(option => Number(option.price)),
        ])
        .filter(price => Number.isFinite(price) && price >= 0)
      const price = prices.length ? Math.min(...prices) : null
      const finance = spec
        ? financeModule.estimateKitchenDishFinance({
            dishSpec: spec,
            scenario: consoleScenario,
            supplyLineByIngredientId: consoleSupplyLineByIngredientId,
            menuUsage: consoleScenario.menus.flatMap(menu =>
              menu.menuSections.flatMap(({ section, items }) =>
                items
                  .filter(item => item.dish_id === dish.id)
                  .map((item) => {
                    const itemPrices = [
                      Number(item.price),
                      ...item.price_options.map(option => Number(option.price)),
                    ].filter(value => Number.isFinite(value) && value > 0)
                    return {
                      active:
                        item.status === 'active' && section.status === 'active',
                      currencyCode: consoleCurrencyCode,
                      price: itemPrices.length ? Math.min(...itemPrices) : 0,
                    }
                  })
              )
            ),
          })
        : null
      const prepItemIds = new Set(
        spec?.components
          .filter(component => component.source === 'prep_item')
          .map(component => component.prepItemId)
        || []
      )
      const recipeIds = new Set(
        spec?.components
          .filter(component => component.source === 'recipe')
          .map(component => component.recipeId)
        || []
      )
      const componentSourceKeys = new Set([
        ...[...prepItemIds].map(id => `prep_item:${id}`),
        ...[...recipeIds].map(id => `recipe:${id}`),
      ])

      return {
        id: dish.id,
        imageUrl: String(dish.image || '').trim(),
        kind: dish.is_deal
          ? 'Deal'
          : dish.item_kind === 'drink'
            ? 'Drink'
            : 'Food',
        name: dish.name || dish.id,
        priceLabel: price === null ? '' : consolePriceFormatter.format(price),
        finance: finance
          ? {
              currencyCode: finance.currencyCode,
              minorUnitDigits: finance.minorUnitDigits,
              sellingPriceMinor: finance.sellingPriceMinor,
              costOfSalesMinor: finance.costOfSalesMinor,
              grossProfitMinor: finance.grossProfitMinor,
              foodCostPercentage: finance.foodCostPercentage,
              grossMarginPercentage: finance.grossMarginPercentage,
            }
          : null,
        prepItems: consoleScenario.prepItems
          .filter(item => prepItemIds.has(item.id))
          .map(item => ({
            id: item.id,
            name: item.name,
            station: item.station,
            yield: formatProductionAmount(item.yield),
          })),
        recipes: consoleScenario.recipes
          .filter(recipe => recipeIds.has(recipe.id))
          .map(recipe => ({
            id: recipe.id,
            ingredientCount: recipe.ingredients.length,
            method: [...recipe.method],
            name: recipe.name,
            yield: formatProductionAmount(recipe.yield),
          })),
        mise: consoleScenario.miseRequirements
          .filter((requirement) => {
            const sourceKey = requirement.source.kind === 'prep_item'
              ? `prep_item:${requirement.source.prepItemId}`
              : `recipe:${requirement.source.recipeId}`
            return componentSourceKeys.has(sourceKey)
          })
          .map(requirement => ({
            id: requirement.id,
            quantity: formatProductionAmount(requirement.amount),
            station: requirement.station,
            title: requirement.title,
          })),
        spec: spec
          ? {
              assembly: [...spec.assembly],
              id: spec.id,
              recipeIds: spec.components
                .filter(component => component.source === 'recipe')
                .map(component => component.recipeId),
              station: spec.station,
              summary: spec.summary,
            }
          : {
              assembly: [],
              id: '',
              recipeIds: [],
              station: '',
              summary: '',
            },
      }
    })
    .sort((left, right) => left.name.localeCompare(right.name))
  const menuDishIds = new Set(
    consoleScenario.menus
      .flatMap(menu => menu.menuSections)
      .flatMap(({ items }) => items)
      .map(item => String(item.dish_id || '').trim())
      .filter(Boolean)
  )
  const dishSpecs = consoleScenario.dishSpecs
  const ingredientIds = new Set(
    consoleScenario.ingredients.map(ingredient => ingredient.id)
  )
  const prepItemIds = new Set(
    consoleScenario.prepItems.map(prepItem => prepItem.id)
  )
  const recipeIds = new Set(
    consoleScenario.recipes.map(recipe => recipe.id)
  )
  const missingSpecs = [...menuDishIds]
    .filter(dishId => !dishSpecs.some(spec => spec.dishId === dishId))
  const unknownSpecDishes = dishSpecs
    .filter(spec => !menuDishIds.has(spec.dishId))
  const unknownComponentReferences = dishSpecs
    .flatMap(spec => spec.components)
    .filter((component) => {
      if (component.source === 'ingredient') {
        return !ingredientIds.has(component.ingredientId)
      }
      if (component.source === 'prep_item') {
        return !prepItemIds.has(component.prepItemId)
      }
      return !recipeIds.has(component.recipeId)
    })

  if (
    missingSpecs.length
    || unknownSpecDishes.length
    || unknownComponentReferences.length
  ) {
    throw new Error('The Deanos production-planning demo is internally inconsistent.')
  }

  return {
    console: {
      dishes: consoleDishes,
      mise: consoleScenario.miseRequirements.map(requirement => ({
        id: requirement.id,
        quantity: formatProductionAmount(requirement.amount),
        recipeId: requirement.source.kind === 'recipe'
          ? requirement.source.recipeId
          : '',
        station: requirement.station,
        title: requirement.title,
      })),
      recipes: consoleScenario.recipes.map(recipe => ({
        id: recipe.id,
        ingredientCount: recipe.ingredients.length,
        method: [...recipe.method],
        name: recipe.name,
        yield: formatProductionAmount(recipe.yield),
      })),
      menus: consoleMenus,
    },
    menu: {
      kitchenName: menuManifest.presentation.kitchenName,
      kitchenTagline: String(menuScenario.kitchen.identity.tagline || '').trim(),
      manifest: menuManifest,
      placeLabel: String(
        menuScenario.place.short_address
        || menuScenario.place.formatted_address
        || ''
      ).trim(),
    },
    kiosk: {
      defaultId: kioskScenario.kitchen.id,
      kitchens: kioskKitchens,
    },
    service: {
      kitchenName: serviceScenario.kitchen.identity.display_name
        || serviceScenario.place.name,
      orders: serviceScenario.orders.map(order => ({ ...order })),
    },
  }
}

export async function useMiseboxProductDemo() {
  const state = await useAsyncData<MiseboxProductDemo>(
    'misebox-product-demo-production-v1',
    async () => {
      try {
        return await loadMiseboxProductDemo()
      }
      catch (error) {
        console.error(
          '[misebox-product-demo] Failed to load demo data.',
          error instanceof Error ? error.message : String(error)
        )
        throw error
      }
    },
    { deep: false }
  )

  return {
    ...state,
    experiences,
  }
}
