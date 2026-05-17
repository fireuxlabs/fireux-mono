import { useRoute } from '#imports'
import { computed } from 'vue'
import type { KitchenMiseTask } from '../../../../../models/kitchen-mise.model'
import { useKitchenConsoleMise } from './useKitchenConsoleMise'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleMiseItem() {
  const route = useRoute()
  const {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    collectionPath,
    canWrite,
    miseTasks,
    pending,
  } = useKitchenConsoleMise()

  const miseId = computed(() => {
    const raw = route.params.miseId
    return normalizeString(Array.isArray(raw) ? raw[0] : raw)
  })

  const miseTask = computed<KitchenMiseTask | null>(
    () =>
      miseTasks.value.find((item) => normalizeString(item?.id) === miseId.value) ??
      null
  )

  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    collectionPath: collectionPath.value,
    miseId: miseId.value,
    hasMiseTask: Boolean(miseTask.value),
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    collectionPath,
    canWrite,
    miseTasks,
    pending,
    miseId,
    miseTask,
    debug,
  }
}
