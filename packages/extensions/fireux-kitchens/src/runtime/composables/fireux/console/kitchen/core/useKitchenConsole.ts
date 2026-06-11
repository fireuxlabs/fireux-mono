import { computed, isRef } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAuthority'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
  type ConsoleHeaderSelectorItem,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleHeader'
import { resolveConsoleEntityAppId } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import {
  readRuntimeFirestoreDatabaseId,
  readRuntimeSimulationFirestoreDatabaseId,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { getDemoKitchens } from '../../../demo/kitchen/scenarios'
import { useKitchenFetch } from '../../../firestore/kitchen/fetch/useKitchenFetch'
import {
  useKitchenConsoleList,
  type KitchenConsoleListFilter,
} from '../index/useKitchenConsoleList'
import { type KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import { resolveKitchenScopeCollectionPath } from '../../../firestore/kitchen/utils/paths/useKitchenChildCollection'
import type { Ref } from 'vue'

type KitchenConsoleMode = ConsoleMode
type KitchenConsoleEntity = KitchenSurface
type UseKitchenConsoleOptions = {
  filter?: KitchenConsoleListFilter | Ref<KitchenConsoleListFilter | null | undefined> | null
}

type KitchenConsoleHeaderKitchen = Partial<
  Pick<
    KitchenSurface,
    | 'id'
    | 'display_name'
    | 'name'
    | 'slug'
    | 'display_image_url'
    | 'image_url'
    | 'tagline'
  >
>

const kitchenName = (kitchen: KitchenConsoleHeaderKitchen | null | undefined) =>
  normalizeString(kitchen?.display_name) ||
  normalizeString(kitchen?.name) ||
  normalizeString(kitchen?.slug) ||
  'Kitchen'

const kitchenImage = (kitchen: KitchenConsoleHeaderKitchen | null | undefined) =>
  normalizeString(kitchen?.display_image_url) ||
  normalizeString(kitchen?.image_url) ||
  undefined

const modeIcon = (mode: ConsoleMode) =>
  mode === 'live'
    ? 'i-lucide-store'
    : mode === 'test'
      ? 'i-lucide-flask-conical'
      : 'i-lucide-sparkles'

/**
 * FireUX stack family: Console-backed root entity.
 * Entity: Kitchen.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-kitchens/docs/contract.md
 *
 * This file adapts Kitchen root/app authority sources into the private /console/kitchen selected runtime.
 * It should not own Kitchen child operation records; those live under console/kitchen/operations.
 */
export function useKitchenConsole(
  options: UseKitchenConsoleOptions = {}
) {
  const { appId } = useFireUXConfig()
  const { uid } = useAuth()
  const { surface } = useKitchenInterface()
  const userId = computed(() => normalizeString(uid.value))
  const liveFilter = computed<KitchenConsoleListFilter>(() => {
    return isRef(options.filter)
      ? options.filter.value ?? {}
      : options.filter ?? {}
  })
  const { kitchens: liveKitchens } = useKitchenConsoleList({ filter: liveFilter })
  const demoKitchens = computed<KitchenSurface[]>(() =>
    getDemoKitchens()
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
  )
  const { kitchen: testKitchen } = useKitchenFetch(userId, { source: 'test' })
  const { selectedEntity, selectedMode, selectEntity, clearSelection } = useConsole<
    KitchenSurface,
    KitchenSurface,
    KitchenSurface
  >('kitchen', {
    liveItems: liveKitchens,
    demoItems: demoKitchens,
    testItem: testKitchen,
    getId: (kitchen) => normalizeString(kitchen?.id),
  })
  const selectedKitchen = computed<KitchenConsoleEntity | null>(() => selectedEntity.value)
  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const activeKitchenAppId = computed(() =>
    selectedMode.value === 'live'
      ? resolveConsoleEntityAppId(selectedKitchen.value, appId)
      : ''
  )
  const databaseId = computed(() =>
    selectedMode.value === 'live'
      ? readRuntimeFirestoreDatabaseId() || ''
      : selectedMode.value === 'test'
        ? readRuntimeSimulationFirestoreDatabaseId() || ''
        : ''
  )
  const rootCollection = computed(() =>
    selectedMode.value === 'demo'
      ? ''
      : selectedMode.value === 'test'
        ? KitchenStorage.rootCollection
        : resolveKitchenScopeCollectionPath(activeKitchenAppId.value)
  )
  const canWrite = computed(() => {
    if (selectedMode.value === 'demo') return false
    if (selectedMode.value === 'test') {
      return Boolean(userId.value && kitchenId.value === userId.value)
    }
    return targetHasOperator(selectedKitchen.value, userId.value)
  })
  const clearSelectedKitchen = () => {
    clearSelection()
  }
  const selectKitchen = (kitchenId: string, mode: KitchenConsoleMode = 'live') => {
    selectEntity(kitchenId, mode)
  }
  const selectorItem = (
    kitchen: KitchenConsoleHeaderKitchen,
    mode: ConsoleMode
  ): ConsoleHeaderSelectorItem => {
    const id = normalizeString(kitchen.id)

    return {
      label: kitchenName(kitchen),
      icon: modeIcon(mode),
      disabled: !id,
      onSelect: () => {
        if (id) selectKitchen(id, mode)
      },
    }
  }
  const selectorItems = computed<ConsoleHeaderSelectorItem[][]>(() => {
    const groups: ConsoleHeaderSelectorItem[][] = []
    const live = liveKitchens.value.filter((kitchen) =>
      normalizeString(kitchen.id)
    )

    if (live.length) {
      groups.push(live.map((kitchen) => selectorItem(kitchen, 'live')))
    }

    if (testKitchen.value && normalizeString(testKitchen.value.id)) {
      groups.push([selectorItem(testKitchen.value, 'test')])
    }

    const demo = demoKitchens.value.filter((kitchen) =>
      normalizeString(kitchen.id)
    )
    if (demo.length) {
      groups.push(demo.map((kitchen) => selectorItem(kitchen, 'demo')))
    }

    return groups
  })
  const header = computed<ConsoleHeaderData>(() => {
    const kitchen = selectedKitchen.value
    if (!kitchen) return null

    return {
      title: kitchenName(kitchen),
      subtitle: normalizeString(kitchen.tagline) || undefined,
      imageUrl: kitchenImage(kitchen),
      selectorItems: selectorItems.value,
    }
  })
  usePublishConsoleHeader('kitchen', header)

  return {
    liveKitchens,
    demoKitchens,
    testKitchen,
    selectedKitchen,
    selectedMode,
    kitchenId,
    activeKitchenAppId,
    rootCollection,
    databaseId,
    canWrite,
    clearSelectedKitchen,
    selectKitchen,
  }
}
