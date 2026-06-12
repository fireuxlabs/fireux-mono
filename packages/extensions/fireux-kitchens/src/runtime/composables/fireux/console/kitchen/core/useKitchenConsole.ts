import { computed, isRef, type Ref } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAuthority'
import { resolveConsoleEntityAppId } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  useKitchenConsoleList,
  type KitchenConsoleListFilter,
} from '../index/useKitchenConsoleList'
import type { KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { resolveKitchenScopeCollectionPath } from '../../../firestore/kitchen/utils/paths/useKitchenChildCollection'

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
 * This file adapts Kitchen root/app authority targets into the private /console/kitchen selected runtime.
 * It should not own Kitchen child operation records; those live under console/kitchen/operations.
 */
export function useKitchenConsole(
  options: UseKitchenConsoleOptions = {}
) {
  const { appId } = useFireUXConfig()
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const targetFilter = computed<KitchenConsoleListFilter>(() => {
    if (!options.filter) return {}
    return isRef(options.filter) ? options.filter.value ?? {} : options.filter
  })
  const { kitchens: targetKitchens } = useKitchenConsoleList({
    filter: targetFilter,
  })
  const { selectedEntity, selectEntity, clearSelection } =
    useConsole<KitchenSurface>('kitchen', {
    targetItems: targetKitchens,
    getId: (kitchen) => normalizeString(kitchen?.id),
  })
  const selectedKitchen = computed<KitchenConsoleEntity | null>(
    () => selectedEntity.value
  )
  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const activeKitchenAppId = computed(() =>
    resolveConsoleEntityAppId(selectedKitchen.value, appId)
  )
  const databaseId = computed(() =>
    readRuntimeFirestoreDatabaseId() || ''
  )
  const rootCollection = computed(() =>
    resolveKitchenScopeCollectionPath(activeKitchenAppId.value)
  )
  const canWrite = computed(() =>
    targetHasOperator(selectedKitchen.value, userId.value)
  )
  const clearSelectedKitchen = () => {
    clearSelection()
  }
  const selectKitchen = (kitchenId: string) => {
    selectEntity(kitchenId)
  }

  return {
    targetKitchens,
    selectedKitchen,
    kitchenId,
    activeKitchenAppId,
    rootCollection,
    databaseId,
    canWrite,
    clearSelectedKitchen,
    selectKitchen,
  }
}
