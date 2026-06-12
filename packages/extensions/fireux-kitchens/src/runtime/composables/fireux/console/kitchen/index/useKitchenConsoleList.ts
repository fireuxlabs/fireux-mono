import { computed, isRef, type Ref } from 'vue'
import { useKitchenCollection } from '../../../firestore/kitchen/fetch/useKitchenCollection'

export type KitchenConsoleTargetIdValue = string | number | null | undefined

type UseKitchenConsoleListOptions = {
  ids?:
    | KitchenConsoleTargetIdValue[]
    | Ref<KitchenConsoleTargetIdValue[] | null | undefined>
    | null
}

const normalize = (value: unknown) => String(value ?? '').trim()

/**
 * Console Kitchen read-many seam.
 *
 * Reads Kitchen console targets from the canonical Kitchen collection.
 * Target source policy decides which of these records the console should show.
 */
export function useKitchenConsoleList(options: UseKitchenConsoleListOptions = {}) {
  const rawIds = computed(() =>
    isRef(options.ids) ? options.ids.value : options.ids
  )
  const collectionIds = computed(() =>
    Array.isArray(rawIds.value)
      ? rawIds.value.map((id) => normalize(id)).filter(Boolean)
      : undefined
  )
  const rootCollection = useKitchenCollection({ ids: collectionIds })
  const kitchens = computed(() => rootCollection.kitchens.value)
  const count = computed(() => kitchens.value.length)

  return {
    kitchens,
    count,
    pending: rootCollection.pending,
  }
}
