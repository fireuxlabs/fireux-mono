import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useConsoleIndexPolicy } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndexPolicy'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { getDemoKitchens } from '../../../demo/kitchen/scenarios'
import { useKitchenFetch } from '../../../firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenInterface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import {
  useKitchenConsoleList,
  type KitchenConsoleListFilter,
} from '../index/useKitchenConsoleList'

type UseKitchenConsoleSourcesOptions = {
  filter?:
    | KitchenConsoleListFilter
    | Ref<KitchenConsoleListFilter | null | undefined>
    | null
}

export function useKitchenConsoleSources(
  options: UseKitchenConsoleSourcesOptions = {}
) {
  const { appId } = useFireUXConfig()
  const policy = useConsoleIndexPolicy({ family: 'kitchen' })
  const { uid } = useAuth()
  const { surface } = useKitchenInterface()
  const userId = computed(() => normalizeString(uid.value))
  const liveFilter = computed<KitchenConsoleListFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? options.filter.value ?? {}
      : options.filter ?? {}

    return {
      ...explicitFilter,
      ...(policy.value.appBound ? { scopeAppId: appId } : {}),
    }
  })
  const { kitchens: liveKitchens } = useKitchenConsoleList({
    filter: liveFilter,
  })
  const demoKitchens = computed<KitchenSurface[]>(() =>
    policy.value.showDemo
      ? getDemoKitchens()
          .map((kitchen) =>
            surface({
              kitchen: {
                id: kitchen.id,
                place_id: kitchen.id,
                name: kitchen.name,
                image_url: kitchen.image_url,
              },
              routeScope: 'demo',
            })
          )
          .filter((kitchen): kitchen is KitchenSurface => Boolean(kitchen))
      : []
  )
  const testKitchenId = computed(() =>
    policy.value.showTest ? userId.value : ''
  )
  const { kitchen: testKitchenSource } = useKitchenFetch(testKitchenId, {
    source: 'test',
  })
  const testKitchen = computed<KitchenSurface | null>(
    () =>
      policy.value.showTest
        ? (testKitchenSource.value as KitchenSurface | null)
        : null
  )

  return {
    appId,
    userId,
    policy,
    liveKitchens,
    demoKitchens,
    testKitchen,
  }
}
