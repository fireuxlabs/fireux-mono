import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import type { KitchenMiseTask } from '../../../../models/mise.model.ts'
import { useKitchenConsoleMise } from './useKitchenConsoleMise'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleMiseItem() {
  const {
    selectedKitchen,
    kitchenId,
    rootCollection,
    collectionPath,
    readOnly,
    canWrite,
    miseTasks,
    pending,
  } = useKitchenConsoleMise()

  const miseId = useRouteParam('miseId')

  const miseTask = computed<KitchenMiseTask | null>(
    () =>
      miseTasks.value.find((item) => normalizeString(item?.id) === miseId.value) ??
      null
  )

  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    collectionPath: collectionPath.value,
    miseId: miseId.value,
    hasMiseTask: Boolean(miseTask.value),
    pending: pending.value,
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedKitchen,
    kitchenId,
    rootCollection,
    collectionPath,
    readOnly,
    canWrite,
    miseTasks,
    pending,
    miseId,
    miseTask,
    debug,
  }
}
