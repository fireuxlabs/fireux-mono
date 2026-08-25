import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import type { KitchenMiseTask } from '../../../utils/mise.ts'
import { useKitchenWorkspaceMise } from './useKitchenWorkspaceMise'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenWorkspaceMiseTask() {
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

  const task = computed<KitchenMiseTask | null>(
    () =>
      miseTasks.value.find(
        (item) => normalizeString(item?.id) === miseId.value
      ) ?? null
  )

  const canEditMise = computed(
    () => canWrite.value && Boolean(rootCollection.value && kitchenId.value)
  )

  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    collectionPath: collectionPath.value,
    miseId: miseId.value,
    hasMiseTask: Boolean(task.value),
    pending: pending.value,
    readOnly: readOnly.value,
    canWrite: canWrite.value,
    canEditMise: canEditMise.value,
  }))

  return {
    selectedKitchen,
    kitchenId,
    rootCollection,
    collectionPath,
    readOnly,
    canWrite,
    canEditMise,
    miseTasks,
    pending,
    miseId,
    task,
    miseTask: task,
    debug,
  }
}
