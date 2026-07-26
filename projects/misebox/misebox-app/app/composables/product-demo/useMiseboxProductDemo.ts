// Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: defer and project the featured Kitchens Demo World for public read-only routes.
// Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: present Misebox Restaurant by default and Deanos Smash Burger for service.
// Concurrent edit — 2026-07-22 13:48 CEST — Kiosk Demo selector pass: project both Demo Kitchens into one local Kiosk preview.
// Concurrent edit — 2026-07-22 13:56 CEST — Kiosk theme contrast pass: assign explicit refined and counter-service preview profiles.
// Concurrent edit — 2026-07-22 18:12 CEST — Pizza Demo pass: expose a third reusable pizzeria appearance without Kitchen-specific branching.
import { useAsyncData, useRequestFetch } from '#imports'
import type {
  PublicIngredient,
  PublicIngredientCollectionResponse,
} from 'fireux-kitchens/runtime/models/ingredient-public.model'
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
        quantitySold: number
        totalSalesMinor: number
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

async function loadMiseboxProductDemo(
  loadIngredientRoots: (ids: string[]) => Promise<PublicIngredient[]>
): Promise<MiseboxProductDemo> {
  const [
    scenarioModule,
    presentationModule,
    supplierModule,
    dishesModule,
  ] = await Promise.all([
    import('fireux-kitchens/runtime/demo/kitchen/scenarios'),
    import('fireux-kitchens/runtime/demo/kitchen/presentation/index'),
    import('fireux-suppliers/runtime/demo/supplier/scenarios'),
    import('fireux-kitchens/runtime/utils/kitchen/demo-dishes'),
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
  const consoleIngredientIds = [
    ...new Set(
      consoleScenario.kitchenIngredients
        .map(ingredient => String(ingredient.ingredient_id || '').trim())
        .filter(Boolean)
    ),
  ].sort()
  const consoleIngredientRoots = await loadIngredientRoots(consoleIngredientIds)
  if (consoleIngredientRoots.length !== consoleIngredientIds.length) {
    const resolvedIds = new Set(
      consoleIngredientRoots.map(ingredient => ingredient.id)
    )
    throw new Error(
      `Product Demo canonical Ingredients are unresolved: ${
        consoleIngredientIds
          .filter(ingredientId => !resolvedIds.has(ingredientId))
          .join(', ')
      }`
    )
  }
  const consoleDishOperation = dishesModule.buildKitchenDemoDishesOperation({
    scenario: consoleScenario,
    supplierScenarios: supplierModule.supplierDemoScenarios,
    ingredientRoots: consoleIngredientRoots,
  })
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
  const consoleDishes = consoleDishOperation.items
    .map((item) => {
      const { dish, finance, spec } = item
      if (
        !spec
        || !finance
        || item.quantitySold === null
        || item.totalSalesMinor === null
      ) {
        throw new Error(`Product Demo Dish projection is incomplete: ${dish.id}`)
      }
      const price = finance.sellingPriceMinor === null
        ? null
        : finance.sellingPriceMinor / 10 ** finance.minorUnitDigits
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
              quantitySold: item.quantitySold,
              totalSalesMinor: item.totalSalesMinor,
            }
          : null,
        prepItems: item.prepItems.map(prepItem => ({
          id: prepItem.id,
          name: prepItem.name,
          station: prepItem.station,
          yield: formatProductionAmount(prepItem.yield),
        })),
        recipes: item.recipes.map(recipe => ({
          id: recipe.id,
          ingredientCount: recipe.ingredients.length,
          method: [...recipe.method],
          name: recipe.name,
          yield: formatProductionAmount(recipe.yield),
        })),
        mise: item.miseRequirements.map(requirement => ({
          id: requirement.id,
          quantity: formatProductionAmount(requirement.amount),
          station: requirement.station,
          title: requirement.title,
        })),
        spec: {
          assembly: [...spec.assembly],
          id: spec.id,
          recipeIds: spec.components
            .filter(component => component.source === 'recipe')
            .map(component => component.recipeId),
          station: spec.station,
          summary: spec.summary,
        },
      }
    })
    .sort((left, right) => left.name.localeCompare(right.name))

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
  const requestFetch = useRequestFetch()
  const loadIngredientRoots = async (ids: string[]) => {
    const pages = await Promise.all(
      Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) => {
        const chunk = ids.slice(index * 100, (index + 1) * 100)
        return requestFetch<PublicIngredientCollectionResponse>(
          `/api/ingredients?ids=${encodeURIComponent(chunk.join(','))}`
        )
      })
    )
    return pages.flatMap(
      (page: PublicIngredientCollectionResponse) => page.items
    )
  }
  const state = await useAsyncData<MiseboxProductDemo>(
    'misebox-product-demo-production-v2',
    async () => {
      try {
        return await loadMiseboxProductDemo(loadIngredientRoots)
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
