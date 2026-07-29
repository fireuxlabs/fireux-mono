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
import {
  resolveIngredientFoodGroup,
  type IngredientFoodGroup,
} from 'fireux-kitchens/runtime/models/ingredient-food-group'
import type { MenuManifest } from 'fireux-kitchens/runtime/models/kitchen/menu/menu-detail.model'
import { useKitchenInterface } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type {
  KitchenFinanceReportPeriod,
} from 'fireux-kitchens/runtime/models/kitchen/finance-report.model'
import {
  projectKitchenMiseTasks,
  type KitchenMiseTaskSummary,
} from 'fireux-kitchens/runtime/models/kitchen/mise-presentation'
import {
  projectSupplierDemoWorld,
} from 'fireux-suppliers/runtime/utils/supplier-demo-world'
import type { KitchenOrder } from 'fireux-kitchens/runtime/models/kitchen/order.model'
import type { KitchenDemoMenuMode } from 'fireux-kitchens/runtime/utils/kitchen/demo-menu-cascade'
import type { PlaceImageShade } from 'fireux-places/runtime/models/place.model'

const productDemoSurface = 'showroom' as const
const productDemoDataSource = 'demo' as const

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
  surface: 'showroom'
  dataSource: 'demo'
  console: {
    kitchenId: string
    kitchenName: string
    kitchenPill: {
      title: string
      subtitle: string
      imageUrl: string
      imageShade?: PlaceImageShade
    }
    dishes: {
      id: string
      imageUrl: string
      kind: string
      menuIds: string[]
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
        quantitySold: number | null
        totalSalesMinor: number | null
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
    ingredients: {
      foodGroup: IngredientFoodGroup
      id: string
      imageUrl: string
      menuIds: string[]
      name: string
    }[]
    finance: {
      periods: {
        id: KitchenFinanceReportPeriod
        label: string
        currencyCode: string
        minorUnitDigits: number
        saleCount: number
        grossSalesMinor: number
        averageSaleMinor: number
      }[]
    }
    miseTasks: (KitchenMiseTaskSummary & {
      menuIds: string[]
    })[]
    orders: KitchenOrder[]
    recipes: {
      id: string
      ingredientCount: number
      method: string[]
      menuIds: string[]
      name: string
      yield: string
    }[]
    stations: {
      id: string
      name: string
      description: string
      active: boolean
      sortOrder: number
    }[]
    suppliers: {
      id: string
      name: string
      headline: string
      imageUrl: string
      logoImageUrl: string
      placeImageUrl: string
      headquartersLabel: string
      categories: string[]
      deliveryAreas: string[]
      linkedIngredientCount: number
      catalogueCount: number
    }[]
    tables: {
      configuredCount: number
    }
    menus: {
      id: string
      imageAlt: string
      imageUrl: string
      defaultInService: boolean
      mode: KitchenDemoMenuMode
      name: string
    }[]
  }
  menu: {
    kitchenName: string
    kitchenTagline: string
    manifest: MenuManifest
    placeLabel: string
  }
  ordering: {
    kitchenName: string
    manifest: MenuManifest
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

const consoleFinancePeriodLabels = {
  '7d': '7 days',
  '30d': '30 days',
  '90d': '90 days',
} satisfies Record<KitchenFinanceReportPeriod, string>

async function loadMiseboxProductDemo(
  loadIngredientRoots: (ids: string[]) => Promise<PublicIngredient[]>
): Promise<MiseboxProductDemo> {
  const [
    scenarioModule,
    presentationModule,
    companyModule,
    supplierModule,
    dishesModule,
    suppliersModule,
    financeModule,
    kitchenSpineModule,
    menuCascadeModule,
  ] = await Promise.all([
    import('fireux-kitchens/runtime/demo/kitchen/scenarios'),
    import('fireux-kitchens/runtime/demo/kitchen/presentation/index'),
    import('fireux-companies/runtime/demo/company/scenarios'),
    import('fireux-suppliers/runtime/demo/supplier/scenarios'),
    import('fireux-kitchens/runtime/utils/kitchen/demo-dishes'),
    import('fireux-kitchens/runtime/utils/kitchen/demo-suppliers'),
    import('fireux-kitchens/runtime/utils/kitchen/demo-finance'),
    import('fireux-kitchens/runtime/utils/kitchen-spine'),
    import('fireux-kitchens/runtime/utils/kitchen/demo-menu-cascade'),
  ])
  const supplierDemoWorld = projectSupplierDemoWorld({
    scenarios: supplierModule.supplierDemoScenarios,
    companyTargets: companyModule.companyDemoTargets,
  })

  const supplierIngredients = new Set(
    supplierDemoWorld.flatMap(scenario =>
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
  const orderingScenario = scenarioModule.pizzaTheActionKitchenDemoScenario
  const kioskScenario = scenarioModule.featuredKioskDemoScenario
  const serviceScenario = scenarioModule.featuredServiceDemoScenario
  const consoleScenario = scenarioModule.deanosKitchenDemoScenario
  const consoleMenuCascade =
    menuCascadeModule.projectKitchenDemoMenuCascade({
      scenario: consoleScenario,
      modeByMenuId: consoleScenario.menuModes,
    })
  const consoleMenuCascadeById = new Map(
    consoleMenuCascade.menus.map(menu => [menu.id, menu])
  )
  const consoleDishCascadeById = new Map(
    consoleMenuCascade.dishes.map(dish => [dish.id, dish])
  )
  const consoleRecipeCascadeById = new Map(
    consoleMenuCascade.recipes.map(recipe => [recipe.id, recipe])
  )
  const consoleIngredientCascadeById = new Map(
    consoleMenuCascade.ingredients.map(ingredient => [
      ingredient.id,
      ingredient,
    ])
  )
  const { pill: projectKitchenPill, surface: projectKitchenSurface } =
    useKitchenInterface()
  const consoleKitchenPill = projectKitchenPill(projectKitchenSurface({
    kitchen: consoleScenario.kitchen,
    place: consoleScenario.place,
    routeScope: 'demo',
  }))
  if (!consoleKitchenPill) {
    throw new Error('Product Demo Kitchen pill is incomplete.')
  }
  const consoleSupplierOperation =
    suppliersModule.buildKitchenDemoSuppliersOperation({
      links: consoleScenario.supplierIngredientLinks,
      supplierScenarios: supplierDemoWorld,
    })
  const consoleTableCount = kitchenSpineModule.readKitchenTableCount(
    consoleScenario.kitchen
  )
  if (!consoleTableCount) {
    throw new Error('Product Demo Kitchen Tables are not configured.')
  }
  const consoleFinance = consoleScenario.finance
  if (!consoleFinance) {
    throw new Error('Product Demo Kitchen Finance is not configured.')
  }
  const consoleFinancePeriods = (
    Object.keys(consoleFinancePeriodLabels) as KitchenFinanceReportPeriod[]
  ).map((period) => {
    const summary = financeModule.projectKitchenDemoFinanceSummary(
      consoleFinance,
      period
    )
    return {
      id: period,
      label: consoleFinancePeriodLabels[period],
      currencyCode: summary.currencyCode,
      minorUnitDigits: summary.minorUnitDigits,
      saleCount: summary.saleCount,
      grossSalesMinor: summary.grossSalesMinor,
      averageSaleMinor: summary.averageSaleMinor,
    }
  })
  const consoleStations = consoleScenario.stations
    .map((station) => {
      const id = String(station.id || '').trim()
      const name = String(station.name || '').trim()
      if (!id || !name) {
        throw new Error('Product Demo Kitchen Station is incomplete.')
      }
      const sortOrder = Number(station.sort_order)
      return {
        id,
        name,
        description: String(station.description || '').trim(),
        active: station.active !== false,
        sortOrder: Number.isFinite(sortOrder)
          ? sortOrder
          : Number.MAX_SAFE_INTEGER,
      }
    })
    .sort((left, right) =>
      left.sortOrder - right.sortOrder
      || left.name.localeCompare(right.name, undefined, {
        sensitivity: 'base',
      })
    )
  const consoleStationNames = Object.fromEntries(
    consoleScenario.stations.map(station => [station.id, station.name])
  )
  const consoleStationName = (stationId: string) =>
    consoleStationNames[stationId] || stationId
  const consoleMiseTaskById = new Map(
    consoleScenario.miseTasks.map(task => [task.id, task])
  )
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
  const consoleIngredientRootById = new Map(
    consoleIngredientRoots.map(ingredient => [ingredient.id, ingredient])
  )
  const consoleIngredients = consoleIngredientIds
    .map((ingredientId) => {
      const ingredient = consoleIngredientRootById.get(ingredientId)
      if (!ingredient) {
        throw new Error(
          `Product Demo canonical Ingredient is unresolved: ${ingredientId}`
        )
      }
      const imageUrl = String(ingredient.image_url || '').trim()
      const name = String(ingredient.name || '').trim()
      if (!imageUrl || !name) {
        throw new Error(
          `Product Demo canonical Ingredient presentation is incomplete: ${ingredientId}`
        )
      }

      return {
        foodGroup: resolveIngredientFoodGroup({
          id: ingredient.id,
          category: ingredient.category,
          kind: ingredient.kind,
        }),
        id: ingredient.id,
        imageUrl,
        menuIds: [
          ...(consoleIngredientCascadeById.get(ingredient.id)?.menuIds ?? []),
        ],
        name,
      }
    })
    .sort((left, right) =>
      left.name.localeCompare(right.name, undefined, {
        sensitivity: 'base',
      })
    )
  const consoleDishOperation = dishesModule.buildKitchenDemoDishesOperation({
    scenario: consoleScenario,
    supplierScenarios: supplierDemoWorld,
    ingredientRoots: consoleIngredientRoots,
  })
  const menuManifest = presentationModule.featuredMenuDemoManifest
  const orderingManifest = presentationModule.kitchenDemoManifest(
    orderingScenario
  )
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
    || orderingManifest.source.kitchenId !== orderingScenario.kitchen.id
    || orderingManifest.source.menuId !== orderingScenario.kitchenMenu.id
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
      defaultInService:
        consoleMenuCascadeById.get(menu.kitchenMenu.id)?.inService === true,
      imageAlt: previewDish
        ? `${previewDish.name} from ${menu.kitchenMenu.name}`
        : menu.kitchenMenu.name,
      imageUrl: String(previewDish?.image || '').trim(),
      mode:
        consoleMenuCascadeById.get(menu.kitchenMenu.id)?.mode
        ?? 'off',
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
        menuIds: [
          ...(consoleDishCascadeById.get(dish.id)?.menuIds ?? []),
        ],
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
          station: consoleStationName(prepItem.station),
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
          station: consoleStationName(requirement.station),
          title: requirement.title,
        })),
        spec: {
          assembly: [...spec.assembly],
          id: spec.id,
          recipeIds: spec.components
            .filter(component => component.source === 'recipe')
            .map(component => component.recipeId),
          station: consoleStationName(spec.station),
          summary: spec.summary,
        },
      }
    })
    .sort((left, right) => left.name.localeCompare(right.name))

  return {
    surface: productDemoSurface,
    dataSource: productDemoDataSource,
    console: {
      kitchenId: consoleScenario.kitchen.id,
      kitchenName:
        consoleScenario.kitchen.identity.display_name
        || consoleScenario.place.name,
      kitchenPill: {
        title: consoleKitchenPill.title,
        subtitle: consoleKitchenPill.subtitle,
        imageUrl: consoleKitchenPill.imageUrl,
        imageShade: consoleKitchenPill.imageShade,
      },
      dishes: consoleDishes,
      ingredients: consoleIngredients,
      finance: {
        periods: consoleFinancePeriods,
      },
      miseTasks: projectKitchenMiseTasks(
        consoleScenario.miseTasks,
        {
          stationNames: consoleStationNames,
        }
      ).map(summary => ({
        ...summary,
        menuIds: (() => {
          const task = consoleMiseTaskById.get(summary.id)
          if (!task) {
            throw new Error(
              `Product Demo Mise task projection is unresolved: ${summary.id}`
            )
          }
          return menuCascadeModule.projectKitchenDemoMiseTaskMenuIds(
            task,
            consoleMenuCascade
          )
        })(),
      })),
      orders: consoleScenario.orders.map(order => ({
        ...order,
        customer: {},
      })),
      recipes: consoleScenario.recipes.map(recipe => ({
        id: recipe.id,
        ingredientCount: recipe.ingredients.length,
        method: [...recipe.method],
        menuIds: [
          ...(consoleRecipeCascadeById.get(recipe.id)?.menuIds ?? []),
        ],
        name: recipe.name,
        yield: formatProductionAmount(recipe.yield),
      })),
      stations: consoleStations,
      suppliers: consoleSupplierOperation.items,
      tables: {
        configuredCount: consoleTableCount,
      },
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
    ordering: {
      kitchenName: orderingManifest.presentation.kitchenName,
      manifest: orderingManifest,
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
    'misebox-product-demo-production-v12',
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
