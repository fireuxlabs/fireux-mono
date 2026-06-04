import { computed, isRef } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAuthority'
import {
  readRuntimeFirestoreDatabaseId,
  readRuntimeSimulationFirestoreDatabaseId,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
  type ConsoleHeaderSelectorItem,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleHeader'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  useKitchenCollection,
  type KitchenCollectionFilter,
} from '../../firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import { type KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import { KitchenStorage } from '../../../../models/kitchen.model'
import { resolveKitchenConsoleCollectionPath } from './operations/collections/useKitchenChildCollection'
import type { Ref } from 'vue'

type KitchenConsoleMode = ConsoleMode
type KitchenConsoleEntity = KitchenSurface
type UseKitchenConsoleOptions = {
  filter?: KitchenCollectionFilter | Ref<KitchenCollectionFilter | null | undefined> | null
}

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
  const userId = computed(() => normalizeString(uid.value))
  const liveFilter = computed<KitchenCollectionFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? options.filter.value ?? {}
      : options.filter ?? {}

    return {
      ...explicitFilter,
      operatorId: userId.value,
    }
  })
  const { kitchens: liveKitchens } = useKitchenCollection({
    filter: liveFilter,
  })
  const { kitchens: demoKitchens } = useKitchenCollection({ source: 'demo' })
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
        : resolveKitchenConsoleCollectionPath(appId)
  )
  const canWrite = computed(() => {
    if (selectedMode.value === 'demo') return false
    if (selectedMode.value === 'test') return Boolean(userId.value && kitchenId.value === userId.value)
    return targetHasOperator(selectedKitchen.value, userId.value)
  })
  const clearSelectedKitchen = () => {
    clearSelection()
  }
  const selectKitchen = (kitchenId: string, mode: KitchenConsoleMode = 'live') => {
    selectEntity(kitchenId, mode)
  }
  const kitchenName = (kitchen: KitchenConsoleEntity | null | undefined) =>
    normalizeString((kitchen as Record<string, unknown> | null)?.display_name) ||
    normalizeString(kitchen?.name) ||
    normalizeString((kitchen as Record<string, unknown> | null)?.slug) ||
    'Kitchen'
  const kitchenImage = (kitchen: KitchenConsoleEntity | null | undefined) =>
    normalizeString((kitchen as Record<string, unknown> | null)?.display_image_url) ||
    normalizeString(kitchen?.image_url) ||
    undefined
  const selectorItem = (
    kitchen: KitchenConsoleEntity,
    mode: KitchenConsoleMode
  ): ConsoleHeaderSelectorItem => {
    const id = normalizeString(kitchen?.id)

    return {
      label: kitchenName(kitchen),
      icon: mode === 'live'
        ? 'i-lucide-store'
        : mode === 'test'
          ? 'i-lucide-flask-conical'
          : 'i-lucide-sparkles',
      disabled: !id,
      onSelect: () => {
        if (id) selectKitchen(id, mode)
      },
    }
  }
  const selectorItems = computed<ConsoleHeaderSelectorItem[][]>(() => {
    const groups: ConsoleHeaderSelectorItem[][] = []
    const live = liveKitchens.value.filter((kitchen) => normalizeString(kitchen?.id))

    if (live.length) {
      groups.push(live.map((kitchen) => selectorItem(kitchen, 'live')))
    }

    if (testKitchen.value && normalizeString(testKitchen.value.id)) {
      groups.push([selectorItem(testKitchen.value, 'test')])
    }

    const demo = demoKitchens.value.filter((kitchen) => normalizeString(kitchen?.id))
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
      subtitle: normalizeString((kitchen as any).tagline) || undefined,
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
    rootCollection,
    databaseId,
    canWrite,
    clearSelectedKitchen,
    selectKitchen,
  }
}
