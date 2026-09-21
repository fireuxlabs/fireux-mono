import { computed, unref, type Ref } from 'vue'
import { collection } from 'firebase/firestore'
import {
  useCollection,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeKitchenPrepItem } from '../../utils/prep-item'

export function useKitchenPrepItems(
  kitchenId: Ref<string>,
  options: {
    databaseId: Ref<string>
    kitchenCollectionPath: Ref<string>
  }
) {
  const db = useFirestore(options.databaseId)
  const source = computed(() =>
    kitchenId.value
      ? collection(
          db,
          `${unref(options.kitchenCollectionPath)}/${kitchenId.value}/prep-items`
        )
      : null
  )
  const { data, pending, error } = useCollection(source)
  const prepItems = computed(() =>
    (data.value ?? []).map(normalizeKitchenPrepItem)
  )
  return { prepItems, pending, error }
}
