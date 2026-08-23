import { computed } from 'vue'
import { collection, query, where, type DocumentData } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'

export function useSupplierWorkspaceAccess() {
  const { appId } = useFireUXConfig()
  const { uid } = useAuth()
  const db = useFirestore()
  const { firestoreQuery } = useFirestoreRead()
  const supportQuery = (field: 'operator_ids' | 'team_ids') =>
    computed(() =>
      appId && uid.value
        ? query(
            collection(db, 'apps', appId, 'suppliers'),
            where(field, 'array-contains', uid.value)
          )
        : null
    )
  const operatorRecords = firestoreQuery<DocumentData>(
    supportQuery('operator_ids')
  )
  const teamRecords = firestoreQuery<DocumentData>(supportQuery('team_ids'))
  const ids = computed(() => [
    ...new Set(
      [...(operatorRecords.value ?? []), ...(teamRecords.value ?? [])]
        .map((record) => String(record.id ?? '').trim())
        .filter(Boolean)
    ),
  ])
  const pending = computed(
    () => operatorRecords.pending.value || teamRecords.pending.value
  )
  const error = computed(
    () => operatorRecords.error.value ?? teamRecords.error.value
  )
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(uid.value)),
    count: computed(() => ids.value.length),
    pending,
    error,
  })

  return { ids, outcome }
}
