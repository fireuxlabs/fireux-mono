import { computed, watch } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAuthority'
import { resolveConsoleEntityAppId } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenConsoleTargetSource } from '../index/useKitchenConsoleTargetSource'
import type { KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { resolveKitchenScopeCollectionPath } from '../../../firestore/kitchen/utils/paths/useKitchenChildCollection'

type KitchenConsoleEntity = KitchenSurface

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
export function useKitchenConsole() {
  /*
   * Input:
   * - runtime app config
   * - signed-in user
   * - stored console selection
   *
   * Process:
   * - read the Kitchen target source policy
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
  const targetSource = useKitchenConsoleTargetSource()
  const { selectedEntity, selectEntity, clearSelection } =
    useConsole<KitchenSurface>('kitchen', {
      targetItems: targetSource.targets,
      targetPending: targetSource.pending,
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
  const readOnly = computed(() => targetSource.readOnly.value)
  const canWrite = computed(() =>
    !readOnly.value && targetHasOperator(selectedKitchen.value, userId.value)
  )
  const clearSelectedKitchen = () => {
    clearSelection()
  }
  const selectKitchen = (kitchenId: string) => {
    selectEntity(kitchenId)
  }
  watch(
    targetSource.targets,
    (kitchens) => {
      if (
        selectedKitchen.value ||
        !targetSource.autoSelectSingle.value ||
        kitchens.length !== 1
      ) {
        return
      }

      const onlyKitchenId = normalizeString(kitchens[0]?.id)
      if (onlyKitchenId) selectEntity(onlyKitchenId)
    },
    { immediate: true }
  )
  const kitchens = {
    targets: targetSource.targets,
    count: targetSource.count,
    pending: targetSource.pending,
    source: {
      name: targetSource.sourceName,
      label: targetSource.label,
      readOnly: targetSource.readOnly,
      canCreate: targetSource.canCreate,
      autoSelectSingle: targetSource.autoSelectSingle,
      configKitchenIds: targetSource.configKitchenIds,
      myKitchenIds: targetSource.myKitchenIds,
    },
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
    readOnly,
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
