import { useRoute } from '#imports'
import { computed } from 'vue'
import type { KitchenMiseTask } from '../../../../../../models/kitchen/mise.model'
import { useKitchenConsoleMise } from './useKitchenConsoleMise'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleMiseTask() {
  const route = useRoute()
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

  const miseId = computed(() => {
    const raw = route.params.miseId
    return normalizeString(Array.isArray(raw) ? raw[0] : raw)
  })

  const task = computed<KitchenMiseTask | null>(
    () =>
      miseTasks.value.find((item) => normalizeString(item?.id) === miseId.value) ??
      null
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
