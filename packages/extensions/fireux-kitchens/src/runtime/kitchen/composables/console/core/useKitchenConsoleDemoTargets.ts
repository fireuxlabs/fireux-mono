import type { MaybeRefOrGetter } from 'vue'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import {
  useConsoleDemoData,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleDemoData'
import {
  useKitchenInterface,
  type KitchenSurface,
} from '../../firestore/utils/view/useKitchenInterface'

export type KitchenConsoleDemoTarget = {
  appId: string
  kitchen: KitchenSurface
  place: Place
}

export type KitchenConsoleDemoTargets = {
  kitchens: KitchenSurface[]
  targets: KitchenConsoleDemoTarget[]
}

export function useKitchenConsoleDemoTargets(
  active: MaybeRefOrGetter<boolean>
) {
  const { surface } = useKitchenInterface()

  return useConsoleDemoData<KitchenConsoleDemoTargets>({
    active,
    loader: async () => {
      const { kitchenDemoTargets } = await import(
        '../../../demo/core/targets'
      )
      const targets = kitchenDemoTargets.flatMap<KitchenConsoleDemoTarget>(
        (target) => {
          const kitchen = surface({
            kitchen: target.kitchen,
            place: target.place,
            scope: target.appSupport,
            routeScope: 'demo',
          })
          return kitchen
            ? [{
                appId: target.appId,
                kitchen,
                place: target.place,
              }]
            : []
        }
      )

      return {
        kitchens: targets.map(target => target.kitchen),
        targets,
      }
    },
    isEmpty: value => value.targets.length === 0,
  })
}

export function findKitchenConsoleDemoTarget(
  data: KitchenConsoleDemoTargets | undefined,
  kitchenId: string
) {
  const id = String(kitchenId ?? '').trim()
  if (!id) return null

  return data?.targets.find(target => target.kitchen.id === id) ?? null
}
