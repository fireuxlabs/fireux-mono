// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: replace disconnected target fixtures with one coherent fictional Kitchen world.
// Concurrent edit — 2026-07-22 12:40 CEST — Demo World correction: preserve Deanos and Garden Room as two coherent Demo worlds.
// Concurrent edit — 2026-07-22 14:12 CEST — Demo surface selectors: name the Menu, Kiosk and Service scenarios independently.
// Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: default to Misebox Restaurant and retain Deanos Smash Burger as the service contrast.
// Concurrent edit — 2026-07-22 13:48 CEST — Kiosk Demo selector pass: give each Demo Kitchen a distinct package-owned Menu theme.
// Concurrent edit — 2026-07-22 13:56 CEST — Kiosk theme contrast pass: separate refined dining from bold counter-service typography and colour.
// Concurrent edit — 2026-07-22 18:03 CEST — Deanos modernisation pass: align the Demo brand palette and typography with its new campaign photography.
// Concurrent edit — 2026-07-22 18:12 CEST — Pizza Demo pass: add a reusable green-and-yellow pizzeria presentation world.
import { PlaceModel, type Place } from 'fireux-places/runtime/models/place.model.ts'
import type { SparseBrandPalette } from 'fireux-core/runtime/models/core/style.model'
import {
  KitchenModel,
  type Kitchen,
  type KitchenOrdersConfig,
} from '../../models/kitchen.model'
import type { KitchenFulfilmentPaymentPolicy } from '../../models/kitchen.model'
import {
  deanosKitchenDemoMenu,
  deanosPartyDemoMenu,
  deanosXmasDemoMenu,
  miseboxRestaurantKitchenDemoMenu,
  pizzaTheActionKitchenDemoMenu,
} from './operations/Menus'
import {
  deanosKitchenDemoIdentity,
  kitchenDemoAssetBase,
  kitchenDemoCreated,
  kitchenDemoUpdated,
  miseboxRestaurantKitchenDemoIdentity,
  pizzaTheActionKitchenDemoIdentity,
} from './core/fixtures'
import {
  deanosKitchenDemoFinance,
  type KitchenDemoFinance,
} from './finance'
import {
  deanosKitchenDemoDishFinance,
  type KitchenDemoDishFinance,
} from './operations/Dishes/finance'
import {
  deanosKitchenDemoIngredientLinks,
  deanosKitchenDemoSupplierIngredientLinks,
  miseboxRestaurantKitchenDemoIngredientLinks,
  miseboxRestaurantKitchenDemoSupplierIngredientLinks,
  pizzaTheActionKitchenDemoIngredientLinks,
  pizzaTheActionKitchenDemoSupplierIngredientLinks,
} from './operations/Ingredients'
import {
  deanosKitchenDemoMiseTasks,
  deanosKitchenDemoOrders,
  deanosKitchenDemoStations,
  miseboxRestaurantKitchenDemoMiseTasks,
  miseboxRestaurantKitchenDemoOrders,
  miseboxRestaurantKitchenDemoStations,
  pizzaTheActionKitchenDemoMiseTasks,
  pizzaTheActionKitchenDemoOrders,
  pizzaTheActionKitchenDemoStations,
} from './operations'
import {
  deanosKitchenDemoMise,
  deanosKitchenDemoMenuItemComponentDeltas,
  deanosKitchenDemoPrepItems,
  deanosKitchenDemoRecipes,
  deanosKitchenDemoSpecs,
  type KitchenDemoDishSpec,
  type KitchenDemoMenuItemComponentDelta,
  type KitchenDemoMiseRequirement,
  type KitchenDemoPrepItem,
  type KitchenDemoProductionRecipe,
} from './production'
import type {
  KitchenDemoIdentity,
  KitchenDemoMenu,
  KitchenDemoScenario,
  KitchenDemoScenarioDescriptor,
} from './core/types'

type DemoKitchenInput = {
  identity: KitchenDemoIdentity
  name: string
  tagline: string
  menuStyle: NonNullable<Kitchen['menus']['style']>
  palette: SparseBrandPalette
  paymentMethods: KitchenFulfilmentPaymentPolicy[]
  tableCount: number
  operationHours?: KitchenOrdersConfig['operation_hours']
}

type DemoPlaceInput = {
  identity: KitchenDemoIdentity
  name: string
  shortName: string
  tagline: string
  city: string
  postalCode: string
  region: string
  street: string
  lat: number
  lng: number
  palette: SparseBrandPalette
  imageUrl?: string
  coverImage?: string
  galleryImages?: string[]
  imageShade?: Place['image_shade']
}

const kitchen = (input: DemoKitchenInput): Kitchen => ({
  ...KitchenModel,
  id: input.identity.kitchenId,
  place_id: input.identity.placeId,
  slug: input.identity.kitchenSlug,
  app_scope: {
    state: 'root_only',
    app_id: '',
  },
  visibility: {
    show: true,
    active: true,
    is_test: false,
  },
  identity: {
    display_name: input.name,
    tagline: input.tagline,
    image_url: '',
    gallery: [],
    image_shade: 'none',
    wordmark_no_logo_image_url: '',
    wordmark_image_url: '',
  },
  menus: {
    currency_format: 'dash',
    show_currency: true,
    available: true,
    style: input.menuStyle,
  },
  orders: {
    ...(input.operationHours
      ? { operation_hours: input.operationHours }
      : {}),
    printing: {
      ticket_device_id: '',
    },
  },
  tables: {
    count: input.tableCount,
  },
  fulfilment: {
    delivery_zones: [],
    payment_methods: input.paymentMethods,
  },
  created: kitchenDemoCreated(input.identity),
  updated: kitchenDemoUpdated(),
})

const place = (input: DemoPlaceInput): Place => ({
  ...PlaceModel,
  id: input.identity.placeId,
  name: input.name,
  short_name: input.shortName,
  brand_tagline: input.tagline,
  about: 'A deterministic read-only venue used to explore Misebox without changing Live or Test data.',
  formatted_address:
    `${input.street}, ${input.postalCode} ${input.city}, Switzerland`,
  short_address: `${input.city}, Switzerland`,
  address: {
    street: input.street,
    city: input.city,
    region: input.region,
    postal_code: input.postalCode,
    country_code: 'CH',
  },
  lat: input.lat,
  lng: input.lng,
  timezone: 'Europe/Zurich',
  image_url: input.imageUrl ?? '',
  cover_image: input.coverImage ?? '',
  gallery_images: input.galleryImages ?? [],
  image_shade: input.imageShade ?? 'none',
  brand_palette: input.palette,
  types: ['restaurant'],
  tags: ['demo', 'restaurant'],
  price_level: '2',
  default_currency_code: 'CHF',
  business_hours: {
    windows: [
      {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        open: '11:30',
        close: '22:00',
      },
      {
        days: ['saturday', 'sunday'],
        open: '10:00',
        close: '22:00',
      },
    ],
  },
  verified: false,
  slug: input.identity.kitchenSlug,
  entity_families: ['kitchen'],
  source: 'manual',
  search_term: `${input.name} ${input.city}`,
  created: {
    at: kitchenDemoCreated(input.identity).at,
    by: 'demo',
  },
  updated: {
    at: kitchenDemoUpdated().at,
    by: 'demo',
  },
})

const scenario = (input: {
  identity: KitchenDemoIdentity
  kitchen: Kitchen
  place: Place
  menu: KitchenDemoMenu
  additionalMenus?: KitchenDemoMenu[]
  dishSpecs?: KitchenDemoDishSpec[]
  dishFinance?: KitchenDemoDishFinance[]
  finance?: KitchenDemoFinance
  kitchenIngredients?: KitchenDemoScenario['kitchenIngredients']
  menuItemComponentDeltas?: KitchenDemoMenuItemComponentDelta[]
  miseRequirements?: KitchenDemoMiseRequirement[]
  orders: KitchenDemoScenario['orders']
  prepItems?: KitchenDemoPrepItem[]
  recipes?: KitchenDemoProductionRecipe[]
  stations: KitchenDemoScenario['stations']
  supplierIngredientLinks?: KitchenDemoScenario['supplierIngredientLinks']
  miseTasks: KitchenDemoScenario['miseTasks']
}): KitchenDemoScenario => {
  const menus = [input.menu, ...(input.additionalMenus ?? [])]
  const kitchenIngredients = [...(input.kitchenIngredients ?? [])]
  const supplierIngredientLinks = [...(input.supplierIngredientLinks ?? [])]
  const dishSpecs = [...(input.dishSpecs ?? [])]
  const dishFinance = [...(input.dishFinance ?? [])]
  const finance = input.finance ?? null
  const menuItemComponentDeltas = [
    ...(input.menuItemComponentDeltas ?? []),
  ]
  const prepItems = [...(input.prepItems ?? [])]
  const recipes = [...(input.recipes ?? [])]
  const dishes = new Map(
    menus
      .flatMap(menu => menu.dishes)
      .map(dish => [dish.id, dish])
  )
  const ingredientIds = new Set(
    kitchenIngredients.map(ingredient => ingredient.ingredient_id)
  )
  const hasDuplicateIngredients =
    ingredientIds.size !== kitchenIngredients.length
  const hasInvalidSupplierLink = supplierIngredientLinks.some(
    link =>
      link.kitchen_id !== input.identity.kitchenId ||
      !ingredientIds.has(link.ingredient_id) ||
      !link.supplier_id
  )
  const hasInvalidRecipeLine = recipes.some(recipe =>
    !Number.isFinite(recipe.yield.quantity)
    || recipe.yield.quantity <= 0
    || recipe.ingredients.some(
      ingredient =>
        !ingredientIds.has(ingredient.ingredientId) ||
        !Number.isFinite(ingredient.quantity) ||
        ingredient.quantity <= 0
    )
  )
  const prepItemIds = new Set(prepItems.map(prepItem => prepItem.id))
  const recipeIds = new Set(recipes.map(recipe => recipe.id))
  const menuIds = new Set(menus.map(menu => menu.kitchenMenu.id))
  const stationIds = new Set(input.stations.map(station => station.id))
  const dishSpecDishIds = dishSpecs.map(spec => spec.dishId)
  const hasDuplicateProductionIds =
    prepItemIds.size !== prepItems.length
    || recipeIds.size !== recipes.length
    || new Set(dishSpecDishIds).size !== dishSpecDishIds.length
  const hasInvalidPrepItem = prepItems.some(prepItem =>
    !ingredientIds.has(prepItem.input.ingredientId)
    || !Number.isFinite(prepItem.input.quantity)
    || prepItem.input.quantity <= 0
    || !Number.isFinite(prepItem.yield.quantity)
    || prepItem.yield.quantity <= 0
  )
  const hasInvalidDishSpec = dishSpecs.some(spec => {
    if (!dishes.has(spec.dishId)) return true

    const componentIds = new Set(spec.components.map(component => component.id))
    if (componentIds.size !== spec.components.length) return true

    return spec.components.some((component) => {
      if (!Number.isFinite(component.quantity) || component.quantity <= 0) {
        return true
      }
      if (component.source === 'ingredient') {
        return !ingredientIds.has(component.ingredientId)
      }
      if (component.source === 'prep_item') {
        return !prepItemIds.has(component.prepItemId)
      }
      return !recipeIds.has(component.recipeId)
    })
  })
  const menuItemByScopedId = new Map(
    menus.flatMap(menu =>
      menu.menuSections.flatMap(({ section, items }) =>
        items.map(item => [
          `${menu.kitchenMenu.id}:${section.id}:${item.id}`,
          item,
        ] as const)
      )
    )
  )
  const menuItemDeltaIds = new Set(
    menuItemComponentDeltas.map(delta => delta.id)
  )
  const hasInvalidMenuItemDelta =
    menuItemDeltaIds.size !== menuItemComponentDeltas.length
    || menuItemComponentDeltas.some((delta) => {
      const item = menuItemByScopedId.get(
        `${delta.menuId}:${delta.sectionId}:${delta.menuItemId}`
      )
      if (!item) return true

      const hasChoice = delta.choice.kind === 'price_option'
        ? Boolean(delta.choice.id) && item.price_options.some(
            option => option.label === delta.choice.label
          )
        : item.add_ons.some(addOn => addOn.id === delta.choice.id)
      if (!hasChoice) return true

      const componentIds = new Set(
        delta.components.map(component => component.id)
      )
      if (componentIds.size !== delta.components.length) return true

      return delta.components.some((component) => {
        if (!Number.isFinite(component.quantity) || component.quantity <= 0) {
          return true
        }
        if (component.source === 'ingredient') {
          return !ingredientIds.has(component.ingredientId)
        }
        if (component.source === 'prep_item') {
          return !prepItemIds.has(component.prepItemId)
        }
        return !recipeIds.has(component.recipeId)
      })
    })
  const hasIncompleteDishSpecs =
    dishSpecs.length > 0
    && (
      dishSpecs.length !== dishes.size
      || [...dishes.keys()].some(dishId => !dishSpecDishIds.includes(dishId))
    )
  const dishFinanceDishIds = dishFinance.map(entry => entry.dishId)
  const hasInvalidDishFinance =
    new Set(dishFinanceDishIds).size !== dishFinanceDishIds.length
    || dishFinance.some(entry =>
      !dishes.has(entry.dishId)
      || !Number.isSafeInteger(entry.quantitySold)
      || entry.quantitySold <= 0
    )
    || (
      dishFinance.length > 0
      && (
        dishFinance.length !== dishes.size
        || [...dishes.keys()].some(
          dishId => !dishFinanceDishIds.includes(dishId)
        )
      )
    )
  const hasInvalidFinance = finance
    ? Object.values(finance.grossSales).some(summary =>
        !/^[A-Z]{3}$/.test(summary.currencyCode)
        || !Number.isSafeInteger(summary.saleCount)
        || summary.saleCount <= 0
        || !Number.isSafeInteger(summary.grossSalesMinor)
        || summary.grossSalesMinor <= 0
      )
    : false
  const hasInvalidMiseRequirement = (input.miseRequirements ?? []).some(
    requirement => {
      if (
        !Number.isFinite(requirement.amount.quantity)
        || requirement.amount.quantity <= 0
      ) {
        return true
      }
      return requirement.source.kind === 'prep_item'
        ? !prepItemIds.has(requirement.source.prepItemId)
        : !recipeIds.has(requirement.source.recipeId)
    }
  )
  const hasInvalidStation =
    stationIds.size !== input.stations.length
    || input.stations.some(station =>
      station.kitchen_id !== input.identity.kitchenId
      || !station.id
      || !station.name
    )
  const hasInvalidOrder = input.orders.some(order =>
    order.kitchen_id !== input.identity.kitchenId
    || !menuIds.has(order.menu_id)
    || !order.items.length
    || order.items.some(item => !dishes.has(item.dish_id))
  )
  const hasInvalidMiseTask = input.miseTasks.some(task =>
    task.kitchen_id !== input.identity.kitchenId
    || !menuIds.has(task.menu_id)
    || !stationIds.has(task.station)
    || task.ingredient_ids.some(id => !ingredientIds.has(id))
    || task.mise_ids.some(id => !prepItemIds.has(id))
    || Boolean(task.recipe_id && !recipeIds.has(task.recipe_id))
  )

  if (
    hasDuplicateIngredients ||
    hasInvalidSupplierLink ||
    hasInvalidRecipeLine ||
    hasDuplicateProductionIds ||
    hasInvalidPrepItem ||
    hasInvalidDishSpec ||
    hasInvalidMenuItemDelta ||
    hasIncompleteDishSpecs ||
    hasInvalidDishFinance ||
    hasInvalidFinance ||
    hasInvalidMiseRequirement ||
    hasInvalidStation ||
    hasInvalidOrder ||
    hasInvalidMiseTask
  ) {
    throw new Error(
      `Kitchen Demo production relationships are invalid for ${input.identity.kitchenId}.`
    )
  }

  return {
    appId: input.identity.appId,
    kitchen: input.kitchen,
    place: input.place,
    menus,
    kitchenIngredients,
    supplierIngredientLinks,
    rootMenu: input.menu.rootMenu,
    kitchenMenu: input.menu.kitchenMenu,
    dishes: [...dishes.values()],
    dishSpecs,
    dishFinance,
    finance,
    menuItemComponentDeltas,
    menuSections: input.menu.menuSections,
    miseRequirements: [...(input.miseRequirements ?? [])],
    orders: input.orders,
    prepItems,
    recipes,
    stations: input.stations,
    miseTasks: input.miseTasks,
  }
}

const deanosPalette = {
  primary_color: '#ff4f2e',
  secondary_color: '#181817',
} satisfies SparseBrandPalette

const deanosMediaBase = `${kitchenDemoAssetBase}/deanos`
const deanosProfileImage = `${deanosMediaBase}/deanos-classic.jpg`
const deanosCoverImage = `${deanosMediaBase}/double-trouble.jpg`
const deanosGalleryImages = [
  deanosProfileImage,
  deanosCoverImage,
  `${deanosMediaBase}/hot-honey-chicken.jpg`,
  `${deanosMediaBase}/dirty-deanos-fries.jpg`,
  `${deanosMediaBase}/salted-caramel-shake.jpg`,
]

const deanosMenuStyle = {
  background_color_light: '#f5f1e8',
  background_color_dark: '#10100f',
  font_color_light: '#34312d',
  font_color_dark: '#f5f1e8',
  title_color_light: '#181817',
  title_color_dark: '#fffaf0',
  ...deanosPalette,
  font_source: 'google',
  font_family: 'Inter',
  title_font_source: 'google',
  title_font_family: 'Space Grotesk',
} satisfies NonNullable<Kitchen['menus']['style']>

export const deanosKitchenDemoScenario = scenario({
  identity: deanosKitchenDemoIdentity,
  kitchen: kitchen({
    identity: deanosKitchenDemoIdentity,
    name: 'Deanos Smash Burger',
    tagline: 'Smashed to order. Served fast.',
    menuStyle: deanosMenuStyle,
    palette: deanosPalette,
    paymentMethods: [
      {
        method: 'online_card',
        order_types: ['collection'],
      },
      {
        method: 'card_at_pickup',
        order_types: ['collection', 'eat_in', 'takeaway'],
      },
    ],
    tableCount: 8,
    operationHours: {
      source: 'custom',
      timezone: 'Europe/Zurich',
      windows: [
        {
          days: [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ],
          open: '11:30',
          close: '22:00',
        },
      ],
    },
  }),
  place: place({
    identity: deanosKitchenDemoIdentity,
    name: 'Deanos Smash Burger',
    shortName: 'Deanos',
    tagline: 'Smashed to order. Served fast.',
    street: '1 Burger Lane',
    city: 'Bern',
    postalCode: '3000',
    region: 'BE',
    lat: 46.948,
    lng: 7.4474,
    palette: deanosPalette,
    imageUrl: deanosProfileImage,
    coverImage: deanosCoverImage,
    galleryImages: deanosGalleryImages,
    imageShade: 'none',
  }),
  menu: deanosKitchenDemoMenu,
  additionalMenus: [
    deanosPartyDemoMenu,
    deanosXmasDemoMenu,
  ],
  dishSpecs: deanosKitchenDemoSpecs,
  dishFinance: deanosKitchenDemoDishFinance,
  finance: deanosKitchenDemoFinance,
  kitchenIngredients: deanosKitchenDemoIngredientLinks,
  menuItemComponentDeltas: deanosKitchenDemoMenuItemComponentDeltas,
  miseRequirements: deanosKitchenDemoMise,
  orders: deanosKitchenDemoOrders,
  prepItems: deanosKitchenDemoPrepItems,
  recipes: deanosKitchenDemoRecipes,
  stations: deanosKitchenDemoStations,
  supplierIngredientLinks: deanosKitchenDemoSupplierIngredientLinks,
  miseTasks: deanosKitchenDemoMiseTasks,
})

const pizzaTheActionPalette = {
  primary_color: '#1f6b45',
  secondary_color: '#f2c94c',
} satisfies SparseBrandPalette

const pizzaTheActionMenuStyle = {
  background_color_light: '#fff7d6',
  background_color_dark: '#102d20',
  font_color_light: '#345442',
  font_color_dark: '#fff8dc',
  title_color_light: '#123f2a',
  title_color_dark: '#fffbe8',
  ...pizzaTheActionPalette,
  font_source: 'google',
  font_family: 'Inter',
  title_font_source: 'google',
  title_font_family: 'Montserrat',
} satisfies NonNullable<Kitchen['menus']['style']>

export const pizzaTheActionKitchenDemoScenario = scenario({
  identity: pizzaTheActionKitchenDemoIdentity,
  kitchen: kitchen({
    identity: pizzaTheActionKitchenDemoIdentity,
    name: 'Pizza the Action',
    tagline: 'Big flavour. Zero drama.',
    menuStyle: pizzaTheActionMenuStyle,
    palette: pizzaTheActionPalette,
    paymentMethods: [
      {
        method: 'online_card',
        order_types: ['collection'],
      },
      {
        method: 'card_at_pickup',
        order_types: ['collection', 'eat_in', 'takeaway'],
      },
    ],
    tableCount: 10,
  }),
  place: place({
    identity: pizzaTheActionKitchenDemoIdentity,
    name: 'Pizza the Action',
    shortName: 'Pizza the Action',
    tagline: 'Big flavour. Zero drama.',
    street: '8 Dough Street',
    city: 'Lucerne',
    postalCode: '6003',
    region: 'LU',
    lat: 47.0502,
    lng: 8.3093,
    palette: pizzaTheActionPalette,
  }),
  menu: pizzaTheActionKitchenDemoMenu,
  kitchenIngredients: pizzaTheActionKitchenDemoIngredientLinks,
  orders: pizzaTheActionKitchenDemoOrders,
  stations: pizzaTheActionKitchenDemoStations,
  supplierIngredientLinks: pizzaTheActionKitchenDemoSupplierIngredientLinks,
  miseTasks: pizzaTheActionKitchenDemoMiseTasks,
})

const miseboxRestaurantPalette = {
  primary_color: '#914632',
  secondary_color: '#61715c',
} satisfies SparseBrandPalette

const miseboxRestaurantMenuStyle = {
  background_color_light: '#eee7da',
  background_color_dark: '#11251d',
  font_color_light: '#36433b',
  font_color_dark: '#f1eadf',
  title_color_light: '#183328',
  title_color_dark: '#fffaf1',
  ...miseboxRestaurantPalette,
  font_source: 'google',
  font_family: 'Lora',
  title_font_source: 'google',
  title_font_family: 'Cormorant Garamond',
} satisfies NonNullable<Kitchen['menus']['style']>

export const miseboxRestaurantKitchenDemoScenario = scenario({
  identity: miseboxRestaurantKitchenDemoIdentity,
  kitchen: kitchen({
    identity: miseboxRestaurantKitchenDemoIdentity,
    name: 'Misebox Restaurant',
    tagline: 'A polished seasonal Menu and Kiosk',
    menuStyle: miseboxRestaurantMenuStyle,
    palette: miseboxRestaurantPalette,
    paymentMethods: [
      {
        method: 'card_at_pickup',
        order_types: ['eat_in', 'takeaway'],
      },
    ],
    tableCount: 12,
  }),
  place: place({
    identity: miseboxRestaurantKitchenDemoIdentity,
    name: 'Misebox Restaurant',
    shortName: 'Misebox Restaurant',
    tagline: 'Seasonal plates in a relaxed garden dining room',
    street: '2 Misebox Garden',
    city: 'Zurich',
    postalCode: '8000',
    region: 'ZH',
    lat: 47.3769,
    lng: 8.5417,
    palette: miseboxRestaurantPalette,
  }),
  menu: miseboxRestaurantKitchenDemoMenu,
  kitchenIngredients: miseboxRestaurantKitchenDemoIngredientLinks,
  orders: miseboxRestaurantKitchenDemoOrders,
  stations: miseboxRestaurantKitchenDemoStations,
  supplierIngredientLinks:
    miseboxRestaurantKitchenDemoSupplierIngredientLinks,
  miseTasks: miseboxRestaurantKitchenDemoMiseTasks,
})

export const defaultKitchenDemoScenario = miseboxRestaurantKitchenDemoScenario
export const featuredMenuDemoScenario = defaultKitchenDemoScenario
export const featuredKioskDemoScenario = defaultKitchenDemoScenario
export const featuredServiceDemoScenario: KitchenDemoScenario = {
  ...deanosKitchenDemoScenario,
  orders: deanosKitchenDemoOrders,
}

export const kitchenDemoScenarios: KitchenDemoScenario[] = [
  defaultKitchenDemoScenario,
  deanosKitchenDemoScenario,
  pizzaTheActionKitchenDemoScenario,
]

export const kitchenDemoScenarioDescriptors: KitchenDemoScenarioDescriptor[] = [
  {
    kitchenId: miseboxRestaurantKitchenDemoIdentity.kitchenId,
    maturity: 'operational',
    operationCoverage: [
      'dishes',
      'ingredients',
      'menus',
      'mise',
      'orders',
      'stations',
      'suppliers',
      'tables',
    ],
    presentation: ['menu', 'kiosk', 'service'],
  },
  {
    kitchenId: deanosKitchenDemoIdentity.kitchenId,
    maturity: 'operational',
    operationCoverage: [
      'dishes',
      'ingredients',
      'menus',
      'mise',
      'orders',
      'recipes',
      'stations',
      'suppliers',
      'tables',
    ],
    presentation: ['menu', 'kiosk', 'service'],
  },
  {
    kitchenId: pizzaTheActionKitchenDemoIdentity.kitchenId,
    maturity: 'operational',
    operationCoverage: [
      'dishes',
      'ingredients',
      'menus',
      'mise',
      'orders',
      'stations',
      'suppliers',
      'tables',
    ],
    presentation: ['menu', 'kiosk', 'service'],
  },
]

const scenarioIds = kitchenDemoScenarios.map(value => value.kitchen.id).sort()
const descriptorIds = kitchenDemoScenarioDescriptors
  .map(value => value.kitchenId)
  .sort()
if (
  scenarioIds.length !== descriptorIds.length
  || scenarioIds.some((value, index) => value !== descriptorIds[index])
) {
  throw new Error('Every Kitchen Demo scenario requires one maturity descriptor.')
}

const miseboxDemoSupplierIds = [
  'alpine-foodservice',
  'bern-market-garden',
  'pantry-house',
]
const sameStringSet = (left: string[], right: string[]) => {
  const normalizedLeft = [...new Set(left)].sort()
  const normalizedRight = [...new Set(right)].sort()
  return (
    normalizedLeft.length === normalizedRight.length
    && normalizedLeft.every((value, index) => value === normalizedRight[index])
  )
}

if (
  kitchenDemoScenarios.length !== 3
  || kitchenDemoScenarios.some(scenario =>
    !scenario.menus.length
    || !scenario.dishes.length
    || !scenario.kitchenIngredients.length
    || !scenario.supplierIngredientLinks.length
    || !scenario.orders.length
    || !scenario.stations.length
    || !scenario.miseTasks.length
    || Number(scenario.kitchen.tables.count) <= 0
    || !sameStringSet(
      scenario.supplierIngredientLinks.map(link => link.supplier_id),
      miseboxDemoSupplierIds
    )
  )
) {
  throw new Error(
    'The Misebox Demo World requires exactly three operational Kitchens connected to the same three Suppliers.'
  )
}

export type { KitchenDemoScenario } from './core/types'
