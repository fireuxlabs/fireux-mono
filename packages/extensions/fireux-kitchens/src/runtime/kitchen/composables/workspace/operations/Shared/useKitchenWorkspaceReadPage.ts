import { computed, unref, type ComputedRef, type Ref } from 'vue'
import type { KitchenSurface } from '../../../firestore/utils/view/useKitchenInterface'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

type UseKitchenWorkspaceReadPageOptions<T> = {
  collectionName: string
  selectedKitchen: MaybeRef<KitchenSurface | null | undefined>
  kitchenId: MaybeRef<string>
  items: MaybeRef<T[] | null | undefined>
  pending: MaybeRef<boolean | null | undefined>
  collectionPath?: MaybeRef<string | null | undefined>
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenWorkspaceReadPage<T>(
  options: UseKitchenWorkspaceReadPageOptions<T>
) {
  const focus = computed(() => {
    const entity = unref(options.selectedKitchen) ?? null
    const id = normalizeString(unref(options.kitchenId))

    return {
      entity,
      id,
      hasSelection: Boolean(entity),
      name: normalizeString(entity?.name),
    }
  })

  const items = computed<T[]>(() => unref(options.items) ?? [])

  const collection = computed(() => ({
    items: items.value,
    count: items.value.length,
    hasItems: items.value.length > 0,
    pending: Boolean(unref(options.pending)),
  }))

  const readOnly = computed(() => true)

  const debug = computed(() => ({
    focus: focus.value,
    source: 'firestore',
    collectionName: options.collectionName,
    collectionPath: normalizeString(unref(options.collectionPath)),
    count: collection.value.count,
  }))

  return {
    focus,
    collection,
    debug,
    readOnly,
  }
}
