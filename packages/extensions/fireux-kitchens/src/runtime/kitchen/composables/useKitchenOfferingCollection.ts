import { computed, ref, watch, toValue, type MaybeRefOrGetter } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import { useKitchenAccess } from './useKitchenAccess'
import { readKitchenOfferingRecords } from '../utils/offerings'

export function useKitchenOfferingCollection(
  kitchenId: MaybeRefOrGetter<string>
) {
  const session = useAppSession()
  const config = useFireUXConfig()
  const access = useKitchenAccess()
  const path = computed(() => {
    const id = toValue(kitchenId)
    return !session.pending.value &&
      !session.error.value &&
      session.uid.value &&
      session.appUser.value &&
      ['ready', 'empty'].includes(access.outcome.value) &&
      !access.error.value &&
      isFirestoreDocumentId(id) &&
      access.ids.value.includes(id)
      ? `kitchens/${id}/offerings`
      : ''
  })
  const scopeVersion = ref(0)
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
      scopeVersion.value += 1
    },
    { flush: 'sync' }
  )
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<Record<string, unknown>>(
    path,
    computed(() => {
      void scopeVersion.value
      return []
    })
  )
  const projection = computed(() => {
    if (!path.value || !['ready', 'empty'].includes(source.outcome.value))
      return { data: [], error: null }
    try {
      return {
        data: readKitchenOfferingRecords(
          (source.value || []).map((row) => ({
            id: String(row.id || ''),
            data: row,
          }))
        ),
        error: null,
      }
    } catch {
      return {
        data: [],
        error: new Error('Kitchen offerings could not be read.'),
      }
    }
  })
  const authorityPending = computed(
    () =>
      Boolean(toValue(kitchenId)) &&
      (session.pending.value ||
        access.outcome.value === 'pending' ||
        (session.uid.value && access.outcome.value === 'idle'))
  )
  const authorityError = computed(() =>
    toValue(kitchenId) ? session.error.value || access.error.value : null
  )
  const error = computed(
    () =>
      authorityError.value ||
      (path.value ? source.error.value || projection.value.error : null)
  )
  const outcome = computed(() =>
    authorityError.value
      ? 'error'
      : authorityPending.value
        ? 'pending'
        : !path.value
          ? 'idle'
          : source.outcome.value === 'pending'
            ? 'pending'
            : error.value
              ? 'error'
              : source.outcome.value
  )
  return {
    offerings: computed(() =>
      ['ready', 'empty'].includes(outcome.value) ? projection.value.data : []
    ),
    outcome,
    error,
    pending: computed(() => outcome.value === 'pending'),
  }
}
