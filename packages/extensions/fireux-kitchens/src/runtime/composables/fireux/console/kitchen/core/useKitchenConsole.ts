import { computed, isRef, watch, type Ref } from 'vue'
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
  /*
   * Input:
   * - runtime app config
   * - signed-in user
   * - optional target filter
   * - stored console selection
   *
   * Process:
   * - resolve which Kitchen targets this console should see
   * - connect those targets to the shared console selection cookie
   * - auto-select a single tenant target when there is no selection
   * - derive the selected Kitchen runtime path and write permission
   *
   * Output:
   * - kitchens: target collection for the console index
   * - selection: selected Kitchen state
   * - runtime: selected Kitchen read/write context
   * - actions: select/clear helpers
   */
  const fireux = useFireUXConfig()
  const { appId } = fireux
  const { uid } = useAuth()

  const userId = computed(() => normalizeString(uid.value))
  const targetFilter = computed<KitchenConsoleListFilter>(() => {
    const explicitFilter = options.filter
      ? isRef(options.filter)
        ? options.filter.value ?? {}
        : options.filter
      : {}

    if (explicitFilter.scopeAppId || !fireux.isTenant) return explicitFilter

    return {
      ...explicitFilter,
      scopeAppId: appId,
    }
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
  watch(
    targetKitchens,
    (kitchens) => {
      if (selectedKitchen.value || kitchens.length !== 1) return

      const onlyKitchenId = normalizeString(kitchens[0]?.id)
      if (onlyKitchenId) selectEntity(onlyKitchenId)
    },
    { immediate: true }
  )
  const kitchens = {
    targets: targetKitchens,
  }
  const selection = {
    kitchen: selectedKitchen,
    kitchenId,
    hasSelection: computed(() => Boolean(kitchenId.value)),
  }
  const runtime = {
    appId: activeKitchenAppId,
    rootCollection,
    databaseId,
    canWrite,
  }
  const actions = {
    selectKitchen,
    clearSelectedKitchen,
  }

  return {
    kitchens,
    selection,
    runtime,
    actions,
  }
}
