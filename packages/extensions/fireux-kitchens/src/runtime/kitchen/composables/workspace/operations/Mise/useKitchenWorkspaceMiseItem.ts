import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import type { KitchenMiseTask } from '../../../../utils/mise.ts'
import { useKitchenWorkspaceMise } from './useKitchenWorkspaceMise'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenWorkspaceMiseItem() {
  const {
    selectedKitchen,
    kitchenId,
    rootCollection,
    collectionPath,
    readOnly,
    canWrite,
    miseTasks,
    pending,
  } = useKitchenWorkspaceMise()

  const miseId = useRouteParam('miseId')

  const miseTask = computed<KitchenMiseTask | null>(
    () =>
      miseTasks.value.find(
        (item) => normalizeString(item?.id) === miseId.value
      ) ?? null
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
