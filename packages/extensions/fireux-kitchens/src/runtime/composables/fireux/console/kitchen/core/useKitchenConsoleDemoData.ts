// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: lazily adapt owner-local Kitchen fixtures for console use.
import type { MaybeRefOrGetter } from 'vue'
import {
  useConsoleDemoData,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleDemoData'
import type { Place } from 'fireux-places/runtime/models/place.model'
import type { KitchenOrder } from '../../../../../models/kitchen/order.model'
import {
  useKitchenInterface,
  type KitchenSurface,
} from '../../../firestore/kitchen/utils/view/useKitchenInterface'

export type KitchenConsoleDemoScenario = {
  kitchen: KitchenSurface
  place: Place
  orders: KitchenOrder[]
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
            kitchen,
            place: scenario.place,
            orders: [...scenario.orders],
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
