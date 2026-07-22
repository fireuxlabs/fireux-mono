// Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: defer and project the featured Kitchens Demo World for public read-only routes.
// Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: present Misebox Restaurant by default and Deanos Smash Burger for service.
// Concurrent edit — 2026-07-22 13:48 CEST — Kiosk Demo selector pass: project both Demo Kitchens into one local Kiosk preview.
// Concurrent edit — 2026-07-22 13:56 CEST — Kiosk theme contrast pass: assign explicit refined and counter-service preview profiles.
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

export type MiseboxProductDemoKiosk = {
  appearance: 'refined' | 'counter'
  id: string
  label: string
  tagline: string
  manifest: MenuManifest
  nextOrderNumber: number
  scopeKey: string
}

export type MiseboxProductDemo = {
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
    description: 'Switch between a polished restaurant and a bold burger counter in the same touch-first Kiosk.',
    icon: 'i-lucide-monitor-smartphone',
    accent: 'warning',
    highlights: ['Two Kitchen themes', 'Local basket', 'No live submission'],
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
  const [scenarioModule, presentationModule] = await Promise.all([
    import('fireux-kitchens/runtime/demo/kitchen/scenarios'),
    import('fireux-kitchens/runtime/demo/kitchen/presentation'),
  ])
  const menuScenario = scenarioModule.featuredMenuDemoScenario
  const kioskScenario = scenarioModule.featuredKioskDemoScenario
  const serviceScenario = scenarioModule.featuredServiceDemoScenario
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

  return {
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
    'misebox-product-demo',
    loadMiseboxProductDemo,
    { deep: false }
  )

  return {
    ...state,
    experiences,
  }
}
