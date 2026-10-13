import { orderBy } from 'firebase/firestore'
import { computed, ref, watch, toValue, type MaybeRefOrGetter } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { useKitchenAccess } from './useKitchenAccess'
import { OrderDraftCollection, readSavedOrderDraft } from '../utils/ordering'

export function useKitchenOrderDraftCollection(
  kitchenId: MaybeRefOrGetter<string>
) {
  const session = useAppSession()
  const config = useFireUXConfig()
  const access = useKitchenAccess()
  const path = computed(() =>
    !session.pending.value &&
    !session.error.value &&
    session.uid.value &&
    session.appUser.value &&
    ['ready', 'empty'].includes(access.outcome.value) &&
    !access.error.value &&
    isFirestoreDocumentId(toValue(kitchenId)) &&
    access.ids.value.includes(toValue(kitchenId))
      ? `kitchens/${toValue(kitchenId)}/${OrderDraftCollection}`
      : ''
  )
  const version = ref(0)
  watch(
    () =>
      JSON.stringify([
        toValue(kitchenId),
        session.uid.value,
        session.appUser.value,
        config.appId,
        session.pending.value,
        session.error.value,
        access.outcome.value,
        access.ids.value,
        access.error.value,
      ]),
    () => {
      version.value++
    },
    { flush: 'sync' }
  )
  const { firestoreCollectionPage } = useFirestoreRead()
  const source = firestoreCollectionPage<Record<string, unknown>>(path, {
    scope: computed(() => String(version.value)),
    constraints: [orderBy('updated.at', 'desc')],
  })
  const projection = computed(() => {
    if (!path.value || !['ready', 'empty'].includes(source.outcome.value))
      return { drafts: [], error: null }
    try {
      return {
        drafts: (source.data.value || []).map((row) =>
          readSavedOrderDraft(String(row.id || ''), row, toValue(kitchenId))
        ),
        error: null,
      }
    } catch {
      return { drafts: [], error: new Error('Saved drafts could not be read.') }
    }
  })
  const error = computed(
    () =>
      session.error.value ||
      access.error.value ||
      (path.value ? source.error.value || projection.value.error : null)
  )
  const outcome = computed(() =>
    error.value
      ? 'error'
      : session.pending.value || access.pending.value
        ? 'pending'
        : !path.value
          ? 'idle'
          : source.outcome.value
  )
  const drafts = computed(() =>
    ['ready', 'empty'].includes(outcome.value) ? projection.value.drafts : []
  )
  return {
    drafts,
    count: computed(() => drafts.value.length),
    error,
    outcome,
    pending: computed(() => outcome.value === 'pending'),
    hasMore: computed(() => Boolean(path.value) && source.hasMore.value),
    loadMore: source.loadMore,
  }
}
