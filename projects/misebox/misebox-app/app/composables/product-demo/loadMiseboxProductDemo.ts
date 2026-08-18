import type { PublicIngredient } from 'fireux-kitchens/runtime/ingredient/models/ingredient-public.model'
import { useKitchenInterface } from 'fireux-kitchens/runtime/kitchen/composables/firestore/utils/view/useKitchenInterface'
import { projectKitchenMiseTasks } from 'fireux-kitchens/runtime/kitchen/models/mise-presentation'
import { projectSupplierDemoWorld } from 'fireux-suppliers/runtime/supplier/utils/supplier-demo-world'
import { projectMiseboxProductDemoConsoleFoundations } from './projectMiseboxProductDemoConsoleFoundations'
import type { MiseboxProductDemoModel } from './misebox-product-demo.model'

const productDemoSurface = 'showroom' as const
const productDemoDataSource = 'demo' as const

export async function loadMiseboxProductDemo(
  loadIngredientRoots: (ids: string[]) => Promise<PublicIngredient[]>
): Promise<MiseboxProductDemoModel> {
  const { pill: projectKitchenPill, surface: projectKitchenSurface } =
    useKitchenInterface()
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
    import('fireux-kitchens/runtime/kitchen/demo/scenarios'),
    import('fireux-kitchens/runtime/kitchen/demo/presentation/index'),
    import('fireux-companies/runtime/place/demo/company/scenarios'),
    import('fireux-suppliers/runtime/supplier/demo/scenarios'),
    import('fireux-kitchens/runtime/kitchen/utils/demo-dishes'),
    import('fireux-kitchens/runtime/kitchen/utils/demo-suppliers'),
    import('fireux-kitchens/runtime/kitchen/utils/demo-finance'),
    import('fireux-kitchens/runtime/kitchen/utils/kitchen-spine'),
    import('fireux-kitchens/runtime/kitchen/utils/demo-menu-cascade'),
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
  const {
    consoleFinancePeriods,
    consoleIngredientRoots,
    consoleIngredients,
    consoleMiseTaskById,
    consoleStationName,
    consoleStationNames,
    consoleStations,
    consoleTableCount,
  } = await projectMiseboxProductDemoConsoleFoundations({
    consoleMenuCascade,
    consoleScenario,
    financeModule,
    kitchenSpineModule,
    loadIngredientRoots,
  })
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
