import { computed, type Ref } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAuthority'
import { resolveConsoleEntityAppId } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import {
  readRuntimeFirestoreDatabaseId,
  readRuntimeSimulationFirestoreDatabaseId,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { KitchenConsoleListFilter } from '../index/useKitchenConsoleList'
import type { KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import { resolveKitchenScopeCollectionPath } from '../../../firestore/kitchen/utils/paths/useKitchenChildCollection'
import { useKitchenConsoleSources } from './useKitchenConsoleSources'

type KitchenConsoleMode = ConsoleMode
type KitchenConsoleEntity = KitchenSurface
type UseKitchenConsoleOptions = {
  filter?:
    | KitchenConsoleListFilter
    | Ref<KitchenConsoleListFilter | null | undefined>
    | null
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
  const {
    appId,
    userId,
    policy,
    liveKitchens,
    demoKitchens,
    testKitchen,
  } = useKitchenConsoleSources({ filter: options.filter })
  const { selectedEntity, selectedMode, selectEntity, clearSelection } =
    useConsole<KitchenSurface, KitchenSurface, KitchenSurface>('kitchen', {
    liveItems: liveKitchens,
    demoItems: demoKitchens,
    testItem: testKitchen,
    getId: (kitchen) => normalizeString(kitchen?.id),
  })
  const selectedKitchen = computed<KitchenConsoleEntity | null>(
    () => selectedEntity.value
  )
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
  const selectKitchen = (
    kitchenId: string,
    mode: KitchenConsoleMode = 'live'
  ) => {
    selectEntity(kitchenId, mode)
  }

  return {
    liveKitchens,
    demoKitchens,
    testKitchen,
    policy,
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
