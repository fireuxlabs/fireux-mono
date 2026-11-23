import { ItemStorage } from '../models/item.model'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import { normalizeItem, type ItemCollectionRow } from '../utils/item.ts'
import { readItemSellingTerms } from '../utils/item-pricing'
import { readItemIdentity } from '../utils/item-identity'

import { useKitchenChildCollection } from './useKitchenChildCollection'

type UseKitchenItemCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenItemCollection(
  kitchenId?: string | Ref<string | null | undefined>,
  options: UseKitchenItemCollectionOptions = {}
) {
  const collection = useKitchenChildCollection<
    Record<string, unknown> & { id: string }
  >(
    ItemStorage.collection,
    computed(() => unref(kitchenId) ?? ''),
    options
  )
  const decoded = computed(() => {
    if (collection.outcome.value !== 'ready') return { items: [] }
    try {
      const items = collection.items.value.map((entry) => {
        try {
          return {
            ...readItemIdentity(entry.id, entry),
            ...readItemSellingTerms(entry),
          }
        } catch (cause) {
          const reason = cause instanceof Error ? cause.message : String(cause)
          throw new Error(`Could not read Item "${entry.id}". ${reason}`, { cause })
        }
      })
      return { items }
    } catch (error) {
      return { items: [], error }
    }
  })
  const items = computed(() => decoded.value.items)
  const error = computed(() => collection.error.value ?? decoded.value.error)
  const outcome = computed(() =>
    decoded.value.error ? 'error' : collection.outcome.value
  )
  // Historical catalogue and Menu editors still need the legacy row fields.
  const dishes = computed<ItemCollectionRow[]>(() =>
    collection.items.value.map((entry) => normalizeItem(entry))
  )
  return { ...collection, items, error, outcome, dishes }
}
