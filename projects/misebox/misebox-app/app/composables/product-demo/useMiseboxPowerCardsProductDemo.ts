import { useAsyncData } from '#imports'
import { useKitchenInterface } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import {
  kitchenMisePriorityLabel,
} from 'fireux-kitchens/runtime/models/kitchen/mise.model'
import type {
  MenuManifestItem,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-detail.model'
import type {
  PublicMenuIndexItem,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-index.model'
import type { PlaceImageShade } from 'fireux-places/runtime/models/place.model'
import {
  projectSupplierDemoWorld,
} from 'fireux-suppliers/runtime/utils/supplier-demo-world'

const productDemoSurface = 'power-cards' as const
const productDemoDataSource = 'demo' as const

export type MiseboxPowerCardsProductDemo = {
  surface: 'power-cards'
  dataSource: 'demo'
  cards: {
    kitchens: {
      id: string
      to: string
      name: string
      shortAddress: string
      imageUrl: string
      imageShade: PlaceImageShade
      prop: string
    }[]
    menu: PublicMenuIndexItem
    dish: {
      id: string
      title: string
      imageUrl: string
      meta: string
      priceLabel: string
    }
    mise: {
      imageUrl: string
      name: string
      subtitle: string
      status: string
      prop: string
      badges: string[]
      details: { label: string; value: string }[]
    }
    recipe: {
      to: string
      title: string
      subtitle: string
      status: string
      badges: string[]
      prop: string
    }
    supplierItem: {
      to: string
      imageUrl: string
      title: string
      subtitle: string
      badges: string[]
      packPriceLabel: string
      unitPriceLabel: string
      unit: string
      packLabel: string
      productId: string
      ingredientId: string
    }
    orderItem: {
      currencyCode: string
      item: MenuManifestItem
    }
    supplier: {
      id: string
      to: string
      title: string
      subtitle: string
      avatarUrl: string
      badges: string[]
      summary: string
    }
  }
}

const formatProductionAmount = (
  amount: { quantity: number; unit: string }
) => {
  const unit = amount.unit === 'portion' && amount.quantity !== 1
    ? 'portions'
    : amount.unit
  return `${amount.quantity} ${unit}`
}

const formatStatus = (value: string) =>
  value
    .split('_')
    .map((word, index) =>
      index === 0
        ? `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}`
        : word
    )
    .join(' ')

async function loadMiseboxPowerCardsProductDemo(): Promise<MiseboxPowerCardsProductDemo> {
  const [
    scenarioModule,
    presentationModule,
    companyModule,
    supplierModule,
    suppliersModule,
  ] = await Promise.all([
    import('fireux-kitchens/runtime/demo/kitchen/scenarios'),
    import('fireux-kitchens/runtime/demo/kitchen/presentation/index'),
    import('fireux-companies/runtime/demo/company/scenarios'),
    import('fireux-suppliers/runtime/demo/supplier/scenarios'),
    import('fireux-kitchens/runtime/utils/kitchen/demo-suppliers'),
  ])
  const supplierDemoWorld = projectSupplierDemoWorld({
    scenarios: supplierModule.supplierDemoScenarios,
    companyTargets: companyModule.companyDemoTargets,
  })

  const consoleScenario = scenarioModule.deanosKitchenDemoScenario
  const kitchenScenarios = [
    scenarioModule.deanosKitchenDemoScenario,
    scenarioModule.pizzaTheActionKitchenDemoScenario,
    scenarioModule.miseboxRestaurantKitchenDemoScenario,
  ]
  const {
    cell: projectKitchenCell,
    surface: projectKitchenSurface,
  } = useKitchenInterface()
  const kitchens: MiseboxPowerCardsProductDemo['cards']['kitchens'] =
    kitchenScenarios.map((scenario) => {
      const kitchenCell = projectKitchenCell(projectKitchenSurface({
        kitchen: scenario.kitchen,
        place: scenario.place,
        scope: scenario.appSupport,
        routeScope: 'demo',
      }))
      if (!kitchenCell) {
        throw new Error(
          `PowerCards Demo Kitchen Cell is incomplete: ${scenario.kitchen.id}`
        )
      }
      return {
        ...kitchenCell,
        imageShade: kitchenCell.imageShade || 'none',
        prop: String(scenario.kitchen.identity.tagline || '').trim(),
      }
    })

  const menu = consoleScenario.menus.find(item =>
    item.kitchenMenu.id === consoleScenario.kitchenMenu.id
  )
  const manifest = presentationModule.kitchenDemoManifest(consoleScenario)
  const orderItem = manifest.content.sections
    .flatMap(section => section.items)
    .find(item => item.id === 'deanos-classic-item')
  const miseTask = consoleScenario.miseTasks.find(
    task => task.id === 'shape-main-patties'
  )
  const recipe = consoleScenario.recipes.find(
    item => item.id === 'deanos-burger-sauce'
  )
  const supplierScenario = supplierDemoWorld.find(
    scenario => scenario.supplier.id === 'alpine-foodservice'
  )
  const supplierOperation =
    suppliersModule.buildKitchenDemoSuppliersOperation({
      links: consoleScenario.supplierIngredientLinks,
      supplierScenarios: supplierDemoWorld,
    })
  const supplier = supplierOperation.items.find(
    item => item.id === 'alpine-foodservice'
  )
  const supplierItem = supplierScenario?.items.find(
    item => item.ingredient_id === 'beef-mince'
  )
  const stationName = consoleScenario.stations.find(
    station => station.id === miseTask?.station
  )?.name

  if (
    !menu
    || menu.rootMenu.status !== 'published'
    || !orderItem
    || !miseTask
    || !recipe
    || !supplier
    || !supplierItem
    || !stationName
    || !Number.isSafeInteger(supplierItem.pack_cost_minor)
    || Number(supplierItem.pack_cost_minor) <= 0
    || !Number.isFinite(supplierItem.quantity_per_pack)
    || Number(supplierItem.quantity_per_pack) <= 0
  ) {
    throw new Error('PowerCards Demo projection is incomplete.')
  }

  const money = new Intl.NumberFormat('en-CH', {
    style: 'currency',
    currency: supplierItem.currency_code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const kitchenName =
    consoleScenario.kitchen.identity.display_name
    || consoleScenario.place.name
  const consoleKitchenCard = kitchens.find(
    kitchen => kitchen.id === consoleScenario.kitchen.id
  )
  if (!consoleKitchenCard) {
    throw new Error('PowerCards Demo Kitchen identity is unresolved.')
  }

  return {
    surface: productDemoSurface,
    dataSource: productDemoDataSource,
    cards: {
      kitchens,
      menu: {
        id: menu.rootMenu.id,
        kind: menu.rootMenu.kind,
        name: menu.rootMenu.name,
        description: menu.rootMenu.description,
        status: menu.rootMenu.status,
        kitchen: {
          name: kitchenName,
          logo_image_url: consoleKitchenCard.imageUrl,
          image_shade: consoleKitchenCard.imageShade,
        },
        source: {
          app_id: consoleScenario.appId,
          kitchen_id: consoleScenario.kitchen.id,
          menu_id: menu.kitchenMenu.id,
          kitchen_slug: consoleScenario.kitchen.slug,
          kitchen_name: kitchenName,
        },
      },
      dish: {
        id: orderItem.dishId,
        title: orderItem.name,
        imageUrl: orderItem.imageUrl,
        meta: menu.kitchenMenu.name,
        priceLabel: orderItem.priceLabel,
      },
      mise: {
        imageUrl: '',
        name: miseTask.title,
        subtitle: stationName,
        status: formatStatus(miseTask.status),
        prop:
          miseTask.description
          || miseTask.checklist.map(item => item.label).join(' · '),
        badges: [`${kitchenMisePriorityLabel(miseTask.priority)} priority`],
        details: [{
          label: 'Estimate',
          value: `${miseTask.estimated_minutes} min`,
        }],
      },
      recipe: {
        to: '',
        title: recipe.name,
        subtitle: 'Recipe',
        status: '',
        badges: [`Yield ${formatProductionAmount(recipe.yield)}`],
        prop: recipe.method[0] ?? recipe.name,
      },
      supplierItem: {
        to: '',
        imageUrl: '',
        title: String(supplierItem.name_override || '').trim(),
        subtitle: supplier.name,
        badges: [],
        packPriceLabel: money.format(
          Number(supplierItem.pack_cost_minor) / 100
        ),
        unitPriceLabel: money.format(
          Number(supplierItem.pack_cost_minor)
          / Number(supplierItem.quantity_per_pack)
          / 100
        ),
        unit: String(supplierItem.unit || '').trim(),
        packLabel: String(supplierItem.pack_size_label || '').trim(),
        productId: String(supplierItem.product_id || '').trim(),
        ingredientId: String(supplierItem.ingredient_id || '').trim(),
      },
      orderItem: {
        currencyCode: manifest.presentation.currencyCode,
        item: orderItem,
      },
      supplier: {
        id: supplier.id,
        to: '',
        title: supplier.name,
        subtitle:
          supplier.headquartersLabel
          || supplier.deliveryAreas.join(', '),
        avatarUrl: supplier.logoImageUrl || supplier.imageUrl,
        badges: supplier.categories.slice(0, 2),
        summary: supplier.headline,
      },
    },
  }
}

export async function useMiseboxPowerCardsProductDemo() {
  return useAsyncData<MiseboxPowerCardsProductDemo>(
    'misebox-power-cards-demo-v1',
    async () => {
      try {
        return await loadMiseboxPowerCardsProductDemo()
      }
      catch (error) {
        console.error(
          '[misebox-power-cards-demo] Failed to load Demo data.',
          error instanceof Error ? error.message : String(error)
        )
        throw error
      }
    },
    { deep: false }
  )
}
