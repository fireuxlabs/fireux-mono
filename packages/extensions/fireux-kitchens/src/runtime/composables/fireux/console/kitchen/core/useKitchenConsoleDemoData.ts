// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: lazily adapt owner-local Kitchen fixtures for console use.
// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: expose one coherent typed Kitchen world to read-only Console adapters.
import type { MaybeRefOrGetter } from 'vue'
import {
  useConsoleDemoData,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleDemoData'
import {
  useKitchenInterface,
  type KitchenSurface,
} from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenDemoScenario } from '../../../../../demo/kitchen/types'

export type KitchenConsoleDemoScenario = Omit<KitchenDemoScenario, 'kitchen'> & {
  kitchen: KitchenSurface
}

export type KitchenConsoleDemoData = {
  kitchens: KitchenSurface[]
  scenarios: KitchenConsoleDemoScenario[]
}

export function useKitchenConsoleDemoData(
  active: MaybeRefOrGetter<boolean>
) {
  const { surface } = useKitchenInterface()

  return useConsoleDemoData<KitchenConsoleDemoData>({
    active,
    loader: async () => {
      const { kitchenDemoScenarios } = await import(
        '../../../../../demo/kitchen/scenarios'
      )
      const scenarios = kitchenDemoScenarios.reduce<KitchenConsoleDemoScenario[]>(
        (items, scenario) => {
          const kitchen = surface({
            kitchen: scenario.kitchen,
            place: scenario.place,
            routeScope: 'demo',
          })
          if (!kitchen) return items

          items.push({
            ...scenario,
            kitchen,
            dishes: [...scenario.dishes],
            menuSections: scenario.menuSections.map(section => ({
              section: section.section,
              items: [...section.items],
            })),
            miseTasks: [...scenario.miseTasks],
            orders: [...scenario.orders],
            stations: [...scenario.stations],
          })
          return items
        },
        []
      )

      return {
        kitchens: scenarios.map((scenario) => scenario.kitchen),
        scenarios,
      }
    },
    isEmpty: (value) => value.kitchens.length === 0,
  })
}

export function findKitchenConsoleDemoScenario(
  data: KitchenConsoleDemoData | undefined,
  kitchenId: string
) {
  const id = String(kitchenId ?? '').trim()
  if (!id) return null

  return data?.scenarios.find((scenario) => scenario.kitchen.id === id) ?? null
}
