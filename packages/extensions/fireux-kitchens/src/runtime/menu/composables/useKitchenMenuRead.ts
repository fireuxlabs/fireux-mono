import { computed, toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import { limit, where } from 'firebase/firestore'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { resolveReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import { resolveKitchenChildCollectionPath } from '../../kitchen/utils/kitchen-collection-path'
import { KitchenMenuStorage, type KitchenMenu } from '../models/kitchen-menu-storage.model'

/** One live KitchenMenu resolved by its routed slug, including archived records. */
export function useKitchenMenuRead(
  kitchenId: MaybeRefOrGetter<string>,
  slug: MaybeRefOrGetter<string>,
  options: {
    kitchenCollectionPath?: MaybeRefOrGetter<string>
    databaseId?: string | Ref<string>
    scope: MaybeRefOrGetter<string>
  }
) {
  const menuSlug = computed(() => String(toValue(slug) || '').trim())
  const collectionPath = computed(() =>
    menuSlug.value
      ? resolveKitchenChildCollectionPath({
          kitchenCollectionPath: toValue(options.kitchenCollectionPath),
          kitchenId: toValue(kitchenId),
          collectionName: KitchenMenuStorage.scopeCollection,
        })
      : ''
  )
  const constraints = computed(() => {
    // Rebind for account/App membership changes even if Kitchen and slug match.
    void toValue(options.scope)
    return [where('slug', '==', menuSlug.value), limit(2)]
  })
  const source = useFirestoreRead({
    databaseId: options.databaseId,
  }).firestoreFetchCollection<KitchenMenu>(collectionPath, constraints)
  const error = computed(
    () =>
      source.error.value ||
      ((source.value?.length ?? 0) > 1
        ? new Error('More than one Menu uses this address.')
        : undefined)
  )
  const outcome = computed(() =>
    resolveReadOutcome({
      active: Boolean(collectionPath.value),
      kind: 'document',
      pending: source.pending.value,
      error: error.value,
      present: source.value?.[0]?.slug === menuSlug.value,
    })
  )
  return {
    menu: computed(() =>
      outcome.value === 'ready' ? (source.value?.[0] ?? null) : null
    ),
    outcome,
    pending: computed(() => outcome.value === 'pending'),
    error,
  }
}
