import { ItemStorage, type Item } from '../models/item.model'
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
    const items: Item[] = []
    const invalidItems: { id: string; name: string; error: string }[] = []
    if (collection.outcome.value === 'ready') {
      for (const entry of collection.items.value) {
        const identity = readItemIdentity(entry.id, entry)
        try {
          items.push({ ...identity, ...readItemSellingTerms(entry) })
        } catch (cause) {
          const error = cause instanceof Error ? cause.message : String(cause)
          invalidItems.push({ id: identity.id, name: identity.name, error })
        }
      }
    }
    return { items, invalidItems }
  })
  const items = computed(() => decoded.value.items)
  const invalidItems = computed(() => decoded.value.invalidItems)
  // Historical catalogue and Menu editors still need the legacy row fields.
  const dishes = computed<ItemCollectionRow[]>(() =>
    collection.items.value.map((entry) => normalizeItem(entry))
  )
  return { ...collection, items, invalidItems, dishes }
}
