import { kitchenMenuOrdering } from '../../../menu/utils/menu-ordering'
// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: derive guest Menu presentation from the same typed Demo records used by Workspace.
// Concurrent edit — 2026-07-22 12:40 CEST — Demo World correction: feature Garden Room and resolve Kitchen-owned payments into presentation only.
// Concurrent edit — 2026-07-22 14:12 CEST — Demo surface selectors: derive explicit Menu, Kiosk and Service presentation exports.
// Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: feature Misebox Restaurant as the default presentation world.
import { formatCurrencyAmount } from '../../../utils/currency-display'
import type {
  MenuManifest,
  MenuManifestItem,
  MenuManifestSection,
} from '../../../menu/models/menu-detail.model.ts'
import type { MenuItem } from '../../../menu/utils/menu-item.ts'
import {
  featuredKioskDemoScenario,
  featuredMenuDemoScenario,
  featuredServiceDemoScenario,
} from '../scenarios'
import type { KitchenDemoScenario } from '../core/types'
import type { WorkspaceTheme } from 'fireux-core/types/theme'

const clean = (value: unknown) => String(value ?? '').trim()
const imageShade = (value: unknown) => {
  const shade = clean(value)
  return shade === 'light' || shade === 'dark' ? shade : 'none'
}
const optionId = (item: MenuItem, label: string, index: number) => {
  const slug = clean(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
  return slug || `${item.id}-option-${index + 1}`
}
const priceLabel = (price: number, currencyCode: string) =>
  formatCurrencyAmount(price, {
    currencyCode,
    format: 'dash',
    showCurrency: true,
  })
const demoTheme = (scenario: KitchenDemoScenario): WorkspaceTheme => {
  return scenario.configuration.theme || { palette: {} }
}

const resolvedOrdering = (scenario: KitchenDemoScenario) => ({
  ...kitchenMenuOrdering(
    scenario.configuration.services,
    scenario.kitchenMenu.id
  ),
  order_types: kitchenMenuOrdering(
    scenario.configuration.services,
    scenario.kitchenMenu.id
  ).order_types.map((config) => {
    const paymentMethods = (
      scenario.configuration.fulfilment?.payment_methods || []
    )
      .filter((policy) => policy.order_types.includes(config.type))
      .map((policy) => policy.method)

    return {
      ...config,
      ...(config.fulfilment || paymentMethods.length
        ? {
            fulfilment: {
              ...config.fulfilment,
              ...(paymentMethods.length
                ? { payment_methods: paymentMethods }
                : {}),
            },
          }
        : {}),
    }
  }),
})

export function kitchenDemoManifestSections(
  scenario: KitchenDemoScenario
): MenuManifestSection[] {
  const currencyCode = clean(scenario.kitchen.currency) || 'CHF'
  const dishesById = new Map(
    scenario.dishes.map((dish) => [clean(dish.id), dish])
  )

  return [...scenario.menuSections]
    .filter(({ section }) => section.status === 'active')
    .sort((left, right) => left.section.sort_order - right.section.sort_order)
    .map(({ section, items }) => ({
      id: section.id,
      label: section.label,
      items: [...items]
        .filter((item) => item.status === 'active')
        .sort((left, right) => left.sort_order - right.sort_order)
        .flatMap<MenuManifestItem>((item) => {
          const dish = dishesById.get(clean(item.dish_id))
          if (!dish) return []

          return [
            {
              id: item.id,
              dishId: dish.id,
              itemKind: dish.item_kind,
              isDeal: dish.is_deal,
              name: dish.name,
              description: dish.description,
              imageUrl: dish.image,
              price: item.price,
              priceLabel: priceLabel(item.price, currencyCode),
              priceOptions: item.price_options.map((option, index) => ({
                id: optionId(item, option.label, index),
                label: option.label,
                price: option.price,
                priceLabel: priceLabel(option.price, currencyCode),
              })),
              addOns: item.add_ons.map((addOn) => ({
                id: addOn.id,
                label: addOn.label,
                price: addOn.price,
                priceLabel: priceLabel(addOn.price, currencyCode),
              })),
            },
          ]
        }),
    }))
}

export function kitchenDemoManifest(
  scenario: KitchenDemoScenario
): MenuManifest {
  const ordering = resolvedOrdering(scenario)
  const orderTypes = ordering.order_types.map((config) => config.type)
  const availableOrderTypes = ordering.order_types
    .filter((config) => config.availability?.paused !== true)
    .map((config) => config.type)
  const defaultOrderType = availableOrderTypes[0]

  return {
    content: {
      id: scenario.rootMenu.id,
      name: scenario.rootMenu.name,
      description: scenario.rootMenu.description || '',
      sections: kitchenDemoManifestSections(scenario),
    },
    behaviour: {
      context: 'generic',
      surface: 'generic',
      ordering,
      orderingEnabled: ordering.enabled,
      orderTypes,
      availableOrderTypes,
      defaultOrderType,
      defaultOrderTypeConfig: ordering.order_types.find(
        (config) => config.type === defaultOrderType
      ),
      choices: [],
    },
    presentation: {
      currencyCode: clean(scenario.kitchen.currency) || 'CHF',
      currencyFormat: 'dash',
      showCurrency: true,
      kitchenImageShade: imageShade(scenario.place.image_shade),
      kitchenImageUrl: clean(scenario.place.image_url),
      kitchenLogoImageUrl: clean(scenario.place.logo_image),
      kitchenName: scenario.place.name,
      kitchenWordmarkImageUrl: clean(scenario.place.wordmark_image),
      theme: demoTheme(scenario),
      themeSource: 'default',
    },
    source: {
      appId: scenario.appId,
      kitchenId: scenario.kitchen.id,
      kitchenSlug: scenario.kitchen.slug,
      menuId: scenario.kitchenMenu.id,
    },
  }
}

export const featuredMenuDemoManifest = kitchenDemoManifest(
  featuredMenuDemoScenario
)

export const featuredKioskDemoManifest = kitchenDemoManifest(
  featuredKioskDemoScenario
)

export const featuredServiceDemoManifest = kitchenDemoManifest(
  featuredServiceDemoScenario
)

export const featuredKioskDemoScope = {
  kitchenId: featuredKioskDemoScenario.kitchen.id,
  menuId: featuredKioskDemoScenario.kitchenMenu.id,
  scopeKey: `${featuredKioskDemoScenario.kitchen.id}-demo-kiosk`,
  sourceMenuId: featuredKioskDemoScenario.kitchenMenu.id,
} as const
